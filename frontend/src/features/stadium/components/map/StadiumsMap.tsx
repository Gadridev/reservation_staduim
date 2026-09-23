
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Stadium } from "../../types";

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

const DEFAULT_CENTER = { longitude: -6.3498, latitude: 32.3394 };

interface StadiumsMapProps {
  stadiums: Stadium[];
  selectedStadiumId?: string;
  onSelectStadium: (id: string | undefined) => void;
}

export function StadiumsMap({ stadiums, selectedStadiumId, onSelectStadium }: StadiumsMapProps) {
  const mapRef = useRef<MapRef>(null);
  const selectedStadium = stadiums.find((stadium) => stadium._id === selectedStadiumId);

  useEffect(() => {
    if (stadiums.length === 0) return;

    if (stadiums.length === 1) {
      const [longitude, latitude] = stadiums[0].location.coordinates.coordinates;
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14, duration: 0 });
      return;
    }

    mapRef.current?.fitBounds(getBounds(stadiums), { padding: 60, duration: 0 });

  }, [stadiums]);

  useEffect(() => {
    if (!selectedStadiumId) return;

    const stadium = stadiums.find((s) => s._id === selectedStadiumId);
    if (!stadium) return;

    const [longitude, latitude] = stadium.location.coordinates.coordinates;
    mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 14, duration: 1000 });
  }, [selectedStadiumId, stadiums]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: DEFAULT_CENTER.longitude,
        latitude: DEFAULT_CENTER.latitude,
        zoom: 14,
      }}
      mapStyle={MAP_STYLE}
      style={{ width: "100%", height: "100%", borderRadius: "1rem" }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {stadiums.map((stadium) => {
        const [longitude, latitude] = stadium.location.coordinates.coordinates;
        const isActive = stadium._id === selectedStadiumId;

        return (
          <Marker
            key={stadium._id}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
          >
            <button
              type="button"
              aria-label={`Select ${stadium.name} on the map`}
              aria-pressed={isActive}
              onClick={(event) => {
                event.stopPropagation();
                onSelectStadium(stadium._id);
              }}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <MapPin
                className={`h-11 w-11 drop-shadow-lg ${
                  isActive
                    ? "fill-amber text-pitch-dark"
                    : "fill-pitch-dark text-cream"
                }`}
                strokeWidth={1.75}
              />
            </button>
          </Marker>
        );
      })}
      {selectedStadium && (
        <Popup
          longitude={selectedStadium.location.coordinates.coordinates[0]}
          latitude={selectedStadium.location.coordinates.coordinates[1]}
          anchor="bottom"
          offset={36}
          closeOnClick={false}
          onClose={() => onSelectStadium(undefined)}
          maxWidth="260px"
        >
          <div className="min-w-[180px] text-ink">
            <p className="font-bold">{selectedStadium.name}</p>
            <p className="text-sm text-ink-soft">{selectedStadium.location.city}</p>
            <p className="mt-1 text-sm font-semibold text-turf">
              {selectedStadium.pricePerHour} DH / hr
            </p>
            <Link
              to={`/stadiums/${selectedStadium._id}`}
              className="mt-3 inline-block rounded-lg bg-pitch-dark px-3 py-2 text-xs font-bold text-cream"
            >
              View stadium
            </Link>
          </div>
        </Popup>
      )}
    </Map>
  );
}

function getBounds(stadiums: Stadium[]): [[number, number], [number, number]] {
  const [firstLng, firstLat] = stadiums[0].location.coordinates.coordinates;
  let minLng = firstLng;
  let maxLng = firstLng;
  let minLat = firstLat;
  let maxLat = firstLat;

  for (const stadium of stadiums) {
    const [lng, lat] = stadium.location.coordinates.coordinates;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
