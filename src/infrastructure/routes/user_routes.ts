
import express from 'express'
const router = express.Router()

import User_controller from '../../adapters/controllers/user_controller'
import User_usecase from '../../usecases/user_usecase'
import User_repository from '../repositories/user_repository'
import Hash_password from '../utils/hash_password'
import Jwt_token from '../utils/jwt_token'
import Otp_generate from '../utils/generate_OTP'
import Mail_service from '../utils/mail_service'

const user_repoitory = new User_repository()
const otp = new Otp_generate()
const jwt = new Jwt_token(process.env.JWT_SECRET as string)
const hash = new Hash_password()
const mail = new Mail_service()


const usecase = new User_usecase(user_repoitory,jwt,otp,mail,hash)
const controller = new User_controller(usecase)

router.post('/user_register',(req,res,next) => { controller.verify_user_email(req,res,next)})







export default router