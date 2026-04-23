import { NextResponse } from 'next/server';
import { validateApiKey, validateAuth } from '@/lib/auth-utils';
import { StorageEngine } from '@/lib/storage-engine';
import { registerMedia, MediaCategory } from '@/lib/media';

export async function POST(request: Request) {
    try {
        // 1. Validate API Key
        const apiCheck = validateApiKey(request);
        if (!apiCheck.isValid) return apiCheck.response;

        // 2. Authenticate User
        const auth = await validateAuth(request);
        if (!auth.isValid) return auth.response;

        // 3. Parse Multi-part Form Data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = (formData.get('type') || 'general') as MediaCategory;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file provided' },
                { status: 400 }
            );
        }

        // Vercel Serverless Function limit is 4.5MB
        const MAX_SIZE = 4.5 * 1024 * 1024; 
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: `File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size on Vercel is 4.5MB. Please compress the image or use a smaller file.` 
                },
                { status: 413 }
            );
        }

        // 4. Prepare File Info
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const mimeType = file.type;
        const size = file.size;
        
        // Determine file type category (image, video, document)
        let fileType: 'image' | 'video' | 'document' = 'document';
        if (mimeType.startsWith('image/')) fileType = 'image';
        else if (mimeType.startsWith('video/')) fileType = 'video';

        // 5. Save Physical File via StorageEngine
        const fileUrl = await StorageEngine.saveFile(buffer, fileName, type, mimeType);

        // 6. Register in Media Database
        const mediaId = await registerMedia({
            fileUrl,
            fileType,
            mimeType,
            mediaCategory: type,
            userId: auth.userId,
            size: size,
        });

        // 7. Return Success Response
        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                id: mediaId.toString(),
                url: fileUrl,
                type: fileType,
                category: type
            }
        });

    } catch (error: any) {
        console.error('File Upload Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
