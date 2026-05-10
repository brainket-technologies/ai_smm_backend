import { prisma } from "@/lib/prisma";

export class AIAssistantService {
  /**
   * List all chat sessions for a user.
   */
  static async listSessions(userId: bigint) {
    return await prisma.aIAssistantSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Create a new chat session.
   */
  static async createSession(userId: bigint, businessId?: bigint, title: string = "New Chat") {
    return await prisma.aIAssistantSession.create({
      data: {
        userId,
        businessId,
        title,
      },
    });
  }

  /**
   * Get messages for a specific session.
   */
  static async getMessages(sessionId: bigint, userId: bigint) {
    const session = await prisma.aIAssistantSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) throw new Error("Session not found or unauthorized.");

    return await prisma.aIAssistantMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Save a message to a session.
   */
  static async saveMessage(sessionId: bigint, role: 'user' | 'assistant', content: string) {
    await prisma.aIAssistantMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    // Update session timestamp
    await prisma.aIAssistantSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Delete a chat session and its messages.
   */
  static async deleteSession(sessionId: bigint, userId: bigint) {
    // Verify ownership
    const session = await prisma.aIAssistantSession.findFirst({
        where: { id: sessionId, userId },
    });

    if (!session) throw new Error("Session not found.");

    // Messages will be deleted via cascade if set up, otherwise manually
    await prisma.aIAssistantMessage.deleteMany({ where: { sessionId } });
    await prisma.aIAssistantSession.delete({ where: { id: sessionId } });
  }
}
