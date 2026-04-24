import prisma from '@/lib/prisma';

export class FeedbackService {
  /**
   * Creates a new feedback entry.
   */
  static async createFeedback(userId: bigint, data: { message: string; type: string; rating?: number; subject?: string }) {
    try {
      const feedback = await prisma.feedback.create({
        data: {
          userId,
          message: data.message,
          type: data.type.toLowerCase(),
          rating: data.rating || 5,
          subject: data.subject || `Feedback: ${data.type}`,
          status: 'pending'
        }
      });

      return {
        success: true,
        message: 'Feedback submitted successfully',
        data: JSON.parse(JSON.stringify(feedback, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ))
      };
    } catch (error: any) {
      console.error('Create Feedback Error:', error);
      throw new Error(error.message || 'Failed to submit feedback');
    }
  }

  /**
   * Fetches all feedback entries (for Admin).
   */
  static async getAllFeedback() {
    try {
      const feedbacks = await prisma.feedback.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return JSON.parse(JSON.stringify(feedbacks, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
    } catch (error: any) {
      console.error('Get Feedback Error:', error);
      throw new Error(error.message || 'Failed to fetch feedback');
    }
  }

  /**
   * Updates feedback status (e.g. reviewed, resolved).
   */
  static async updateFeedbackStatus(id: bigint, status: string) {
    try {
      const feedback = await prisma.feedback.update({
        where: { id },
        data: { status }
      });

      return {
        success: true,
        message: 'Feedback status updated',
        data: JSON.parse(JSON.stringify(feedback, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ))
      };
    } catch (error: any) {
      console.error('Update Feedback Status Error:', error);
      throw new Error(error.message || 'Failed to update status');
    }
  }
}
