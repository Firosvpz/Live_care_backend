import IServiceProviderRepository from "../../interfaces/repositories/ISp_repository";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";
import { logger } from "../../infrastructure/utils/combine_log";
import { ProviderSlotModel } from "../../infrastructure/database/slotModel";
import ProviderSlot from "../../domain/entities/slot";
// import { Slot,Schedule } from '../../domain/entities/slot';
import Category from "../../domain/entities/category";
import { CategoryModel } from "../../infrastructure/database/categoryModel";
import ScheduledBooking from "../../domain/entities/booking";
import { ScheduledBookingModel } from "../../infrastructure/database/bookingModel";
import users from "../../infrastructure/database/user_model";

class ServiceProviderRepository implements IServiceProviderRepository {
  async findByEmail(email: string): Promise<IService_provider | null> {
    const exist_user = await service_provider.findOne({ email });
    if (!exist_user) {
      logger.error("this user is not exist");
    }
    return exist_user;
  }

  async findById(id: string): Promise<IService_provider | null> {
    const exist_user = await service_provider.findById(id);
    if (!exist_user) {
      logger.error("cannot find user in this userid");
    }
    return exist_user;
  }

  async saveServiceProvider(
    serviceProvider: IService_provider,
  ): Promise<IService_provider | null> {
    const new_sp = new service_provider(serviceProvider);
    const save_sp = await new_sp.save();
    if (!save_sp) {
      logger.error("cannot save this provider");
    }
    return save_sp;
  }

  async saveServiceProviderDetails(
    serviceProviderDetails: IService_provider,
  ): Promise<IService_provider | null> {
    const updatedServiceProvider = await service_provider.findByIdAndUpdate(
      serviceProviderDetails._id,
      serviceProviderDetails,
      { new: true },
    );
    return updatedServiceProvider;
  }

  async editProfile(
    interviewerId: string,
    details: IService_provider,
  ): Promise<void> {
    const { name, phone_number, gender, service, exp_year, qualification } =
      details;
    await service_provider.findByIdAndUpdate(interviewerId, {
      name,
      phone_number,
      gender,
      service,
      exp_year,
      qualification,
    });
  }

  async updatePassword(
    serviceProviderId: string,

    password: string,
  ): Promise<void | null> {
    await service_provider.findByIdAndUpdate(serviceProviderId, {
      password: password,
    });
  }
  async saveProviderSlot(slotData: ProviderSlot): Promise<ProviderSlot | null> {
    const { serviceProviderId, slots } = slotData;

    let providerSlot = await ProviderSlotModel.findOne({ serviceProviderId });

    if (!providerSlot) {
      throw new Error(`Provider slot with id ${serviceProviderId} not found.`);
    }

    // Iterate through new slots to update or add
    slots.forEach((newSlot) => {
      // Ensure newSlot.date is defined
      if (!newSlot.date) {
        throw new Error("New slot date is required.");
      }

      // Find existing slot index by date
      const existingSlotIndex = providerSlot.slots.findIndex(
        (slot) =>
          slot.date.toISOString().split("T")[0] ===
          newSlot.date.toISOString().split("T")[0],
      );

      if (existingSlotIndex === -1) {
        // If slot not found, push new slot
        providerSlot.slots.push(newSlot);
      } else {
        // If slot found, update schedules
        newSlot.schedule.forEach((newSchedule) => {
          // Find existing schedule index by checking overlap with existing schedules
          const existingScheduleIndex = providerSlot.slots[
            existingSlotIndex
          ].schedule.findIndex(
            (schedule) =>
              newSchedule.from < schedule.to && newSchedule.to > schedule.from,
          );

          // If there's no overlap, add the new schedule
          if (existingScheduleIndex === -1) {
            providerSlot.slots[existingSlotIndex].schedule.push(newSchedule);
          } else {
            // If there is an overlap, handle it
            throw new Error("Time slot already taken");
          }
        });
      }
    });

    // Save updated provider slot document
    const savedSlot = await providerSlot.save();
    return savedSlot;
  }

  async getDomains(): Promise<Category[] | null> {
    const domainList = await CategoryModel.find({ isListed: true });
    if (!domainList) throw new Error("Domains not found!");
    return domainList;
  }

  async getProviderSlots(
    serviceProviderId: string,
    page: number,
    limit: number,
    searchQuery: string,
  ): Promise<{ slots: ProviderSlot[]; total: number }> {
    const pipeline: any[] = [
      {
        $match: { serviceProviderId: serviceProviderId.toString() },
      },
      {
        $unwind: "$slots",
      },
    ];

    // console.log(await ProviderSlotModel.aggregate(pipeline));

    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            { "slots.schedule.title": { $regex: searchQuery, $options: "i" } },
            {
              "slots.schedule.services": {
                $elemMatch: { $regex: searchQuery, $options: "i" },
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          _id: "$slots._id",
          date: "$slots.date",
          schedule: "$slots.schedule",
        },
      },
      {
        $sort: { date: -1 },
      },
    );

    const totalPipeline = [...pipeline, { $count: "total" }];
    const [totalResult] = await ProviderSlotModel.aggregate(totalPipeline);
    const total = totalResult ? totalResult.total : 0;

    pipeline.push(
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    );

    const slots = await ProviderSlotModel.aggregate(pipeline);

    return { slots, total };
  }

  async findProviderSlot(slotId: string) {
    return await ProviderSlotModel.findOne({ "slots._id": slotId });
  }

  async getScheduledBookings(
    serviceProviderId: string,
    page: number,
    limit: number,
  ): Promise<{ bookings: ScheduledBooking[]; total: number }> {
    const list = await ScheduledBookingModel.find({
      serviceProviderId: serviceProviderId,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ScheduledBookingModel.find({
      serviceProviderId,
    }).countDocuments();

    if (!list) throw new Error("Bookings are not scheduled");

    return { bookings: list, total };
  }

  async updateStatus(bookingId: string, status: string) {
    console.log("hi", bookingId, status);

    return await ScheduledBookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }, // Return the updated document
    );
  }
  async findBookingById(bookingId: string): Promise<any> {
    console.log("Inside findBookingById:", bookingId);

    const booking = await ScheduledBookingModel.findById(bookingId);
    console.log("Booking retrieved:", booking);
    return booking;
  }

  async cancelBooking(bookingId: string, cancelReason: string): Promise<any> {
    console.log("Inside cancelBooking:", bookingId, cancelReason);

    const booking = await ScheduledBookingModel.findById(bookingId);
    if (!booking) {
      console.log("Booking not found during cancellation");
      throw new Error("Booking not found");
    }

    booking.status = "Refunded";
    booking.EmergencyLeaveReason = cancelReason;
    booking.EmergencyLeaveDate = new Date();

    await booking.save();
    const user = await users.findById(booking.userId);
    if (!user) throw new Error("User not found"); // Ensure user exists

    // Return both the cancelled booking and the user details
    return {
      booking,
      user: {
        name: user.name,
        email: user.email,
      },
    };
  }
}
export default ServiceProviderRepository;
