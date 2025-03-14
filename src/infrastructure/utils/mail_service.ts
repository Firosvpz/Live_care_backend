import nodemailer, { Transporter } from "nodemailer";
import IMailService from "../../interfaces/utils/IMail_service";
import { logger } from "./combine_log";
import dotenv from "dotenv";

dotenv.config();

class MailService implements IMailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.Email_Password,
      },
    });
  }

  async sendMail(name: string, email: string, otp: string): Promise<void> {
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
        subject: "Live-care Verification Code ✔",
        text: `Dear ${name},\n\nYour OTP is: ${otp}\n\nBest regards,\nLive-care`,
        html: email_content,
      });
      logger.info(`Email sent successfully ${info.response}`);
    } catch (error) {
      logger.error(`Failed to send email: ${error}`);
      throw new Error("Failed to send email.");
    }
  }
  async sendLeaveMail(
    name: string,
    email: string,
    cancelReason: string,
  ): Promise<void> {
    const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #4CAF50; text-align: center;">Booking Cancellation Notice</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We regret to inform you that your booking has been canceled due to an emergency situation with your service provider. Below are the details:</p>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #4CAF50;">Cancellation Details</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Reason for Cancellation:</strong> ${cancelReason}</li>
                    </ul>
                </div>
                
                <p>We sincerely apologize for the inconvenience this may have caused. Please rest assured that your refund has been processed and should reflect in your account shortly.</p>
                <p>If you have any questions or need further assistance, please feel free to contact our support team.</p>
                
                <p style="font-weight: bold;">Thank you for your understanding and cooperation.</p>
                
                <p>Best regards,<br/> 
                <strong>Live Care Team</strong></p>
                
                <hr style="border: 0; height: 1px; background: #ccc; margin-top: 20px;">
                
                <p style="color: #777; font-size: 0.8em;">This is an automated email, please do not reply. If you need assistance, contact our support at <a href="mailto:support@live-care.com" style="color: #4CAF50;">support@live-care.com</a>.</p>
                <p style="color: #777; font-size: 0.8em;">&copy; 2024 WeOne Maternity Care. All rights reserved.</p>
            </div>
        </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Booking Cancellation Notice - Live care",
      html: emailContent,
    });
  }

  async sendPrescriptionMail(
    name: string,
    email: string,
    prescription: string,
  ): Promise<void> {
    const emailContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #4CAF50; text-align: center;">Your Prescription from LiveCare</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We hope this message finds you well. Please find your prescription details below as provided by your healthcare provider:</p>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #4CAF50;">Prescription Details</h3>
                    <div style="background-color: #f2f2f2; padding: 15px; border-radius: 8px;">
                      <p>${prescription}</p>
                    </div>
                </div>
  
                <p>If you have any questions or need further clarification regarding your prescription, we recommend reaching out directly to your healthcare provider for more information. You can also reply to this email or contact our support team if you need assistance with this service.</p>
                
                <p style="font-weight: bold;">Thank you for trusting LiveCare with your health.</p>
                
                <p>Best regards,<br/> 
                <strong>LiveCare Team</strong></p>
                
                <hr style="border: 0; height: 1px; background: #ccc; margin-top: 20px;">
                
                <p style="color: #777; font-size: 0.8em;">This is an automated email, please do not reply. If you need assistance, contact our support at <a href="mailto:support@live-care.com" style="color: #4CAF50;">support@live-care.com</a>.</p>
                <p style="color: #777; font-size: 0.8em;">&copy; 2024 LiveCare Health Services. All rights reserved.</p>
            </div>
        </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Prescription from LiveCare",
      html: emailContent,
    });
  }
}

export default MailService;
