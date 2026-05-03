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
        const type = (formData.get('type') || 'general') as MediaCategory;
        
        // Handle both single 'file' and multiple 'files'
        let files: File[] = [];
        const singleFile = formData.get('file');
        const multiFiles = formData.getAll('files');

        if (singleFile && singleFile instanceof File) {
            files.push(singleFile);
        }
        
        if (multiFiles && multiFiles.length > 0) {
            multiFiles.forEach(f => {
                if (f instanceof File) files.push(f);
            });
        }

        if (files.length === 0) {
            return NextResponse.json(
                { res: "error", success: false, message: 'No file provided' },
                { status: 400 }
            );
        }

        const uploadResults = [];

        for (const file of files) {
            // Vercel Serverless Function limit is 4.5MB
            const MAX_SIZE = 4.5 * 1024 * 1024; 
            if (file.size > MAX_SIZE) {
                continue; // Skip too large files or handle error
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

            uploadResults.push({
                id: mediaId.toString(),
                url: fileUrl,
                type: fileType,
                category: type,
                fileName: file.name,
                fileSize: size
            });
        }

        if (uploadResults.length === 0) {
            return NextResponse.json(
                { res: "error", success: false, message: 'No valid files uploaded. They might be too large.' },
                { status: 400 }
            );
        }

        // 7. Return Success Response
        return NextResponse.json({
            res: "success",
            success: true,
            message: files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully',
            data: uploadResults.length === 1 ? uploadResults[0] : null,
            files: uploadResults
        });

    } catch (error: any) {
        console.error('File Upload Error:', error);
        return NextResponse.json(
            { res: "error", success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
