import { Avatar } from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/States";
import type { ReviewList } from "../api";

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="font-mono text-xs text-amber-deep"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function ReviewItem({ review }: { review: ReviewList }) {
  return (
    <div className="flex gap-3 border-b border-line py-4 last:border-b-0">
      <Avatar name={review.playerId.firstName} size="sm" />
      <div>
        <p className="text-[13.5px] font-bold text-ink">{review.playerId.firstName}</p>
        <div className="mb-1.5 mt-0.5">
          <StarRating rating={review.rating} />
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink/80">
          {review.comment}
        </p>
      </div>
    </div>
  );
}
interface ReviewsListProps {
  reviews: ReviewList[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  return (
    <section>
      <h2 className="font-display mb-4 text-[22px] font-black uppercase tracking-wide text-ink">
        What players are saying
      </h2>
      {reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          description="Be the first to play and leave one."
        />
      ) : (
        reviews.map((review) => (
          <ReviewItem
            key={`${review.bookingId}-${review.createdAt}`}
            review={review}
          />
        ))
      )}
    </section>
  );
}
