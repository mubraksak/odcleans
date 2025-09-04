// lib/email-service.ts
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    // Get SMTP credentials from environment variables
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    
    if (!smtpUser || !smtpPassword) {
      console.warn('SMTP credentials missing. Emails will be logged to console.')
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Add these options for better error handling
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: process.env.NODE_ENV === 'development',
    })
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Verify connection configuration first
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      })

      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      
      // Fallback to console log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 DEVELOPMENT EMAIL PREVIEW:')
        console.log('From:', process.env.SMTP_FROM || process.env.SMTP_USER)
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('HTML Content:', options.html)
        console.log('---')
      }
      
      return false
    }
  }
  
  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }



  // Send quote confirmation email with link
  async sendQuoteConfirmation(email: string, userName: string, quoteId: number, token: string) {
    const quoteLink = `${process.env.NEXTAUTH_URL}/quote/${quoteId}?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Cleaning Quote is Ready!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your cleaning service quote is now ready for review. We've prepared a detailed proposal based on your requirements.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${quoteLink}" class="button">View Your Quote</a>
            </p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you have any questions, please reply to this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Your Cleaning Quote #${quoteId.toString().padStart(6, '0')} is Ready`,
      html,
    })
  }

  // Send password reset email
  async sendPasswordReset(email: string, userName: string, resetToken: string) {
    const resetLink = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${resetToken}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for the Cleaning Service admin account.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Cleaning Service Admin',
      html,
    })
  }

  // Send admin notification email
  async sendAdminNotification(quoteId: number, userName: string, userEmail: string) {
    const adminLink = `${process.env.NEXTAUTH_URL}/admin/quotes/${quoteId}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Quote Request Received</h1>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new quote request has been submitted:</p>
            <ul>
              <li><strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}</li>
              <li><strong>Customer:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${adminLink}" class="button">Review Quote</a>
            </p>
            <p>Please review this request and provide a quote within 24 hours.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send to all admins or a specific admin email
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER
    if (adminEmail) {
      return this.sendEmail({
        to: adminEmail,
        subject: `New Quote Request #${quoteId.toString().padStart(6, '0')} - ${userName}`,
        html,
      })
    }
    return false
  }


// Send magic link login email
  async sendMagicLink(email: string, userName: string, token: string, redirectTo?: string) {
    const magicLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .code { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Magic Login Link</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to sign in to your Cleaning Service account using this email address.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" class="button">Sign In Securely</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <div class="code">${magicLink}</div>
            <p>This magic link will expire in 15 minutes for security reasons.</p>
            <p><strong>Didn't request this?</strong> If you didn't request this login, please ignore this email and your account will remain secure.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Your Magic Login Link - Cleaning Service',
      html,
    })
  }

  // Send welcome email after magic link signup
  async sendWelcomeEmail(email: string, userName: string) {
    const loginLink = `${process.env.NEXTAUTH_URL}/auth/login`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Cleaning Service!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Welcome to Cleaning Service! Your account has been successfully created.</p>
            <p>You can now request quotes, manage your bookings, and track your cleaning services with us.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" class="button">Get Started</a>
            </p>
            <p>If you have any questions, our support team is here to help.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Cleaning Service!',
      html,
    })
  }


}



export const emailService = new EmailService()