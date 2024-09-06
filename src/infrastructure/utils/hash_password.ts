import bcrypt from 'bcryptjs'
import IHashPassword from '../../interfaces/utils/IHash_password';


class HashPassword implements IHashPassword {
  private defaultSaltRounds: number
  constructor(defaultSaltRounds: number = 10) {
    this.defaultSaltRounds = defaultSaltRounds;
  }
  //Hash password
  async hash(password: string, saltRounds?: number): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(saltRounds || this.defaultSaltRounds)
      const hashedPassword = await bcrypt.hash(password, salt)
      return hashedPassword
    } catch (error) {
      throw new Error(`Error hashing password ${error}`)
    }
  }
  // compare password
  async compare(password: string, hashedPassword: string): Promise<boolean> {
     try {
      return  await bcrypt.compare(password,hashedPassword)
     } catch (error) {
      throw new Error(`Error comparing passwords ${error}`);
     }
  }
}

export default HashPassword