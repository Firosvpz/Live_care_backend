
import bcrypt from 'bcryptjs'
import IHash_password from 'interfaces/utils/IHash_password'

class Hash_password implements IHash_password {
    private default_salt_rounds: number

    constructor(default_salt_rounds: number = 10) {
        this.default_salt_rounds = default_salt_rounds
    }

    // Hash Password 
    async hash(password: string, salt_rounds: number = this.default_salt_rounds): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(salt_rounds)
            const hashed_password = await bcrypt.hash(password, salt)
            return hashed_password
        } catch (error) {
            throw new Error(`Error hashing password ${error}`)
        }
    }

    // Compare Password
    async compare(password: string, hashed_password: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashed_password)
        } catch (error) {
            throw new Error(`Error comparing passwords ${error}`)
        }
    }

    // validate password
    validate_password_strength(password: string): boolean {
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordStrengthRegex.test(password);
    }

}

export default Hash_password