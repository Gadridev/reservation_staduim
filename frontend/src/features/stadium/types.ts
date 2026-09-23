
export interface Stadium {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  amenities: string[];
  pricePerHour: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  primaryImageUrl?: string;
  workingHours?: WorkingHour[];
}

export type CreateStadiumPayload = Pick<
  Stadium,
  "name" | "description" | "location" | "amenities" | "pricePerHour"
>;

export type StadiumFacility =
  | "floodlights"
  | "parking"
  | "showers"
  | "turf"
  | "changing-rooms"
  | "cafe";

export interface WorkingHour {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}
export interface StadiumGalleryProps {
  id: string;
  url:string,
  isPrimary:boolean,
  isDefault:boolean
}
