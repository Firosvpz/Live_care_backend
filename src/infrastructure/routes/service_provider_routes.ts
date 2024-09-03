import express from "express";
const router = express.Router();

import Service_provider_controller from "../../adapters/controllers/service_provider_controller";
import Service_provider_usecase from "../../usecases/service_provider_usecase";
import Service_provider_repository from "../repositories/sp_respository";
import Hash_password from "../../infrastructure/utils/hash_password";
import Jwt_token from "../../infrastructure/utils/jwt_token";
import Otp_generate from "../../infrastructure/utils/generate_OTP";
import Mail_service from "../../infrastructure/utils/mail_service";

const sp_repository = new Service_provider_repository();
const otp = new Otp_generate();
const jwt = new Jwt_token(
  process.env.JWT_ACCESS_SECRET as string,
  process.env.JWT_REFRESH_TOKEN as string,
);
const hash = new Hash_password();
const mail = new Mail_service();

const usecase = new Service_provider_usecase(
  sp_repository,
  otp,
  jwt,
  mail,
  hash,
);
const controller = new Service_provider_controller(usecase);

router.post('/sp-register',(req,res,next)=>{
    controller.verify_sp_email(req,res,next)
})

router.post('/verify-sp-otp',(req,res,next)=>{
    controller.verify_otp(req,res,next)
})

router.get("/sp-home",(req,res,next)=>{
    controller.home(req,res,next)
})

export default router