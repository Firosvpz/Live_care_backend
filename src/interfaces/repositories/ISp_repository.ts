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
}

export default IServiceProviderRepository;
