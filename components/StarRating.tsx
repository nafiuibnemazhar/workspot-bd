import { Star, StarHalf } from "lucide-react";

export default function StarRating({ rating }: { rating: number }) {
  // Ensure rating is valid
  const safeRating = Math.max(0, Math.min(5, rating || 0));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = safeRating >= star;
        const isHalf = safeRating >= star - 0.5 && safeRating < star;

        return (
          <div key={star} className="text-yellow-400">
            {isFull ? (
              <Star size={20} fill="currentColor" />
            ) : isHalf ? (
              <StarHalf size={20} fill="currentColor" />
            ) : (
              <Star size={20} className="text-gray-300" />
            )}
          </div>
        );
      })}
      <span className="font-bold text-brand-primary ml-2">
        {safeRating.toFixed(1)}
      </span>
    </div>
  );
}
