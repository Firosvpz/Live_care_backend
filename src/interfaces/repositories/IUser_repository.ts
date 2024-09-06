import IUser from '../../domain/entities/user';

interface IUserRepository {
  findUserByEmail(email:string):Promise <IUser | null>
  findUserById(id:string):Promise <IUser | null>
  saveUser(user:IUser):Promise <IUser | null>
}
export default IUserRepository