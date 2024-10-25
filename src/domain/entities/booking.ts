interface ScheduledBooking {
  _id: string;
  date: Date;
  fromTime: Date;
  toTime: Date;
  description: string;
  title: string;
  price: number;
  serviceProviderId: string;
  userId: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Refunded";
  roomId: string;
  providerRatingAdded: boolean;
  reminderSent: boolean;
  cancellationReason?: string;
  cancellationDate?: Date;
  paymentIntentId: string;
  EmergencyLeaveReason?: string;
  EmergencyLeaveDate?: Date;
  prescription?: string;
}

interface User {
  name: string;
  email: string;
}

export interface AggregatedScheduledBooking extends ScheduledBooking {
  user: User;
}

export default ScheduledBooking;
