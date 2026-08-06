import type { LucideIcon } from 'lucide-react-native';
import {
  Briefcase,
  Laptop,
  TrendingUp,
  PiggyBank,
  Wallet,
  Banknote,
  Gift,
  CreditCard,
  Utensils,
  Car,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Popcorn,
  House,
  Coffee,
  Film,
  Music,
  Wifi,
  Smartphone,
  Pill,
  Dumbbell,
  GraduationCap,
  Shirt,
  Wrench,
  Bus,
  Fuel,
  Stethoscope,
  Scissors,
  Sparkles,
  Dog,
  Baby,
  Bike,
  TrainFront,
  Building2,
  Tag,
} from 'lucide-react-native';

// Fixed icon set for the category picker. Keys are what gets stored in
// categories.icon, so they must stay stable once used — the seed migration
// (0001) writes 'briefcase', 'laptop', 'trending-up', 'utensils', 'car',
// 'shopping-bag', 'receipt' and 'popcorn' directly, and those keys must stay
// mapped here.
export const CATEGORY_ICONS: { key: string; Icon: LucideIcon }[] = [
  { key: 'briefcase', Icon: Briefcase },
  { key: 'laptop', Icon: Laptop },
  { key: 'trending-up', Icon: TrendingUp },
  { key: 'piggy-bank', Icon: PiggyBank },
  { key: 'wallet', Icon: Wallet },
  { key: 'banknote', Icon: Banknote },
  { key: 'gift', Icon: Gift },
  { key: 'credit-card', Icon: CreditCard },
  { key: 'utensils', Icon: Utensils },
  { key: 'car', Icon: Car },
  { key: 'shopping-bag', Icon: ShoppingBag },
  { key: 'shopping-cart', Icon: ShoppingCart },
  { key: 'receipt', Icon: Receipt },
  { key: 'popcorn', Icon: Popcorn },
  { key: 'house', Icon: House },
  { key: 'coffee', Icon: Coffee },
  { key: 'film', Icon: Film },
  { key: 'music', Icon: Music },
  { key: 'wifi', Icon: Wifi },
  { key: 'smartphone', Icon: Smartphone },
  { key: 'pill', Icon: Pill },
  { key: 'dumbbell', Icon: Dumbbell },
  { key: 'graduation-cap', Icon: GraduationCap },
  { key: 'shirt', Icon: Shirt },
  { key: 'wrench', Icon: Wrench },
  { key: 'bus', Icon: Bus },
  { key: 'fuel', Icon: Fuel },
  { key: 'stethoscope', Icon: Stethoscope },
  { key: 'scissors', Icon: Scissors },
  { key: 'sparkles', Icon: Sparkles },
  { key: 'dog', Icon: Dog },
  { key: 'baby', Icon: Baby },
  { key: 'bike', Icon: Bike },
  { key: 'train-front', Icon: TrainFront },
  { key: 'building-2', Icon: Building2 },
  { key: 'tag', Icon: Tag },
];

const ICON_MAP = new Map(CATEGORY_ICONS.map((entry) => [entry.key, entry.Icon]));

/** Resolves a stored icon key to its component, falling back to a generic tag. */
export function getCategoryIcon(key: string | null | undefined): LucideIcon {
  return (key && ICON_MAP.get(key)) || Tag;
}

export const DEFAULT_CATEGORY_ICON = 'tag';
