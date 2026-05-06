import { NextResponse } from 'next/server';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Authenticate User
        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        // 3. Get Query Parameters and Headers
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const fileType = searchParams.get('type'); // image, video
        const isAiGenerated = searchParams.get('is_ai_generated') === 'true';
        
        const businessId = request.headers.get('X-Business-Id');
        const skip = (page - 1) * limit;

        // 4. Fetch Media Files from Database
        const mediaFiles = await prisma.mediaFile.findMany({
            where: {
                userId: auth.userId,
                ...(category && { mediaCategory: category }),
                ...(fileType && { fileType: fileType }),
                ...(businessId && { businessId: BigInt(businessId) }),
                ...(isAiGenerated && {
                    aiGeneratedContents: {
                        some: {} // Has at least one AI generated content entry
                    }
                }),
            },
            include: {
                aiGeneratedContents: {
                    select: { id: true },
                    take: 1
                },
                postMedia: {
                    include: {
                        post: {
                            include: {
                                platformStatus: {
                                    include: {
                                        platform: {
                                            include: {
                                                media: {
                                                    select: { fileUrl: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                platformsWithThisLogo: {
                    include: {
                        media: {
                            select: { fileUrl: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit
        });

        // 5. Format and Return Response
        const formattedFiles = mediaFiles.map(file => {
            // Collect platform statuses from all posts this media is part of
            const platformMap = new Map<string, any>();

            // From posts
            file.postMedia.forEach(pm => {
                pm.post.platformStatus.forEach(ps => {
                    platformMap.set(ps.platform.name, {
                        platform_id: ps.platform.id.toString(),
                        platform: ps.platform.name,
                        platform_key: ps.platform.nameKey,
                        platform_url: ps.platform.url,
                        platform_icon: ps.platform.media?.fileUrl || null,
                        status: ps.status,
                        post_url: ps.externalPostId
                    });
                });
            });

            // From platform logo relation (if it's a logo)
            file.platformsWithThisLogo.forEach(p => {
                if (!platformMap.has(p.name)) {
                    platformMap.set(p.name, {
                        platform_id: p.id.toString(),
                        platform: p.name,
                        platform_key: p.nameKey,
                        platform_url: p.url,
                        platform_icon: p.media?.fileUrl || null,
                        status: 'active',
                        post_url: null
                    });
                }
            });

            const platformStatuses = Array.from(platformMap.values());

            // Handle metadata if present (like duration for videos)
            let duration = null;
            if (file.tags && typeof file.tags === 'object') {
                const tags: any = file.tags;
                if (tags.duration) duration = tags.duration;
            }

            return {
                id: file.id.toString(),
                url: file.fileUrl,
                type: file.fileType,
                is_ai_generated: file.aiGeneratedContents.length > 0,
                category: file.mediaCategory,
                duration: duration,
                platforms: platformStatuses,
                created_at: file.createdAt.toISOString()
            };
        });

        return NextResponse.json({
            res: "success",
            success: true,
            message: 'Media files fetched successfully',
            data: formattedFiles,
            pagination: {
                page: page,
                limit: limit,
                count: formattedFiles.length
            }
        });

    } catch (error: any) {
        console.error('Fetch Media Files Error:', error);
        return NextResponse.json(
            { res: "error", success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
