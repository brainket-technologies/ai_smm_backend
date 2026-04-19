import React from "react";
import { getFeedbacks } from "./actions";
import FeedbackManagementClient from "./FeedbackManagementClient";

export const metadata = {
  title: "User Feedback | Admin Dashboard",
  description: "Manage and respond to user feedback submissions.",
};

export default async function FeedbackPage() {
  const result = await getFeedbacks();
  const initialFeedbacks = result.success ? result.data || [] : [];

  return (
    <div className="container mx-auto">
      <FeedbackManagementClient initialFeedbacks={initialFeedbacks} />
    </div>
  );
}
