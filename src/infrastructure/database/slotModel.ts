import mongoose from "mongoose";
import ProviderSlot from "../../domain/entities/slot";
import { Slot, Schedule,Recurrence } from "../../domain/entities/slot";

const RecurrenceSchema = new mongoose.Schema<Recurrence>({
  frequency: { type: String, required: true },
  daysOfWeek: { type: [String], required: false }, // Optional
});

const ScheduleSchema = new mongoose.Schema<Schedule>(
  {
    description: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["open", "booked"], required: true },
    price: { type: Number, required: true },
    services: { type: [String], required: true },
    recurrence: { type: RecurrenceSchema, required: false },
    
  },
  { _id: true },
);

const SlotSchema = new mongoose.Schema<Slot>({
  date: { type: Date, required: true },
  schedule: { type: [ScheduleSchema], required: true },

});

const ProviderSlotSchema = new mongoose.Schema<ProviderSlot>({
  serviceProviderId: { type: String, required: true },
  slots: { type: [SlotSchema], required: true },
});

const ProviderSlotModel = mongoose.model<ProviderSlot>(
  "BookingSlot",
  ProviderSlotSchema,
);

export { ProviderSlotModel };
