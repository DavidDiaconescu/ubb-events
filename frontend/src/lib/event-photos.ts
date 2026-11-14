import type { EventCategory } from "@/lib/types";

/**
 * Generic event photos from Unsplash (allowed in next.config.ts → images.remotePatterns).
 * Events have no pictures of their own yet, so each category gets a representative one.
 */
export function unsplashPhotoUrl(photoId: string, width = 1920): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

const CATEGORY_PHOTO_IDS: Record<EventCategory, string> = {
  WORKSHOP: "1559223607-a43c990c692c",
  CONFERENCE: "1540575467063-178a50c2df87",
  TRAINING: "1505373877841-8d25f7d46678",
  SOCIAL: "1492684223066-81342ee5ff30",
  COMPETITION: "1475721027785-f74eccf877e2",
  OTHER: "1511578314322-379afb476865",
};

export function categoryPhotoUrl(category: EventCategory, width?: number): string {
  return unsplashPhotoUrl(CATEGORY_PHOTO_IDS[category], width);
}
