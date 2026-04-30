import { validateApiKey, validateAuth } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const apiCheck = validateApiKey(request);
    if (!apiCheck.isValid) return apiCheck.response;

    const auth = await validateAuth(request);
    if (!auth.isValid) return auth.response;

    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userId');
    const userId = auth.userId || (userIdStr ? BigInt(userIdStr) : null);

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    // Count notifications where:
    // 1. (userId = current OR isGlobal = true)
    // 2. State doesn't exist (means unread) OR State exists but isRead = false
    // 3. State doesn't have isDeleted = true

    const count = await prisma.notifications.count({
      where: {
        OR: [{ userId: userId }, { isGlobal: true }],
        states: {
          none: {
            userId: userId,
            OR: [
              { isRead: true },
              { isDeleted: true }
            ]
          }
        }
      }
    });

    return NextResponse.json({ success: true, count });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
