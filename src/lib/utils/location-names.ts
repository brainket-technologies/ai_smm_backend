
import prisma from "@/lib/prisma";

export async function populateLocationNames(item: any) {
  if (item.countryId) {
    const country = await prisma.country.findUnique({
      where: { id: parseInt(item.countryId) }
    });
    if (country) item.countryName = country.name;
  }
  
  if (item.stateId) {
    const state = await prisma.state.findUnique({
      where: { id: parseInt(item.stateId) }
    });
    if (state) item.stateName = state.name;
  }
  
  if (item.cityId) {
    const city = await prisma.city.findUnique({
      where: { id: parseInt(item.cityId) }
    });
    if (city) item.cityName = city.name;
  }
  
  return item;
}

export async function populateLocationNamesList(items: any[]) {
  return Promise.all(items.map(item => populateLocationNames(item)));
}
