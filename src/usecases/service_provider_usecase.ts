import IServiceProviderRepository from "../interfaces/repositories/ISp_repository";
import IMailService from "../interfaces/utils/IMail_service";
import IJwtToken from "../interfaces/utils/IJwt_token";
import IGenerateOtp from "../interfaces/utils/IGenerate_otp";
import IHashPassword from "../interfaces/utils/IHash_password";
import IFileStorageService from "../interfaces/utils/IFile_storage_service";
import { logger } from "../infrastructure/utils/combine_log";
import IService_provider from "../domain/entities/service_provider";
import { CategoryModel } from "../infrastructure/database/categoryModel";
import ProviderSlot from '../domain/entities/slot';

// type DecodedToken = {
//   info: { userId: string };
//   otp: string;
//   iat: number;
//   exp: number;
// }

class ServiceProviderUsecase {
  constructor(
    private spRepository: IServiceProviderRepository,
    private mailService: IMailService,
    private jwtToken: IJwtToken,
    private hashPassword: IHashPassword,
    private generateOtp: IGenerateOtp,
    private fileStorage: IFileStorageService,
  ) {}

  async findServiceProvider(serviceProviderInfo: IService_provider) {
    const serviceProvider = await this.spRepository.findByEmail(
      serviceProviderInfo.email,
    );
    if (serviceProvider) {
      return {
        status: 200,
        data: serviceProvider,
        message: "found service provider",
      };
    } else {
      const otp: string = this.generateOtp.generateOtp();
      const token = this.jwtToken.otpToken(serviceProviderInfo, otp);
      const { name, email } = serviceProviderInfo;
      await this.mailService.sendMail(name, email, otp);
      return {
        status: 201,
        data: token,
        message: "otp generated succesfully",
      };
    }
  }

