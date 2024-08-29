import IUser from "../../domain/entities/user";

interface IUser_repository {
    find_by_email(email: string): Promise<IUser | null>
    create_user(user: IUser): Promise<IUser | null>
    find_by_user_id(user_id: string): Promise<IUser | null>
}

export default IUser_repository