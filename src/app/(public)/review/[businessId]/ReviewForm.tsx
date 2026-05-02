"use client";

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, ExternalLink } from "lucide-react";

interface ReviewFormProps {
  businessId: string;
  businessName: string;
  gmbReviewLink: string | null;
  apiKey: string;
}

const RATING_TAGS: Record<number, string[]> = {
  1: ["Slow Service", "Poor Quality", "Unprofessional", "Expensive", "Dirty"],
  2: ["Could be better", "Average Quality", "Late Response", "Issues with Staff"],
  3: ["Good but needs improvement", "Satisfied", "Clean", "Friendly Staff"],
  4: ["Great Service", "High Quality", "Friendly", "Fast Delivery", "Recommended"],
  5: ["Excellent", "Best Experience", "Professional", "Must Visit", "Value for Money"]
};

const RATING_MESSAGES: Record<number, string> = {
  1: "We're so sorry to hear this. Please tell us what happened.",
  2: "Thank you for your feedback. How can we improve?",
  3: "Glad we met some of your expectations! Any tips for us?",
  4: "Great! Glad you enjoyed your experience. What stood out?",
  5: "Fantastic! We're thrilled you loved it. What was the highlight?"
};

export default function ReviewForm({ businessId, businessName, gmbReviewLink, apiKey }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/public/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'device-type': 'web'
        },
        body: JSON.stringify({
          businessId,
          rating,
          customerName: name,
          comment,
          selectedTags
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in duration-300">
        <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Your feedback helps {businessName} grow and serve you better.
        </p>

        {rating >= 4 && gmbReviewLink && (
          <div className="w-full p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 uppercase tracking-wider">Help us on Google too!</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">Since you loved our service, would you mind sharing your review on Google?</p>
            <a 
              href={gmbReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <span>Write on Google</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Selection */}
      <div className="flex flex-col items-center">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform active:scale-90"
            >
              <Star 
                className={`h-10 w-10 ${(hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-4 animate-in fade-in slide-in-from-top-1">
            {RATING_MESSAGES[rating]}
          </p>
        )}
      </div>

      {rating > 0 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            {RATING_TAGS[rating].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedTags.includes(tag) 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-4">
             <input 
              type="text"
              placeholder="Your Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <textarea 
              placeholder="Write your experience here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
               <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit Review</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
}
