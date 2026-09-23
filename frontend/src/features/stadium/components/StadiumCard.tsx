import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { FacilityIcon } from "./FacilityIcon";
import { getFacilityKey } from "../facilityConfig";
import type { Stadium } from "../types";

interface StadiumCardProps {
  stadium: Stadium;
}

export function StadiumCard({ stadium }: StadiumCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const todayIndex = new Date().getDay();
  const todaySchedule = stadium.workingHours?.find(
    (day) => day.dayOfWeek === todayIndex,
  );

  const openUntil = todaySchedule?.isOpen
    ? todaySchedule.closeTime
    : "Closed";

  const displayRating = stadium.averageRating > 0 ? stadium.averageRating : "New";
  const badgeText = stadium.averageRating >= 4.5 ? "Top rated" : null;

  return (
    <Card hoverable className="overflow-hidden">
      <div
        className="relative h-[150px] w-full bg-pitch-dark/25 bg-cover bg-center"
        style={
          stadium.primaryImageUrl
            ? { backgroundImage: `url(${stadium.primaryImageUrl})` }
            : undefined
        }
      >

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pitch-dark/50" />

        {badgeText && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-amber px-2 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-pitch-dark">
            {badgeText}
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setIsFavorite((prev) => !prev);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-pitch-dark/55 text-cream"
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <span className="absolute bottom-2.5 left-2.5 z-10 rounded-lg bg-pitch-dark px-2.5 py-1 font-mono text-xs font-semibold text-amber">
          {stadium.pricePerHour} DH / hr
        </span>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="text-lg font-bold text-ink truncate mr-2">{stadium.name}</h3>
          <span className="whitespace-nowrap font-mono text-xs font-semibold text-amber-deep">
            ★ {displayRating}
          </span>
        </div>

        <p className="mb-3 flex items-center gap-1 text-xs text-ink-soft">
          📍 {stadium.location?.city}
        </p>

        <div className="mb-3.5 flex gap-2.5 text-turf">
          {stadium.amenities?.map((amenity) => {
            const key = getFacilityKey(amenity);

            return key ? (
              <FacilityIcon key={amenity} facility={key} />
            ) : null;
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-soft">
            {todaySchedule?.isOpen ? `Open until ${openUntil}` : "Closed today"}
          </span>
          <Link
            to={`/stadiums/${stadium._id}`}
            className="rounded-lg border-[1.5px] border-pitch-dark px-4 py-2 text-xs font-bold text-pitch-dark transition-colors hover:bg-pitch-dark hover:text-cream"
          >
            View
          </Link>
        </div>
      </div>
    </Card>
  );
}
