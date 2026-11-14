import { GraduationCap, type LucideIcon, PartyPopper, Presentation, Sparkles, Trophy, Wrench } from "lucide-react";
import type { EventCategory } from "@/lib/types";

/** One icon per event category, shared by the home page shortcuts and the events filter. */
export const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  WORKSHOP: Wrench,
  CONFERENCE: Presentation,
  TRAINING: GraduationCap,
  COMPETITION: Trophy,
  SOCIAL: PartyPopper,
  OTHER: Sparkles,
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS) as EventCategory[];
