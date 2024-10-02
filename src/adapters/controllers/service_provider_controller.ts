import ServiceProviderUsecase from "../../usecases/service_provider_usecase";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../infrastructure/utils/combine_log";
import path from "path";
import fs from "fs";
import ProviderSlot from "../../domain/entities/slot";
import MailService from "../../infrastructure/utils/mail_service";
// import { ProviderSlotModel } from "infrastructure/database/slotModel";

interface Service {
  value: string;
  label: string;
}

class ServiceProviderController {
  constructor(private spUsecase: ServiceProviderUsecase) {
    this.emergencycancelBooking = this.emergencycancelBooking.bind(this);
  }

  async verifyServiceProviderEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const spInfo = req.body;

      const response = await this.spUsecase.findServiceProvider(spInfo);

      if (!response) {
        logger.error("cannot get service provider info");
        return;
      }

      if (response?.status === 200) {
        logger.error("email already exist");
        return;
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({
          success: true,
          data: token,
        });
      }
    } catch (error) {
      console.error("Server error:", error); // Log server errors for debugging
      res
        .status(500)
        .json({ success: false, message: "An error occurred during register" });
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      const { otp } = req.body;

      const serviceProvider = await this.spUsecase.saveServiceProvider(
        token,
        otp,
      );
      if (serviceProvider?.success) {
        const { token } = serviceProvider.data;
        res.cookie("serviceProviderToken", token);
        return res
          .status(201)
          .json({ success: true, data: { token }, message: "Otp verified" });
      } else {
        logger.error("OTP not verified", 400);
        return;
      }
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) {
        logger.error("Unauthorized user", 401);
      }

      const serviceProviderInfo =
        await this.spUsecase.getServiceProviderByToken(token);
      if (!serviceProviderInfo) {
        logger.error("user not found", 404);
      }
      const response =
        await this.spUsecase.findServiceProvider(serviceProviderInfo);

      if (response?.status === 200) {
        logger.error("User already exist", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({
          success: true,
          token,
        });
      }
    } catch (error) {
      next(error);
    }
  }
  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const serviceProvider = await this.spUsecase.serviceProviderLogin(
        email,
        password,
      );
      console.log("sepLog:", serviceProvider);

      if (serviceProvider?.success) {
        res.cookie("serviceProviderToken", serviceProvider.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: "none", // allows cross-site cookie usage
        });
        res.status(200).json(serviceProvider);
      } else {
        res.status(400).json(serviceProvider);
      }
    } catch (error) {
      console.error("Server error:", error); // Log server errors for debugging
      res
        .status(500)
        .json({ success: false, message: "An error occurred during login" });
      next(error);
    }
  }

  async verifyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        email,
        exp_year,
        service,
        specialization,
        qualification,
        rate,
      } = req.body;
      console.log(
        "body",
        name,
        email,
        exp_year,
        specialization,
        service,
        qualification,
        rate,
        req.body,
      );
      console.log("files", req.files);

      const { profile_picture, experience_crt } = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!profile_picture || !experience_crt) {
        logger.error("All files must be uploaded", 400);
      }

      const serviceProviderDetails = {
        ...req.body,
        ...req.files,
        _id: req.serviceProviderId,
      };
      // const serviceProviderId = req.serviceProviderId

      const updatedServiceProvider =
        await this.spUsecase.saveServiceProviderDetails(serviceProviderDetails);
      if (updatedServiceProvider?.success) {
        [profile_picture, experience_crt].forEach((files) => {
          files.forEach((file) => {
            const filepath = path.join(
              __dirname,
              "../../infrastructure/public/images",
              file.filename,
            );
            console.log("filepath", filepath);

            fs.unlink(filepath, (err) => {
              if (err) {
                logger.error("error while deleting files from server ", err);
              }
            });
          });
        });
        return res.status(200).json({
          success: true,
          message: "details verified successfully",
          data: updatedServiceProvider,
        });
      } else {
        logger.error("service provider not found", 404);
      }
    } catch (error) {
      next(error);
    }
  }

  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const welcomeMessage = "Welcome to the home page!";

      return res
        .status(200)
        .json({ success: true, data: { message: welcomeMessage } });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.spUsecase.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getProfileDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId) throw new Error("userId id not found");
      const user = await this.spUsecase.getProfileDetails(serviceProviderId);
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { details } = req.body;
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId) throw new Error("Interviewer id not found");
      if (!details) throw new Error("Details not provided");

      await this.spUsecase.editProfile(serviceProviderId, details);
      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      const { currentPassword, newPassword } = req.body;
      if (!serviceProviderId) throw new Error("interviewer id not found");
      await this.spUsecase.editPassword(
        serviceProviderId,
        currentPassword,
        newPassword,
      );
      return res
        .status(200)
        .send({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  async addProviderSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, description, timeFrom, timeTo, title, price, services } =
        req.body.slotData;
      const Srvc: string[] = (services as Service[]).map(
        (option: Service) => option.value,
      );
      const serviceProviderId = req.serviceProviderId;

      if (!serviceProviderId) {
        throw new Error("Unauthorized user");
      }

      const slotData: ProviderSlot = {
        serviceProviderId,
        slots: [
          {
            date: new Date(date),
            schedule: [
              {
                description,
                from: timeFrom,
                to: timeTo,
                title,
                status: "open",
                price,
                services: Srvc,
              },
            ],
          },
        ],
      };

      const slotAdded = await this.spUsecase.addSlot(slotData);
      return res.status(201).json({
        success: true,
        data: slotAdded,
        message: "Slot added successfully",
      });
    } catch (error: any) {
      console.error("Error adding slot:", error);
    }
  }

  async getProviderSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const searchQuery = req.query.searchQuery
        ? (req.query.searchQuery as string)
        : "";
      const serviceProviderId = req.serviceProviderId;
      if (!serviceProviderId) {
        throw new Error("Unauthorized user");
      }

      const { slots, total } = await this.spUsecase.getProviderSlots(
        serviceProviderId,
        page,
        limit,
        searchQuery,
      );
      return res.status(200).json({
        success: true,
        data: slots,
        total,
        message: "Fetched booking slots list",
      });
    } catch (error) {
      next(error);
    }
  }

  async getDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const domainsList = await this.spUsecase.getDomains();
      return res.status(200).json({
        success: true,
        data: domainsList,
        message: "Fetched domains list",
      });
    } catch (error) {
      next(error);
    }
  }

  async editSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { slotId } = req.params;
      const updatedSlotData = req.body;
      console.log("updatedslot", updatedSlotData);

      const result = await this.spUsecase.editSlot(slotId, updatedSlotData);
      res
        .status(200)
        .json({ message: "Slot updated successfully", updatedSlot: result });
    } catch (error) {
      console.error("Error updating slot:", error);
      next(error);
    }
  }

  async getScheduledBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const serviceProviderId = req.serviceProviderId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!serviceProviderId) throw new Error("Provider not found");
      const { bookings, total } = await this.spUsecase.getScheduledBookings(
        serviceProviderId,
        page,
        limit,
      );
      return res.status(200).json({ success: true, data: bookings, total });
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      console.log("Request:", bookingId, status);
      const updatedBooking = await this.spUsecase.updateBookingStatus(
        bookingId,
        status,
      );
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(200).json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res
        .status(500)
        .json({ message: "Failed to update booking status", error });
    }
  }

  async emergencycancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const { cancelReason } = req.body;

      console.log("bbbbb", bookingId, cancelReason);
      console.log("About to call cancelBookingUseCase");

      const result = await this.spUsecase.cancelBookingUseCase(
        bookingId,
        cancelReason,
      );

      const mailService = new MailService();
      await mailService.sendLeaveMail(
        result.user.name,
        result.user.email,
        cancelReason,
      );

      return res
        .status(200)
        .json({ message: "Booking canceled successfully", result });
    } catch (error) {
      console.log("Error in EmergencycancelBooking:", error);
      return res.status(500).json({ message: "Cancellation failed", error });
    }
  }
}

export default ServiceProviderController;
