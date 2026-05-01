import { prisma } from '@/lib/prisma';
import axios from 'axios';

export class FestivalService {
  private static BASE_URL = 'https://calendarific.com/api/v2/holidays';

  private static async getApiKeyAndIncrement() {
    const config = await prisma.externalServiceConfig.findUnique({
      where: {
        category_provider: {
          category: 'holiday',
          provider: 'calendarific'
        }
      }
    });

    if (!config || !config.isActive) return null;

    const configObj = (config.config as any) || {};
    const apiKey = configObj.apiKey;

    if (!apiKey) return null;

    // Increment call count
    const newCount = (configObj.callCount || 0) + 1;
    await prisma.externalServiceConfig.update({
      where: { id: config.id },
      data: {
        config: {
          ...configObj,
          callCount: newCount
        }
      }
    });

    return apiKey;
  }

  static async getFestivals(country: string, year: number, state?: string) {
    // 1. Check if we already fetched for this combination
    const fetchLog = await (state 
      ? prisma.festivalFetchLog.findUnique({
          where: {
            country_state_year: {
              country,
              state,
              year,
            }
          }
        })
      : prisma.festivalFetchLog.findFirst({
          where: {
            country,
            state: null,
            year,
          }
        })
    );

    if (fetchLog?.fetched) {
      // 2. Fetch from database
      return await this.getFestivalsFromDb(country, year, state);
    }

    // 3. If not fetched, call external API
    try {
      await this.fetchAndStoreFromCalendarific(country, year, state);
      
      // 4. Update fetch log
      if (state) {
        await prisma.festivalFetchLog.upsert({
          where: {
            country_state_year: {
              country,
              state,
              year,
            }
          },
          create: {
            country,
            state,
            year,
            fetched: true,
          },
          update: {
            fetched: true,
          }
        });
      } else {
        // For national (state: null), we use updateMany or find/create
        const existing = await prisma.festivalFetchLog.findFirst({
          where: { country, state: null, year }
        });
        if (existing) {
          await prisma.festivalFetchLog.update({
            where: { id: existing.id },
            data: { fetched: true }
          });
        } else {
          await prisma.festivalFetchLog.create({
            data: { country, state: null, year, fetched: true }
          });
        }
      }

      // 5. Return from DB
      return await this.getFestivalsFromDb(country, year, state);
    } catch (error: any) {
      console.error('Error in FestivalService:', error.message);
      // If API fails, return whatever is in DB
      return await this.getFestivalsFromDb(country, year, state);
    }
  }

  private static async getFestivalsFromDb(country: string, year: number, state?: string) {
    return await prisma.festival.findMany({
      where: {
        country,
        year,
        OR: [
          { state: null }, // National holidays
          { state: (state || undefined) as any }, // State holidays if state provided
        ]
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  private static async fetchAndStoreFromCalendarific(country: string, year: number, state?: string) {
    const apiKey = await this.getApiKeyAndIncrement();
    if (!apiKey) {
      console.warn('Calendarific API Key not set or service inactive. Skipping fetch.');
      return;
    }

    const params: any = {
      api_key: apiKey,
      country,
      year,
      type: 'national,religious,observance,local,international'
    };

    if (state) {
      // Calendarific expects location in ISO 3166-2 format (e.g., IN-UP)
      params.location = state.includes('-') ? state : `${country}-${state}`;
    }

    const response = await axios.get(this.BASE_URL, { params });

    if (response.data?.response?.holidays) {
      const holidays = response.data.response.holidays;

      for (const holiday of holidays) {
        try {
          const holidayDate = new Date(holiday.date.iso);
          
          const existing = await prisma.festival.findFirst({
            where: {
              name: holiday.name,
              date: holidayDate,
              country,
              state: (state || null) as any,
            }
          });

          if (existing) {
            await prisma.festival.update({
              where: { id: existing.id },
              data: {
                description: holiday.description || '',
                type: holiday.type?.[0] || 'Holiday',
                primaryType: holiday.primary_type || 'Holiday',
              }
            });
          } else {
            await prisma.festival.create({
              data: {
                name: holiday.name,
                description: holiday.description || '',
                date: holidayDate,
                type: holiday.type?.[0] || 'Holiday',
                primaryType: holiday.primary_type || 'Holiday',
                country,
                state: (state || null) as any,
                year,
              }
            });
          }
        } catch (err: any) {
          // Skip duplicates or errors for individual items
          console.error(`Error saving holiday ${holiday.name}:`, err.message);
        }
      }
    }
  }
}
