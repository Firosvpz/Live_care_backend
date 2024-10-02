export interface Schedule {
  description: string;
  from: Date;
  to: Date;
  title: string;
  status: "open" | "booked";
  price: number;
  services: string[];
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
