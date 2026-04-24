import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { validateApiKey, validateAuth, validateBusinessId } from '@/lib/auth-utils';

export async function POST(request: Request) {
    return NextResponse.json({ message: "Hello from products POST" });
}

export async function GET(request: Request) {
    return NextResponse.json({ message: "Hello from products GET" });
}
