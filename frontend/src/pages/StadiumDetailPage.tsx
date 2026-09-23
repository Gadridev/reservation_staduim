import { Link, useParams } from "react-router-dom";
import { StadiumGallery } from "../features/stadium/components/StadiumGallery";
import { StadiumHeader } from "../features/stadium/components/StadiumHeader";
import { FacilitiesList } from "../features/stadium/components/FacilitiesList";
import { WorkingHoursTable } from "../features/stadium/components/WorkingHoursTable";
import { PolicyNotice } from "../features/stadium/components/PolicyNotice";
import { ReviewsList } from "../features/stadium/components/ReviewsList";
import { BookingPanel } from "../features/stadium/components/BookingPanel";
import { EmptyState } from "../components/ui/States";
import { useStadium } from "../features/stadium/hooks/useStadium";
import { useImageStadium } from "../features/stadium/hooks/useImageStadium";
import { useReviewsStadium } from "../features/stadium/hooks/useReviewStadium";
import { StadiumDetailSkeleton } from "../features/stadium/components/StadiumDetailSkeleton";

export function StadiumDetailPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const {isLoading,data}=useStadium(stadiumId as string)
  const {isLoading:isImage,data:image}=useImageStadium(stadiumId as string)
  const {isLoading:isReviewing,data:reviews}=useReviewsStadium(stadiumId as string)
  if(isLoading || isImage || isReviewing){
    return <StadiumDetailSkeleton />
  }




  const stadium=data;



  if (!stadium) {
    return (
      <div className="mx-auto max-w-[760px] px-7 py-16">
        <EmptyState
          icon="🏟️"
          title="Stadium not found"
          description="This stadium may have been removed or the link is incorrect."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-7 py-6 pb-20">
      <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-ink">
        ← Back to results
      </Link>

      <div className="mb-6">
        <StadiumGallery images={image} />
      </div>

      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <StadiumHeader
            name={stadium.name}
            address={stadium.location.address}
            rating={stadium.averageRating}
            reviewCount={reviews?.length ?? 0}
          />

          <FacilitiesList facilities={stadium.amenities} />

          <p className="mb-7 text-[14.5px] leading-relaxed text-ink/85">{stadium.description}</p>

          <WorkingHoursTable hours={stadium.workingHours} />

          <PolicyNotice title="Cancellation policy">Free cancellation up to 2 hours before kickoff. Cancellations within 2 hours may be charged according to Malaab's cancellation policy</PolicyNotice>

          <ReviewsList reviews={reviews ?? []} />
        </div>

        <BookingPanel stadiumId={stadiumId} pricePerHour={stadium.pricePerHour} />
      </div>
    </div>
  );
}
