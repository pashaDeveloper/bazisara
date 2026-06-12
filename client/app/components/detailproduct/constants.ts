import { BellRing, Heart, LineChart, Scale } from "lucide-react";

export const REACTIONS = ["Hate", "Dislike", "Neutral", "Like", "Love"] as const;
export const REACTION_LABELS: Record<(typeof REACTIONS)[number], string> = {
  Hate: "متنفرم",
  Dislike: "نپسندیدم",
  Neutral: "معمولی",
  Like: "پسندیدم",
  Love: "عالیه",
};

export const ACTION_ITEMS = [
  { label: "مقایسه", icon: Scale },
  { label: "علاقه‌مندی", icon: Heart },
  { label: "نمودار قیمت", icon: LineChart },
  { label: "اطلاع از تخفیف", icon: BellRing },
] as const;
