
interface IHash_password {
    hash(password: string, salt_rounds?: number): Promise<string>
    compare(password: string, hashed_password: string): Promise<boolean>
    validate_password_strength(password: string): boolean
}

export default IHash_password