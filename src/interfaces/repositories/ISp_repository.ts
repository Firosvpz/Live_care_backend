import IService_provider from "../../domain/entities/service_provider";
import ProviderSlot from "../../domain/entities/slot";
import Category from "../../domain/entities/category";
import ScheduledBooking from "../../domain/entities/booking";

interface IServiceProviderRepository {
  findByEmail(email: string): Promise<IService_provider | null>;
  findById(id: string): Promise<IService_provider | null>;
  saveServiceProvider(
    serviceProvider: IService_provider,
  ): Promise<IService_provider | null>;
  saveServiceProviderDetails(
    ServiceProviderDetails: IService_provider,
  ): Promise<IService_provider | null>;
  editProfile(
    serviceProviderId: string,
    details: IService_provider,
  ): Promise<void>;
  updatePassword(
    serviceProviderId: string,
    password: string,
  ): Promise<void | null>;
  saveProviderSlot(slotData: ProviderSlot): Promise<ProviderSlot | null>;
  getDomains(): Promise<Category[] | null>;
  getProviderSlots(
    serviceProviderId: string,
    page: number,
    limit: number,
    searchQuery: string,
  ): Promise<{ slots: ProviderSlot[] | null; total: number }>;
  findProviderSlot(slotId: string): Promise<any>;
  getScheduledBookings(
    serviceProviderId: string,
    page: number,
    limit: number,
  ): Promise<{ bookings: ScheduledBooking[]; total: number }>;
  updateStatus(bookingId: string, status: string): Promise<any>;
  findBookingById(bookingId: string): Promise<any>;
  cancelBooking(bookingId: string, cancelReason: string): Promise<any>;
 
}

export default IServiceProviderRepository;
