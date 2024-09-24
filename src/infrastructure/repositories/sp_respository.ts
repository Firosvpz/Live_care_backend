import IServiceProviderRepository from "../../interfaces/repositories/ISp_repository";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";
import { logger } from "../../infrastructure/utils/combine_log";

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

  async editProfile(interviewerId: string, details: IService_provider): Promise<void> {
    const { name, phone_number, gender, service, exp_year, qualification } = details
    await service_provider.findByIdAndUpdate(interviewerId, {
      name,
      phone_number,
      gender,
      service,
      exp_year,
      qualification
    })
  }

  async updatePassword(
    serviceProviderId: string,

    password: string
  ): Promise<void | null> {
    await service_provider.findByIdAndUpdate(serviceProviderId, {
      password: password,
    });
  }
}
export default ServiceProviderRepository;
