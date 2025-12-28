"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Star,
  User,
  Loader2,
  Send,
  Trash2,
  Edit2,
  X,
  CheckCircle,
} from "lucide-react";

export default function ReviewSection({ cafeId }: { cafeId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [rating, setRating] = useState<number | "">(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // EDIT MODE STATE
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, [cafeId]);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("cafe_id", cafeId)
      .order("created_at", { ascending: false });

    if (!error) setReviews(data || []);
    setLoading(false);
  }

  // Check if current user has already reviewed
  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;
  // Show form ONLY if: (User hasn't reviewed yet) OR (User is currently editing)
  const showForm = !userReview || editingId !== null;

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchReviews();
      if (editingId === reviewId) resetForm();
    }
  };

  const handleEditClick = (review: any) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    setUserName(review.user_name || "");
    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("review-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const resetForm = () => {
    setEditingId(null);
    setRating(0);
    setComment("");
    setUserName("");
  };

  async function handleSubmit() {
    if (!rating || rating < 1 || rating > 5)
      return alert("Please give a rating between 1 and 5");
    if (!comment.trim()) return alert("Please write a comment");
    if (!user) return alert("You must be logged in");

    setSubmitting(true);

    try {
      if (editingId) {
        // UPDATE EXISTING REVIEW
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: rating,
            comment: comment,
            user_name: userName || "Verified User",
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // CREATE NEW REVIEW
        const { error } = await supabase.from("reviews").insert([
          {
            cafe_id: cafeId,
            user_id: user.id,
            user_name: userName || "Verified User",
            rating: rating,
            comment,
          },
        ]);

        if (error) throw error;
      }

      resetForm();
      fetchReviews();
    } catch (error: any) {
      // Catch the unique constraint error
      if (error.code === "23505") {
        alert("You have already reviewed this workspace!");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-border mt-8">
      <h3 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-3">
        Reviews{" "}
        <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
          {reviews.length}
        </span>
      </h3>

      {/* REVIEWS LIST */}
      <div className="space-y-6 mb-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              No reviews yet. Be the first!
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const isMyReview = user && user.id === review.user_id;

            return (
              <div
                key={review.id}
                className={`pb-6 border-b border-gray-100 last:border-0 transition-opacity ${
                  editingId === review.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-primary text-sm flex items-center gap-2">
                        {review.user_name}
                        {isMyReview && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                            You
                          </span>
                        )}
                      </h4>
                      <div className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Rating + Actions */}
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 flex items-center gap-1">
                      <Star
                        size={12}
                        className="fill-yellow-500 text-yellow-500"
                      />
                      <span className="text-xs font-bold text-yellow-700">
                        {Number(review.rating).toFixed(1)}
                      </span>
                    </div>

                    {/* ACTION BUTTONS (Only for owner) */}
                    {isMyReview && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(review)}
                          className="p-1.5 text-gray-400 hover:text-brand-accent hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Review"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-[52px]">
                  {review.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* FORM AREA */}
      {showForm ? (
        <div
          id="review-form"
          className={`bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all ${
            editingId ? "ring-2 ring-brand-accent shadow-lg bg-white" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-brand-primary">
              {editingId ? "Edit your Review" : "Write a Review"}
            </h4>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <X size={14} /> Cancel Edit
              </button>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              {/* RATING INPUTS */}
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <span className="text-sm font-bold text-gray-600">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-transform hover:scale-110 ${
                        Number(rating) >= star
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    >
                      <Star
                        size={24}
                        className={
                          Number(rating) >= star ? "fill-yellow-500" : ""
                        }
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.1"
                  max="5"
                  min="1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-16 p-1.5 text-center text-sm font-bold rounded-lg border border-gray-300 focus:border-brand-accent outline-none"
                  placeholder="4.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-accent outline-none min-h-[100px]"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50 ${
                    editingId ? "bg-brand-accent" : "bg-brand-primary"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : editingId ? (
                    <Edit2 size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  {editingId ? "Update Review" : "Post Review"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">
                Please login to write a review
              </p>
              <a
                href="/login"
                className="text-brand-accent font-bold hover:underline"
              >
                Login Now
              </a>
            </div>
          )}
        </div>
      ) : (
        /* "ALREADY REVIEWED" BANNER */
        <div className="bg-brand-accent/5 border border-brand-accent/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-brand-accent" size={24} />
            <div>
              <h4 className="font-bold text-brand-primary">
                You have reviewed this space
              </h4>
              <p className="text-sm text-gray-500">
                Thank you for sharing your experience!
              </p>
            </div>
          </div>
          <button
            onClick={() => handleEditClick(userReview)}
            className="text-sm font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            <Edit2 size={14} /> Edit Review
          </button>
        </div>
      )}
    </div>
  );
}
