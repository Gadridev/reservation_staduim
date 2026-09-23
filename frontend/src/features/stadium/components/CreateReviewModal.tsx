import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useCreateReview } from "../hooks/useCreateReview";

interface CreateReviewModalProps {
  bookingId: string;
  stadiumName: string;
  onClose: () => void;
}

export function CreateReviewModal({
  bookingId,
  stadiumName,
  onClose,
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReviewMutation = useCreateReview();

  const canSubmit = rating > 0 && comment.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;

    createReviewMutation.mutate(
      {
        bookingId,
        rating,
        comment: comment.trim(),
      },
      {
        onSuccess: onClose,
      },
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-pitch-dark/65 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-lg rounded-[20px] border border-line bg-cream p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2
              id="review-modal-title"
              className="font-display text-[32px] font-black uppercase leading-none text-ink"
            >
              Leave a Review
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Tell us about your experience at{" "}
              <strong className="text-ink">{stadiumName}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-chalk text-xl text-ink-soft hover:text-ink"
          >
            ×
          </button>
        </div>

        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Rating
          </p>

          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star rating`}
                className={`text-3xl transition-colors ${
                  value <= rating ? "text-amber" : "text-line"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="review-comment"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-soft"
          >
            Comment
          </label>

          <textarea
            id="review-comment"
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Great stadium, well maintained."
            className="w-full resize-none rounded-[12px] border border-line bg-chalk px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-soft/50 focus:border-turf"
          />
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="dark"
            disabled={!canSubmit}
            isLoading={createReviewMutation.isPending}
            onClick={handleSubmit}
          >
            Submit review
          </Button>
        </div>
      </div>
    </div>
  );
}
