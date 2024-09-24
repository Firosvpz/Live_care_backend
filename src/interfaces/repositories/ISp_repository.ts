import IService_provider from "../../domain/entities/service_provider";

interface IServiceProviderRepository {
  findByEmail(email: string): Promise<IService_provider | null>;
  findById(id: string): Promise<IService_provider | null>;
  saveServiceProvider(
    serviceProvider: IService_provider,
  ): Promise<IService_provider | null>;
  saveServiceProviderDetails(
    ServiceProviderDetails: IService_provider,
  ): Promise<IService_provider | null>;
  editProfile(serviceProviderId: string, details: IService_provider): Promise<void>
  updatePassword(serviceProviderId: string, password: string): Promise<void | null>
}

export default IServiceProviderRepository;
