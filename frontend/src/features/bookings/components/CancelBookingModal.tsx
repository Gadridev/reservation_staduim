import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { cancelBooking } from "../api";

interface CancelBookingModalProps {
  bookingId: string;
  stadiumName: string;
  onClose: () => void;
}

export function CancelBookingModal({
  bookingId,
  stadiumName,
  onClose,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Booking cancelled.");
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) return;
    cancelMutation.mutate({ bookingId, reason: reason.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-pitch-dark/65 px-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-[20px] border border-line bg-cream p-6 shadow-2xl sm:p-8"
      >
        <h2
          id="cancel-booking-title"
          className="font-display text-[32px] font-black uppercase text-ink"
        >
          Cancel booking
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Give a reason for cancelling your booking at {stadiumName}.
        </p>

        <label
          htmlFor="cancellation-reason"
          className="mt-6 block text-xs font-bold uppercase text-ink-soft"
        >
          Reason
        </label>
        <textarea
          id="cancellation-reason"
          required
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-2 w-full resize-none rounded-[12px] border border-line bg-chalk px-4 py-3 text-sm text-ink outline-none focus:border-turf"
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Keep booking
          </Button>
          <Button
            type="submit"
            variant="dark"
            disabled={!reason.trim()}
            isLoading={cancelMutation.isPending}
          >
            Cancel booking
          </Button>
        </div>
      </form>
    </div>
  );
}
