import mongoose, { Schema } from "mongoose";
import ScheduledBooking from "../../domain/entities/booking";

const ScheduledBookingSchema = new Schema<ScheduledBooking>(
  {
    date: {
      type: Date,
      required: true,
    },
    fromTime: {
      type: Date,
      required: true,
    },
    toTime: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    serviceProviderId: {
      type: String,
      ref: "serviceProvider",
      required: true,
    },
    userId: {
      type: String,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Refunded"],
      default: "Scheduled",
    },
    roomId: {
      type: String,
      required: true,
    },
    providerRatingAdded: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancellationDate: {
      type: Date,
      default: null,
    },
    EmergencyLeaveReason: {
      type: String,
      default: "",
    },
    EmergencyLeaveDate: {
      type: Date,
      default: null,
    },
    prescription: {
      type: String,
      default: "",
    },
    paymentIntentId: { type: String, required: true },
  },
  { timestamps: true },
);

const ScheduledBookingModel = mongoose.model<ScheduledBooking>(
  "SchduledBooking",
  ScheduledBookingSchema,
);

export { ScheduledBookingModel };
