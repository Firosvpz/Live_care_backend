import IUser from "../../domain/entities/user";
import IService_provider from "../../domain/entities/service_provider";
import { IBlog } from "../../domain/entities/blogs";
import ScheduledBooking from "../../domain/entities/booking";
import { IComplaint } from "../../infrastructure/database/complaintModel";
import { IReview } from "../../domain/entities/service_provider";

interface IUserRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  saveUser(user: IUser): Promise<IUser | null>;
  saveUserDetails(UserDetails: IUser): Promise<IUser | null>;
  updatePassword(userId: string, password: string): Promise<void | null>;
  editProfile(
    userId: string,
    name: string,
    phone_number: string,
  ): Promise<void>;
  getApprovedAndUnblockedProviders(): Promise<IService_provider[]>;
  getServiceProviderDetails(id: string): Promise<IService_provider | null>;
  getListedBlogs(
    page: number,
    limit: number,
  ): Promise<{ blogs: IBlog[]; total: number }>;
  getScheduledBookings(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ bookings: ScheduledBooking[] | null; total: number }>;
  getProviderSlotDetails(serviceProviderId: string): Promise<any>;
  findUserByGoogleId(googleId: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  createComplaint(complaint: Partial<IComplaint>): Promise<IComplaint>;
  getComplaintsByUser(userId: string): Promise<IComplaint[]>;
  addReview(
    providerId: string,
    review: IReview,
  ): Promise<IService_provider | null>;
}
export default IUserRepository;
