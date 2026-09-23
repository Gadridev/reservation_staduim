
import api from "../../api/client";
import type { CreateStadiumPayload, Stadium, StadiumGalleryProps } from "./types";

export interface ILocation {
  address: string;
  city: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number];
  };
}
export interface IWorkingDay {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
}

export interface StadiumMapItem {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  openUntil: string;
  facilities: StadiumFacility[];
  badge?: "Top rated" | "New";
  isFavorite: boolean;
}

export type StadiumFacility = "floodlights" | "parking" | "showers" | "turf" | "changing-rooms" | "cafe";

export interface WorkingHoursEntry {
  days: string;
  hours: string;
}

export interface StadiumReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
}
export interface StadiumDetail extends StadiumMapItem {
  address: string;
  distanceLabel: string;
  bookingsCompleted: number;
  photoCount: number;
  description: string;
  workingHours: WorkingHoursEntry[];
  cancellationPolicy: string;
  reviews: StadiumReview[];
}
interface User {
  _id: string;
  firstName: string;
  lastName: string;
}
export interface ReviewList {
  playerId: User;
  rating: number;
  comment: string;
  bookingId: string;
  stadiumId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllStadium(): Promise<Stadium[]> {
  const response = await api.get<{ data: Stadium[] }>("/stadiums");
  return response.data.data;
}

export async function getMyStadiums(): Promise<Stadium[]> {
  const response = await api.get<{ data: Stadium[] }>("/stadiums/my");
  return response.data.data;
}

export async function getStadium(id:string){
  const response=await api.get(`stadiums/${id}`)
  return response.data.data;
}
export async function getImageStadium(id: string): Promise<StadiumGalleryProps[]> {
  const response = await api.get<{ data: StadiumGalleryProps[] }>(
    `/stadiums/${id}/images`,
  );
  return response.data.data;
}

export async function uploadStadiumImage(stadiumId: string, image: File): Promise<void> {
  const formData = new FormData();
  formData.append("image", image);

  await api.post(`/stadiums/${stadiumId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function deleteStadiumImage(
  stadiumId: string,
  imageId: string,
): Promise<void> {
  await api.delete(`/stadiums/${stadiumId}/images/${imageId}`);
}
export async function getReviewsStadium(id: string): Promise<ReviewList[]> {
  const response = await api.get<{ data: ReviewList[] }>(`reviews/stadium/${id}`);
  return response.data.data;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
}

export async function createReview(payload: CreateReviewPayload) {
  const response = await api.post("/reviews", payload);
  return response.data;
}

export async function createStadium(
  payload: CreateStadiumPayload,
): Promise<void> {
  await api.post("/stadiums", payload);
}
