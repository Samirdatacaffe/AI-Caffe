export type PricingTab = 'individual' | 'team';

export interface PlanFeature {
  text: string;
}

export interface IndividualPlan {
  id: string;
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  price: string;
  priceNote: string;
  buttonLabel: string;
  featuresTitle?: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

export interface SeatTier {
  label: string;
  price: string;
  note: string;
}

export interface TeamPlan {
  id: string;
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  usersBadge: string;
  seats?: SeatTier[];
  buttonLabel: string;
  featuresTitle?: string;
  features: PlanFeature[];
  highlighted?: boolean;
}
