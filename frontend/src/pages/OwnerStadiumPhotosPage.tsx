import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EmptyState, ErrorState } from "../components/ui/States";
import {
  deleteStadiumImage,
  getImageStadium,
  getMyStadiums,
  uploadStadiumImage,
} from "../features/stadium/api";

export function OwnerStadiumPhotosPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const stadiumsQuery = useQuery({
    queryKey: ["myStadiums"],
    queryFn: getMyStadiums,
  });
  const photosQuery = useQuery({
    queryKey: ["image-stadium", selectedId],
    queryFn: () => getImageStadium(selectedId!),
    enabled: selectedId !== null,
  });

  const upload = useMutation({
    mutationFn: ({ stadiumId, image }: { stadiumId: string; image: File }) =>
      uploadStadiumImage(stadiumId, image),
    onSuccess: (_, { stadiumId }) => {
      void queryClient.invalidateQueries({ queryKey: ["image-stadium", stadiumId] });
      void queryClient.invalidateQueries({ queryKey: ["myStadiums"] });
      toast.success("Photo added.");
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: ({ stadiumId, imageId }: { stadiumId: string; imageId: string }) =>
      deleteStadiumImage(stadiumId, imageId),
    onSuccess: (_, { stadiumId }) => {
      void queryClient.invalidateQueries({ queryKey: ["image-stadium", stadiumId] });
      void queryClient.invalidateQueries({ queryKey: ["myStadiums"] });
      toast.success("Photo deleted.");
    },
    onError: (error) => toast.error(error.message),
  });

  const stadiums = stadiumsQuery.data ?? [];
  const selectedStadium = stadiums.find((stadium) => stadium._id === selectedId);
  const photos = photosQuery.data ?? [];

  return (
    <div className="min-h-screen bg-cream px-7 py-10 sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="font-display text-[44px] font-black uppercase text-ink">
          Stadium Photos
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Manage photos for your stadiums.
        </p>

        <h2 className="mt-10 text-sm font-bold uppercase text-ink-soft">
          Select stadium
        </h2>

        {stadiumsQuery.isPending ? (
          <p className="mt-5 text-ink-soft">Loading stadiums...</p>
        ) : stadiumsQuery.isError ? (
          <ErrorState
            title="Could not load your stadiums"
            onRetry={() => void stadiumsQuery.refetch()}
          />
        ) : stadiums.length === 0 ? (
          <EmptyState title="You have no stadiums yet" />
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stadiums.map((stadium) => (
              <button
                key={stadium._id}
                type="button"
                onClick={() => setSelectedId(stadium._id)}
                className={`overflow-hidden rounded-[18px] border bg-chalk text-left ${
                  selectedId === stadium._id ? "border-turf" : "border-line"
                }`}
              >
                <div className="h-40 bg-pitch-dark/20">
                  {stadium.primaryImageUrl && (
                    <img
                      src={stadium.primaryImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-ink">{stadium.name}</h3>
                  <p className="text-sm text-ink-soft">{stadium.location.city}</p>
                  <span className="mt-4 inline-block rounded-lg bg-pitch-dark px-4 py-2 text-sm font-semibold text-cream">
                    Select
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedStadium && (
          <section className="mt-12">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-[28px] font-black uppercase text-ink">
                Photos — {selectedStadium.name}
              </h2>
              <span className="font-mono text-sm text-ink-soft">
                {photos.length} / 5
              </span>
            </div>

            {photosQuery.isPending ? (
              <p className="mt-5 text-ink-soft">Loading photos...</p>
            ) : photosQuery.isError ? (
              <ErrorState
                title="Could not load photos"
                onRetry={() => void photosQuery.refetch()}
              />
            ) : (
              <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-[14px] bg-chalk"
                  >
                    <img
                      src={photo.url}
                      alt={`${selectedStadium.name} photo`}
                      className="h-full w-full object-cover"
                    />
                    {photo.isPrimary && (
                      <span className="absolute bottom-3 left-3 rounded bg-amber px-2 py-1 text-xs font-bold text-pitch-dark">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Delete photo"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm("Delete this photo?")) {
                          remove.mutate({
                            stadiumId: selectedStadium._id,
                            imageId: photo.id,
                          });
                        }
                      }}
                      className="absolute bottom-3 right-3 rounded bg-pitch-dark/80 px-2 py-1 text-cream disabled:opacity-50"
                    >
                      🗑
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-line bg-chalk text-ink">
                    <span className="text-3xl">+</span>
                    <span className="text-sm font-bold uppercase">
                      {upload.isPending ? "Uploading..." : "Add photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={upload.isPending}
                      className="sr-only"
                      onChange={(event) => {
                        const image = event.target.files?.[0];
                        if (image) {
                          upload.mutate({ stadiumId: selectedStadium._id, image });
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
