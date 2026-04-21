import { NextResponse } from 'next/server';

/**
 * Validates the 'apikey' header against the API_KEY environment variable.
 */
export function validateApiKey(request: Request) {
  const apiKey = request.headers.get('apikey');
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid or missing API Key' },
        { status: 401 }
      ),
    };
  }

  return { isValid: true };
}
