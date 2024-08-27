import IUser from "domain/entities/user";

interface IUser_repository {
    findByEmail(email: string): Promise<IUser | null>
    saveUser(user: IUser): Promise<IUser | null>
    findByUserId(user_id: string): Promise<IUser | null>
}

export default IUser_repository