import IService_provider from "../../domain/entities/service_provider";
interface IService_provider_repository {
  find_by_email(email: string): Promise<IService_provider | null>;
  find_by_id(_id: string): Promise<IService_provider | null>;
  create_service_provider(
    sp: IService_provider,
  ): Promise<IService_provider | null>;
  find_service_provider_by_id(_id: string): Promise<IService_provider | null>;
}

export default IService_provider_repository;
