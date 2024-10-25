import IUserRepository from "../../interfaces/repositories/IUser_repository";
import IUser from "../../domain/entities/user";
import users from "../../infrastructure/database/user_model";
import { logger } from "../../infrastructure/utils/combine_log";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";
import { IBlog } from "../../domain/entities/blogs";
import { BlogModel } from "../../infrastructure/database/blogsModel";
import { ProviderSlotModel } from "../../infrastructure/database/slotModel";
import { ScheduledBookingModel } from "../../infrastructure/database/bookingModel";
import ScheduledBooking from "../../domain/entities/booking";
import { Complaint } from "../../infrastructure/database/complaintModel";
import { IComplaint } from "../database/complaintModel";
import { IReview } from "../../domain/entities/service_provider";

class UserRepository implements IUserRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    const exist_user = await users.findOne({ email });
    return exist_user;
  }

  async findUserById(id: string): Promise<IUser | null> {
    const user_data = await users.findById(id);
    if (!user_data) {
      logger.error("cannot find user from this userid");
      throw new Error("user not found");
    }
    return user_data;
  }

  async saveUser(user: IUser): Promise<IUser | null> {
    const new_user = new users(user);
    const save_user = await new_user.save();
    if (!save_user) {
      logger.error("cannot save this user");
    }
    return save_user;
  }

  async findUserByGoogleId(googleId: string): Promise<any> {
    return await users.findOne({ googleId });
  }

  async createUser(userData: any): Promise<any> {
    const user = new users(userData);
    return await user.save();
  }

  async saveUserDetails(userDetails: IUser): Promise<IUser | null> {
    const updatedUser = await users.findByIdAndUpdate(
      userDetails._id,
      userDetails,
      { new: true },
    );
    return updatedUser;
  }

  async updatePassword(userId: string, password: string): Promise<void | null> {
    await users.findByIdAndUpdate(userId, {
      password: password,
    });
  }
  async editProfile(
    userId: string,
    name: string,
    phone_number: string,
  ): Promise<void> {
    await users.findByIdAndUpdate(userId, {
      name: name,
      phone_number: phone_number,
    });
  }

  async getApprovedAndUnblockedProviders(): Promise<IService_provider[]> {
    return service_provider
      .find({ is_approved: "Approved", is_blocked: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getServiceProviderDetails(
    id: string,
  ): Promise<IService_provider | null> {
    const serviceProvidersDetails = await service_provider.findById(id);
    if (!serviceProvidersDetails) {
      throw new Error("ServiceProviders not found");
    }
    return serviceProvidersDetails;
  }

  async getListedBlogs(
    page: number,
    limit: number,
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const skip = (page - 1) * limit;

    // Fetch the blogs from the database
    const [blogs, total] = await Promise.all([
      BlogModel.find({ isListed: true })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
      BlogModel.countDocuments({ isListed: true }),
    ]);

    return { blogs, total };
  }

  async getProviderSlotDetails(serviceProviderId: string): Promise<any> {
    // Fetch basic information about the service provider
    const providerDetails = await service_provider.findById(serviceProviderId, {
      name: 1,
      gender: 1,
      service: 1,
      profile_picture: 1,
      exp_year: 1,
    });

    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfToday = new Date(currentDate.setHours(23, 59, 59, 999));

    // Fetch slots for the service provider
    const bookingSlotDetails = await ProviderSlotModel.aggregate([
      {
        $match: { serviceProviderId: serviceProviderId },
      },
      {
        $unwind: "$slots",
      },
      {
        $unwind: "$slots.schedule",
      },
      {
        $match: {
          $or: [
            // For future days, we just check if the date is after today
            { "slots.date": { $gt: endOfToday } },
            // For today, check if the time is later than the current time
            {
              $and: [
                { "slots.date": { $gte: startOfToday, $lte: endOfToday } },
                { "slots.schedule.from": { $gte: new Date() } }, // Check for upcoming time slots today
              ],
            },
          ],
        },
      },
      {
        $sort: { "slots.date": 1, "slots.schedule.from": 1 }, // Sort by date and time
      },
    ]);

    return {
      providerDetails,
      bookingSlotDetails,
    };
  }

  async bookSlot(info: any): Promise<void> {
    const { serviceProviderId, _id, date } = info;

    try {
      await ProviderSlotModel.findOneAndUpdate(
        {
          serviceProviderId: serviceProviderId,
          "slots.date": date,
          "slots.schedule._id": _id,
        },
        {
          $set: { "slots.$[slotElem].schedule.$[schedElem].status": "booked" },
        },
        {
          arrayFilters: [{ "slotElem.date": date }, { "schedElem._id": _id }],
          new: true,
        },
      );

      return;
    } catch (error) {
      throw error;
    }
  }

  async getScheduledBookings(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ bookings: ScheduledBooking[] | null; total: number }> {
    const bookingList = await ScheduledBookingModel.find({ userId: userId })
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .limit(limit);

    const total = await ScheduledBookingModel.countDocuments({ userId });

    return { bookings: bookingList, total };
  }

  async createComplaint(complaint: IComplaint): Promise<IComplaint> {
    const newComplaint = new Complaint(complaint);
    await newComplaint.save();
    return newComplaint.toObject();
  }

  async getComplaintsByUser(userId: string): Promise<IComplaint[]> {
    return Complaint.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async addReview(
    providerId: string,
    review: IReview,
  ): Promise<IService_provider | null> {
    // console.log('proId', providerId);
    // console.log('review', review);

    try {
      // Fetch the provider by ID
      const provider = await service_provider.findById(providerId);
      // console.log('pro', provider);

      // Check if the provider exists
      if (!provider) {
        console.error(`Provider with ID ${providerId} not found.`);
        throw new Error(`Provider with ID ${providerId} not found.`);
      }

      // Initialize reviews array if it's undefined
      if (!provider.reviews) {
        provider.reviews = [];
      }

      // Push the new review into the reviews array
      provider.reviews.push(review);

      // Update review count
      provider.reviewCount = (provider.reviewCount || 0) + 1;

      // Recalculate rating
      await this.calculateRating(providerId); // Recalculate rating after adding a review

      // Save the updated provider document
      const updatedProvider = await provider.save();

      // Log the updated provider to verify the changes
      console.log("Updated Provider:", updatedProvider);

      return updatedProvider;
    } catch (error: any) {
      // Log the error for debugging
      console.error("Error adding review:", error.message);

      // Return a structured error response
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  async calculateRating(providerId: string): Promise<number> {
    const provider = await service_provider.findById(providerId);
    if (!provider || !provider.reviews || provider.reviews.length === 0)
      return 0;

    const totalRating = provider.reviews?.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    provider.ratingAverage = totalRating / provider.reviews.length;
    await provider.save();

    return provider.ratingAverage;
  }
}

export default UserRepository;
