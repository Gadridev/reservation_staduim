import { useState } from "react";
import { useForm } from "react-hook-form";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Input } from "../../../components/ui/Input";
import { useCreateStadium } from "../../stadium/hooks/useCreateStadium";
import { FacilityIcon } from "../../stadium/components/FacilityIcon";
import { getFacilityKey } from "../../stadium/facilityConfig";

interface CreateStadiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StadiumFormValues {
  name: string;
  description: string;
  address: string;
  city: string;
  amenities: string[];
  pricePerHour: number;
}

const AMENITIES = [
  "Floodlights",
  "Parking",
  "Showers",
  "Turf",
  "Changing rooms",
  "Cafe",
];

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

export function CreateStadiumModal({
  isOpen,
  onClose,
}: CreateStadiumModalProps) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState(false);
  const createStadiumMutation = useCreateStadium();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StadiumFormValues>({
    defaultValues: { amenities: [] },
  });

  function onSubmit(values: StadiumFormValues) {
    if (!location) {
      setLocationError(true);
      return;
    }

    createStadiumMutation.mutate(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        location: {
          address: values.address.trim(),
          city: values.city.trim(),
          coordinates: {
            type: "Point",
            coordinates: location,
          },
        },
        amenities: values.amenities,
        pricePerHour: values.pricePerHour,
      },
      {
        onSuccess: () => {
          reset();
          setLocation(null);
          setLocationError(false);
          onClose();
        },
      },
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-pitch-dark/65 px-4 py-8"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-stadium-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[20px] border border-line bg-cream p-6 shadow-2xl sm:p-8"
        onSubmit={handleSubmit(onSubmit)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2
              id="create-stadium-title"
              className="font-display text-[32px] font-black uppercase leading-none tracking-wide text-ink"
            >
              Add Stadium
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Enter the basic information for your stadium.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close add stadium modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-chalk text-xl text-ink-soft hover:border-ink-soft hover:text-ink"
          >
            ×
          </button>
        </div>

        <div className="mt-7 space-y-5">
          <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
            <Input
              label="Stadium name"
              placeholder="Stadium Al Amal"
              error={errors.name?.message}
              {...register("name", { required: "Stadium name is required" })}
            />
          </div>

          <div>
            <label
              htmlFor="stadium-description"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-ink-soft"
            >
              Description
            </label>
            <textarea
              id="stadium-description"
              rows={4}
              placeholder="A well-lit 5-a-side football stadium"
              className="w-full resize-none rounded-lg border border-line bg-chalk px-4 py-3 text-sm font-semibold text-ink outline-none placeholder:text-ink-soft/50 focus:border-turf"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
              <Input
                label="Address"
                placeholder="Street and neighborhood"
                error={errors.address?.message}
                {...register("address", { required: "Address is required" })}
              />
            </div>

            <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
              <Input
                label="City"
                placeholder="Casablanca"
                error={errors.city?.message}
                {...register("city", { required: "City is required" })}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
              Stadium location
            </p>

            <div className="h-64 overflow-hidden rounded-[12px] border border-line sm:h-72">
              <Map
                initialViewState={{
                  longitude: -7.5898,
                  latitude: 33.5731,
                  zoom: 15,
                }}
                mapStyle={MAP_STYLE}
                style={{ width: "100%", height: "100%" }}
                onClick={(event) => {
                  setLocation([
                    event.lngLat.lng,
                    event.lngLat.lat,
                  ]);
                  setLocationError(false);
                }}
              >
                {location && (
                  <Marker
                    longitude={location[0]}
                    latitude={location[1]}
                    anchor="bottom"
                  >
                    <span className="text-3xl drop-shadow-md" aria-hidden="true">
                      📍
                    </span>
                  </Marker>
                )}
              </Map>
            </div>

            <p className="mt-2 text-sm text-ink-soft">
              {location
                ? "Location selected. Click elsewhere on the map to change it."
                : "Move the map and click where your stadium is located."}
            </p>
            {locationError && (
              <p className="mt-1 text-xs text-danger">
                Click the map to select the stadium location.
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
              Amenities
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {AMENITIES.map((amenity) => {
                const iconKey = getFacilityKey(amenity);

                return (
                  <label
                    key={amenity}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-chalk px-4 py-3 text-sm font-semibold text-ink"
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      className="h-4 w-4 accent-turf"
                      {...register("amenities")}
                    />
                    {iconKey && (
                      <FacilityIcon
                        facility={iconKey}
                        className="h-4 w-4 text-turf"
                      />
                    )}
                    {amenity}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
            <Input
              label="Price per hour"
              type="number"
              min="0"
              placeholder="100"
              error={errors.pricePerHour?.message}
              {...register("pricePerHour", {
                required: "Price per hour is required",
                valueAsNumber: true,
                min: { value: 0, message: "Price cannot be negative" },
              })}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line bg-chalk px-6 py-3 text-sm font-bold text-ink-soft hover:border-ink-soft hover:text-ink"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={createStadiumMutation.isPending}
            className="rounded-[10px] bg-pitch-dark px-6 py-3 text-sm font-bold text-cream hover:bg-pitch disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createStadiumMutation.isPending
              ? "Creating stadium..."
              : "Create stadium"}
          </button>
        </div>
      </form>
    </div>
  );
}
