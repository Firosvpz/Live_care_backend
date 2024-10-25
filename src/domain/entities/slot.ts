export interface Recurrence {
  frequency: string;
  daysOfWeek?: string[];
}

export interface Schedule {
  description: string;
  from: Date;
  to: Date;
  title: string;
  status: "open" | "booked";
  price: number;
  services: string[];
  recurrence?: Recurrence;
}

export interface Slot {
  date: Date;
  schedule: Schedule[];
}

interface ProviderSlot {
  serviceProviderId: string;
  slots: Slot[];
}

export default ProviderSlot;