  async getServiceProviderByToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      logger.error("Invalid token", 400);
      return;
    }
    return decodedToken.info;
  }

  async saveServiceProvider(token: string, otp: string) {
    const decodedToken = await this.jwtToken.verifyJwtToken(token);
    console.log("decodii", decodedToken);

    if (!decodedToken) {
      logger.error("Invalid token", 401);
      return;
    }
    if (otp !== decodedToken.otp) {
      logger.error("Invalid Otp", 401);
      throw new Error(" ");
    }

    const { password } = decodedToken.info;
    const hashedPassword = await this.hashPassword.hash(password);
    // console.log("hashed:", hashedPassword);

    decodedToken.info.password = hashedPassword;
    // console.log("infde:", decodedToken.info);

    const save_sp = await this.spRepository.saveServiceProvider(
      decodedToken.info,
    );

    if (!save_sp) {
      logger.error("Failed to save service provider");
      return;
    }

    const newToken = this.jwtToken.createJwtToken(
      save_sp._id as string,
      "serviceProvider",
    );
    return {
      success: true,
      data: { token: newToken },
    };
  }

  async serviceProviderLogin(email: string, password: string) {
    const serviceProvier = await this.spRepository.findByEmail(email);
    if (!serviceProvier) {
      logger.error("User not found", 404);
      return;
    }

    const passwordMatch = await this.hashPassword.compare(
      password,
      serviceProvier?.password,
    );
    if (!passwordMatch) {
      logger.error("User not found", 404);
      return;
    }

    if (serviceProvier.is_blocked) {
      logger.error("cannot login due to you are in blocked");
      return;
    }

    const token = this.jwtToken.createJwtToken(
      serviceProvier._id as string,
      "serviceProvider",
    );
    return {
      success: true,
      data: {
        token: token,
        hasCompletedDetails: serviceProvier.hasCompletedDetails,
        isApproved: serviceProvier.is_approved,
      },
      message: "Found Service provider",
    };
  }

  async saveServiceProviderDetails(serviceProviderDetails: IService_provider) {
    const { _id, profile_picture, experience_crt } = serviceProviderDetails;
    // console.log("sp:", serviceProviderDetails);

    const serviceProvider = await this.spRepository.findById(_id as string);

    if (!serviceProvider) {
      logger.error("service provider not found", 404);
      return;
    }
    const profilePictureUrl = await this.fileStorage.uploadFile(
      profile_picture,
      "profile_picture",
    );
    console.log("pic:", profilePictureUrl);

    const experienceCrtUrl = await this.fileStorage.uploadFile(
      experience_crt,
      "experience_crt",
    );
    serviceProviderDetails.profile_picture = profilePictureUrl;
    serviceProviderDetails.experience_crt = experienceCrtUrl;
    serviceProviderDetails.hasCompletedDetails = true;

    const updatedServiceProvider =
      await this.spRepository.saveServiceProviderDetails(
        serviceProviderDetails,
      );
    if (!updatedServiceProvider) {
      logger.error("failed to update service provider details", 500);
    }

    return {
      success: true,
      message: "service provider details updated successfully",
      data: updatedServiceProvider,
    };
  }

  async getAllCategories(): Promise<string[]> {
    const categories = await CategoryModel.find({ isListed: true }).select(
      "categoryName",
    );
    return categories.map((category) => category.categoryName);
  }

  async getProfileDetails(userId: string) {
    const user = await this.spRepository.findById(userId);
    return user;
  }

  async editProfile(serviceProviderId: string, details: IService_provider) {
    await this.spRepository.editProfile(serviceProviderId, details);
  }

  async editPassword(
    serviceProviderId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const serviceProvider = await this.spRepository.findById(serviceProviderId);
    if (!serviceProvider) throw new Error("Interviewer not found ");
    const isPasswordMatch = await this.hashPassword.compare(
      oldPassword,
      serviceProvider?.password,
    );
    if (!isPasswordMatch)
      throw new Error(
        "Current password is incorrect. Please check and try again.",
      );

    const hashedPassword = await this.hashPassword.hash(newPassword);
    await this.spRepository.updatePassword(serviceProviderId, hashedPassword);
  }

  async addSlot(slotData: ProviderSlot) {
    const { serviceProviderId, slots } = slotData;
    if (
      !serviceProviderId ||
      !slots ||
      !Array.isArray(slots) ||
      slots.length === 0
    ) {
      throw new Error("Invalid slot data");
    }
    const slotAdded = await this.spRepository.saveProviderSlot(
      slotData
    );
    return slotAdded;
  }

  
  async getProviderSlots(
    serviceProviderId: string,
    page: number,
    limit: number,
    searchQuery: string
  ) {
    const { slots, total } =
      await this.spRepository.getProviderSlots(
        serviceProviderId,
        page,
        limit,
        searchQuery
      );
    return { slots, total };
  }

  async getDomains() {
    const domainList = await this.spRepository.getDomains();
    return domainList;
  }

  
  async editSlot(slotId: string, updatedSlotData: any) {
    const providerSlot = await this.spRepository.findProviderSlot(slotId);
  
    if (!providerSlot) {
      throw new Error('Slot not found in any provider');
    }
  
    const slotIndex = providerSlot.slots.findIndex((s: any) => s._id.toString() === slotId);
  
    if (slotIndex === -1) {
      throw new Error('Slot not found');
    }
  
    const newFrom = new Date(updatedSlotData.from);
    const newTo = new Date(updatedSlotData.to);
    const slotDate = newFrom.toISOString().split('T')[0];
  
    const isDuplicateTimeOnSameDay = providerSlot.slots.some((slot: any, index: number) => {
      if (index !== slotIndex) {
        return slot.schedule.some((schedule: any) => {
          const existingFrom = new Date(schedule.from);
          const existingTo = new Date(schedule.to);
          const existingDate = existingFrom.toISOString().split('T')[0];
      console.log('from',existingFrom);
      console.log('to',existingFrom);
      
          if (existingDate === slotDate) {
            const isOverlapping =
              (newFrom <= existingTo && newTo >= existingFrom) || 
              (newFrom >= existingFrom && newFrom < existingTo) || 
              (newTo > existingFrom && newTo <= existingTo) ||   
              (newFrom <= existingFrom && newTo >= existingTo);    
            return isOverlapping;
          }
  
          return false;
        });
      }
      return false;
    });
  
    if (isDuplicateTimeOnSameDay) {
      throw new Error("Slot time already exists on the same date",);
    }
  
    const updatedSlot = providerSlot.slots[slotIndex];
    updatedSlot.schedule.forEach((schedule: any) => {
      schedule.from = updatedSlotData.from || schedule.from;
      schedule.to = updatedSlotData.to || schedule.to;
      schedule.price = updatedSlotData.price || schedule.price;
      schedule.services = updatedSlotData.services || schedule.services;
      schedule.description = updatedSlotData.description || schedule.description;
      schedule.status = updatedSlotData.status || schedule.status;
    });
    console.log('updated',updatedSlot);
    
    await this.spRepository.saveProviderSlot(providerSlot);
    return updatedSlot;
  }

  async getScheduledBookings(
    serviceProviderId: string,
    page: number,
    limit: number
  ) {
    const { bookings, total } =
      await this.spRepository.getScheduledBookings(
        serviceProviderId,
        page,
        limit
      );
    return { bookings, total };
  }

  async updateBookingStatus(bookingId: string, status: string) {
    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    return await this.spRepository.updateStatus(
      bookingId,
      status
    );
  }
  async cancelBookingUseCase(bookingId: string, cancelReason: string) {
    console.log("Inside cancelBookingUseCase:", bookingId, cancelReason);

    try {
      console.log("Fetching booking by ID:", bookingId);

      const booking = await this.spRepository.findBookingById(
        bookingId
      );
      if (!booking) {
        console.log("Booking not found");
        throw new Error("Booking not found");
      }

      console.log("Booking found:", booking);

      const cancelledBooking =
        await this.spRepository.cancelBooking(
          bookingId,
          cancelReason
        );
      console.log("Booking cancelled:", cancelledBooking);
      return cancelledBooking;
    } catch (error) {
      console.log("Error occurred in cancelBookingUseCase:", error);
      throw error;
    }
  }
}



export default ServiceProviderUsecase;
