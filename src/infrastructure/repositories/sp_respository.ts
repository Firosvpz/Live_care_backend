import IService_provider from "../../domain/entities/service_provider";
import IService_provider_repository from "../../interfaces/repositories/ISp_repository";
import { service_provider } from "../../infrastructure/database/service_provider";

class Service_provider_repository implements IService_provider_repository {
  // create new sp
  async create_service_provider(
    sp: IService_provider,
  ): Promise<IService_provider | null> {
    const new_sp = new service_provider(sp);
    const save_sp = await new_sp.save();
    return save_sp;
  }

  async find_by_email(email: string): Promise<IService_provider | null> {
    const exist_sp = await service_provider.findOne({ email });
    return exist_sp;
  }

  async find_by_id(_id: string): Promise<IService_provider | null> {
    const exist_sp = await service_provider.findById(_id);
    return exist_sp;
  }
  async find_service_provider_by_id(
    _id: string,
  ): Promise<IService_provider | null> {
    const exist_sp_data = await service_provider.findById(_id);
    return exist_sp_data;
  }
}

export default Service_provider_repository;
