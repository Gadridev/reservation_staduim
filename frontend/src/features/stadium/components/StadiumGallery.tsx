import type { StadiumGalleryProps } from "../types";

interface StadiumGallery {
  images: StadiumGalleryProps[];
}

export function StadiumGallery({ images }: StadiumGallery) {

const primaryImage = images.find((img) => img.isPrimary) || images[0];
const secondaryImages = images.filter((img) => img !== primaryImage).slice(0, 2);
  return (
    <div className="grid h-[400px] grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr]">
     {primaryImage ? (
      <div
        className="relative h-full min-h-[200px] rounded-[14px]"
        style={{
          backgroundImage: `url(${primaryImage.url})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <span className="absolute bottom-3.5 right-4 rounded-full bg-pitch-dark/60 px-3 py-1.5 text-xs font-semibold text-cream">
          📷 {images.length} photos
        </span>
      </div>
    ) : (
      <div className="h-full min-h-[200px] rounded-[14px] bg-[repeating-linear-gradient(60deg,var(--color-pitch)_0_20px,var(--color-turf)_20px_40px)]" />
    )}
    <div className="grid grid-rows-2 gap-2.5">
      {Array.from({ length: 2 }).map((_, index) => {
        const image = secondaryImages[index];

        return image ? (
          <div
            key={image.id || index}
            className="h-full w-full rounded-[14px]"
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        ) : (
          <div
            key={`empty-${index}`}
            className="h-full w-full rounded-[14px] bg-[repeating-linear-gradient(60deg,var(--color-pitch)_0_20px,var(--color-turf)_20px_40px)]"
          />
        );
      })}
    </div>
    </div>
  );
}
