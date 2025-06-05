import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    try {
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
      
      this.logger.log('Initializing email service with configuration:', {
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      });
      
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // Only for development
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP connection error:', error);
        } else {
          this.logger.log('SMTP server is ready to take our messages');
        }
      });
    } catch (error) {
      this.logger.error('Error initializing email service:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      this.logger.log(`Preparing to send password reset email to: ${email}`);
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p><strong>Important:</strong> This link will expire in exactly 1 hour from the time this email was sent.</p>
          <p>If the link expires, you can request a new password reset link from the login page.</p>
        `,
      };

      this.logger.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      this.logger.log(`Preparing to send welcome email to: ${email}`);
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
        to: email,
        subject: 'ยินดีต้อนรับสู่ WordBook!',
        html: `
          <h1>ยินดีต้อนรับสู่ WordBook!</h1>
          <p>สวัสดี ${name},</p>
          <p>ขอบคุณที่สมัครสมาชิกกับเรา! ตอนนี้คุณสามารถเริ่มใช้งาน WordBook เพื่อพัฒนาทักษะการเรียนภาษาของคุณได้แล้ว</p>
          <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อเราได้ตลอดเวลา</p>
          <p>ขอให้สนุกกับการเรียนภาษากับ WordBook!</p>
          <p>ทีมงาน WordBook</p>
        `,
      };

      this.logger.log('Sending welcome email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }
} 