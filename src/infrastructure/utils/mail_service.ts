
import nodemailer, { Transporter } from 'nodemailer'
import IMail_service from "interfaces/utils/IMail_service"
import { logger } from '../utils/combine_log'
import dotenv from 'dotenv';

dotenv.config();


class Mail_service implements IMail_service {

    private transporter: Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Email_Password
            }
        })
        this.validate_config()
    }

    private validate_config() {
        if (!process.env.Email || !process.env.Email_Password) {
            logger.error(`Email or Email password in env is not set`)
            throw new Error('Email configuration missing')
        }
    }

    async sendmail(name: string, email: string, otp: string): Promise<void> {
        const email_content = `
            <html>
       <body style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #007bff; text-align: center;">Hello ${name}!!,</h2>
        <p style="font-size: 1em; line-height: 1.6;">To complete your registration or login process, please use the following One-Time Password (OTP). This OTP is valid for the next 5 minutes.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 1.5em; font-weight: bold; color: #007bff;">${otp}</p>
        </div>
        <p style="font-size: 1em; line-height: 1.6;">If you did not request this, please ignore this email or contact our support team for assistance.</p>
        <p style="font-size: 1em; line-height: 1.6;">Thank you for using <strong>Live-Care</strong>. We are committed to providing the best service possible!</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="font-size: 0.9em; color: #777;">This email was sent to ${email}. If you did not request this, please disregard it.</p>
        </div>
      </div>
       </body>
       </html>
      `;
        try {
            const info = await this.transporter.sendMail({
                from: process.env.Email,
                to: email,
                subject: 'Live-care Verification Code ✔',
                text: `Dear ${name},\n\nYour OTP is: ${otp}\n\nBest regards,\nLive-care`,
                html: email_content
            })
            logger.info(`Email sent successfully ${info.response}`)
        } catch (error) {
            logger.error(`Failed to send email: ${error}`);
            throw new Error('Failed to send email.');
        }
    }
}

export default Mail_service