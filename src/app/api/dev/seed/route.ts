// Temporary API route to run Prisma Segments
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts', { cwd: process.cwd() });
        return NextResponse.json({ success: true, stdout, stderr });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, stdout: e.stdout, stderr: e.stderr });
    }
}
