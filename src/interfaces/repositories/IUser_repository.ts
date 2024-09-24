import IUser from "../../domain/entities/user";
import IService_provider from '../../domain/entities/service_provider';
interface IUserRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  saveUser(user: IUser): Promise<IUser | null>;
  updatePassword(userId: string, password: string): Promise<void | null> 
  editProfile(userId: string, name: string, phone_number: string): Promise<void>
  getApprovedAndUnblockedProviders(): Promise<IService_provider[]>;
  getServiceProviderDetails(id: string): Promise<IService_provider | null>
}
export default IUserRepository;
