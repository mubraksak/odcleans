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
      secure: true, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Add these options for better error handling
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: process.env.NODE_ENV === 'production', 
      // include SMTP traffic in the logs in production

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
    const quoteLink = `${process.env.NEXTAUTH_URL}/dashboard`
    
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

  //Send password reset email
  async sendPasswordReset(email: string, userName: string, resetToken: string) {
    const resetLink = `${resetToken}`
    
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
    const adminLink = `${process.env.NEXTAUTH_URL}/admin/quotes`
    
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




// Send quote accepted notification to user
async sendQuoteAcceptedUser(email: string, userName: string, quoteId: number, scheduledDate?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quote Has Been Accepted!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Great news! Your cleaning service quote #${quoteId.toString().padStart(6, '0')} has been accepted.</p>
          
          ${scheduledDate ? `
          <div class="highlight">
            <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
          </div>
          ` : `
          <p>Our team will contact you shortly to schedule your cleaning service.</p>
          `}
          
          <p>If you have any questions or need to make changes, please reply to this email or contact our support team.</p>
          <p>Thank you for choosing our cleaning services!</p>
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
    subject: `Your Quote #${quoteId.toString().padStart(6, '0')} Has Been Accepted`,
    html,
  })
}

// Send quote accepted notification to admin
async sendQuoteAcceptedAdmin(userEmail: string, userName: string,  quoteId: number, scheduledDate?: string) {
  const adminLink = `${process.env.NEXTAUTH_URL}/admin/quotes`
  
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
        .highlight { background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Quote Accepted by Customer</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A customer has accepted their cleaning service quote:</p>
          <ul>
            <li><strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}</li>
            <li><strong>Customer:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Accepted On:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          ${scheduledDate ? `
          <div class="highlight">
            <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
          </div>
          ` : ''}
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" class="button">View Quote Details</a>
          </p>
          <p>Please ensure the service is scheduled and prepared accordingly.</p>
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
      subject: `Quote #${quoteId.toString().padStart(6, '0')} Accepted by ${userName}`,
      html,
    })
  }
  return false
}


// Send booking scheduled notification to user
async sendBookingScheduledUser(email: string, userName: string, quoteId: number, scheduledDate: string) {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .highlight { background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .note { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Cleaning Service is Scheduled!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Great news! Your cleaning service has been scheduled. Here are the details:</p>
          
          <div class="highlight">
            <h3 style="margin-top: 0;">Service Details</h3>
            <p><strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}</p>
            <p><strong>Scheduled Date:</strong> ${scheduledDate}</p>
          </div>
          
          <div class="note">
            <h4 style="margin-top: 0;">Important Information</h4>
            <p>Please note that our cleaning team may arrive within a <strong>4-hour window</strong> around your scheduled time.</p>
            <p>We recommend being available or ensuring access to your property during this period.</p>
          </div>
          
          <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
          <p>We look forward to providing you with excellent service!</p>
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
    subject: `Your Cleaning Service #${quoteId.toString().padStart(6, '0')} is Scheduled`,
    html,
  })
}

// Send booking scheduled notification to admin
async sendBookingScheduledAdmin(quoteId: number, userName: string, userEmail: string, scheduledDate: string) {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const adminLink = `${process.env.NEXTAUTH_URL}/admin/schedule`
  
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
        .highlight { background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Successfully Scheduled</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A cleaning service has been successfully scheduled:</p>
          
          <div class="highlight">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <ul>
              <li><strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}</li>
              <li><strong>Customer:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Scheduled Date:</strong> ${scheduledDate}</li>
              <li><strong>Scheduled On:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" class="button">View All Bookings</a>
          </p>
          
          <p>The customer has been notified about their scheduled service, including the 4-hour arrival window information.</p>
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
      subject: `Booking Scheduled #${quoteId.toString().padStart(6, '0')} - ${userName}`,
      html,
    })
  }
  return false
}

// Send quote created notification to user
async sendQuoteCreatedUser(quoteId: number, userName: string, userEmail: string,  price: number) {
  const quoteLink = `${process.env.NEXTAUTH_URL}/dashboard`
  
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
        .price-box { background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quote is Ready!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Great news! We've prepared a personalized quote for your cleaning service request.</p>
          
          <div class="price-box">
            <h2 style="margin: 0 0 10px 0; color: #065f46;">$${price.toFixed(2)}</h2>
            <p style="margin: 0; color: #047857;">Your estimated total</p>
          </div>
          
          <p>This quote includes all the services you requested at competitive rates. You can view the full breakdown and accept the quote through our secure portal.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${quoteLink}" class="button">View Your Quote</a>
          </p>
          
          <p>This quote is valid for 7 days. If you have any questions or would like to discuss any details, please reply to this email.</p>
          
          <p>We look forward to serving you!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Cleaning Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return this.sendEmail({
    to: userEmail,
    subject: `Your Cleaning Quote #${quoteId.toString().padStart(6, '0')} is Ready`,
    html,
  })
}



// Send quote created notification to admin (confirmation)
async sendQuoteCreatedAdmin(quoteId: number, userName: string, userEmail: string,  price: number) {
  const adminLink = `${process.env.NEXTAUTH_URL}/admin/quotes`
  
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
        .info-box { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Quote Successfully Created</h1>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>You've successfully created a quote for a customer:</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0;">Quote Details</h3>
            <ul>
              <li><strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}</li>
              <li><strong>Customer:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Quote Amount:</strong> $${price.toFixed(2)}</li>
              <li><strong>Created On:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" class="button">View Quote Details</a>
          </p>
          
          <p>The customer has been notified about their quote and can now review and accept it.</p>
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
      subject: `Quote Created #${quoteId.toString().padStart(6, '0')} - ${userName}`,
      html,
    })
  }
  return false
}


async sendPaymentReceipt(quoteId: number, customerName: string, customerEmail: string, amount: number, paymentIntentId: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .receipt-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
        .info-item { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .status-badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmed</h1>
          <p>Thank you for your payment!</p>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>Your payment for cleaning services has been successfully processed. Here's your receipt:</p>
          
          <div class="receipt-box">
            <h3 style="margin-top: 0; color: #059669;">Payment Receipt</h3>
            
            <div class="info-item">
              <strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}
            </div>
            
            <div class="info-item">
              <strong>Amount Paid:</strong> $${amount.toFixed(2)}
            </div>
            
            <div class="info-item">
              <strong>Payment Date:</strong> ${new Date().toLocaleString()}
            </div>
            
            <div class="info-item">
              <strong>Transaction ID:</strong> ${paymentIntentId}
            </div>
            
            <div class="info-item">
              <strong>Status:</strong> <span class="status-badge">Paid</span>
            </div>
          </div>

          <h4>What happens next?</h4>
          <ul>
            <li>Your cleaning service is now confirmed</li>
            <li>Our team will contact you within 24 hours to schedule your cleaning</li>
            <li>You'll receive a separate email with scheduling details</li>
            <li>You can track your service status in your dashboard</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Your Dashboard</a>
          </p>
          
          <p>If you have any questions about your payment or service, please contact our support team.</p>
          
          <p>Thank you for choosing OdClean!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} OdClean Professional Cleaning Services. All rights reserved.</p>
          <p>support@odclean.com | (555) 123-4567</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Payment Confirmed

Hello ${customerName},

Your payment for cleaning services has been successfully processed. Here's your receipt:

PAYMENT RECEIPT
Quote ID: #${quoteId.toString().padStart(6, '0')}
Amount Paid: $${amount.toFixed(2)}
Payment Date: ${new Date().toLocaleString()}
Transaction ID: ${paymentIntentId}
Status: Paid

What happens next?
- Your cleaning service is now confirmed
- Our team will contact you within 24 hours to schedule your cleaning
- You'll receive a separate email with scheduling details
- You can track your service status in your dashboard

View your dashboard: ${process.env.NEXTAUTH_URL}/dashboard

If you have any questions about your payment or service, please contact our support team.

Thank you for choosing OdClean!

© ${new Date().getFullYear()} OdClean Professional Cleaning Services.
support@odclean.com | (555) 123-4567
  `

  return this.sendEmail({
    to: customerEmail,
    subject: `Payment Receipt - OdClean Quote #${quoteId.toString().padStart(6, '0')}`,
    html,
    text
  })
}

async sendPaymentReceivedAdmin(quoteId: number, customerName: string, customerEmail: string, amount: number, paymentIntentId: string) {
  const adminLink = `${process.env.NEXTAUTH_URL}/admin/quotes/${quoteId}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .payment-box { background: #dcfce7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
        .info-item { margin: 8px 0; padding: 6px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Received</h1>
          <p>Customer has successfully paid for a quote</p>
        </div>
        <div class="content">
          <p>Hello Admin,</p>
          <p>A customer has successfully completed payment for their cleaning service quote:</p>
          
          <div class="payment-box">
            <h3 style="margin-top: 0; color: #059669;">Payment Details</h3>
            
            <div class="info-item">
              <strong>Quote ID:</strong> #${quoteId.toString().padStart(6, '0')}
            </div>
            
            <div class="info-item">
              <strong>Customer:</strong> ${customerName}
            </div>
            
            <div class="info-item">
              <strong>Email:</strong> ${customerEmail}
            </div>
            
            <div class="info-item">
              <strong>Amount Paid:</strong> $${amount.toFixed(2)}
            </div>
            
            <div class="info-item">
              <strong>Transaction ID:</strong> ${paymentIntentId}
            </div>
            
            <div class="info-item">
              <strong>Payment Date:</strong> ${new Date().toLocaleString()}
            </div>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" class="button">Review Quote Details</a>
          </p>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Quote status has been automatically updated to "paid"</li>
            <li>Customer has received payment confirmation email</li>
            <li>Please contact the customer within 24 hours to schedule cleaning</li>
            <li>Update booking status once scheduled</li>
          </ul>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} OdClean Professional Cleaning Services. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER
  if (adminEmail) {
    return this.sendEmail({
      to: adminEmail,
      subject: `Payment Received - Quote #${quoteId.toString().padStart(6, '0')} - ${customerName}`,
      html,
    })
  }
  return false
}


async sendCleanerJobRequestNotification(quoteId: number, customerName: string, cleanerName: string)  {
    // Implementation for notifying admin about cleaner job request
  }

 async sendCleanerAssignmentDecisionNotification  (quoteId: number, customerName: string, cleanerName: string, decision: string) {
    // Implementation for notifying admin about cleaner's decision
  }

 async sendCleanerReceipt  (cleanerEmail: string, cleanerName: string, assignmentId: number, amount: number, jobDetails: any) {
    // Implementation for sending receipt to cleaner
  }


// TODO

  async sendCleanerAssignmentNotification (  cleanerEmail: string,  cleanerName: string,  quoteId: number,  customerName: string,  scheduledDate: string | null, paymentAmount: number,  cleaningType: string,  propertyType: string)  {
    const subject = `New Cleaning Assignment - Quote #${quoteId}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Cleaning Assignment</h2>
        <p>Hello ${cleanerName},</p>
        <p>You have been assigned to a new cleaning job:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Quote ID:</strong> #${quoteId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Service Type:</strong> ${cleaningType} - ${propertyType}</p>
          ${scheduledDate ? `<p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>` : ''}
          <p><strong>Payment Amount:</strong> $${paymentAmount}</p>
        </div>
        <p>Please login to your dashboard to accept or reject this assignment.</p>
        <a href="${process.env.NEXTAUTH_URL}/cleaner/dashboard" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">
          View Assignment
        </a>
      </div>
    `
    
    // Implementation for sending email
    console.log(`Sending assignment notification to ${cleanerEmail}`)
    // Add your email sending logic here
  }

  async sendCleanerJobCompletedNotification(cleanerEmail: string, cleanerName: string, quoteId: number, customerName: string)  {
    const subject = `Job Completed - Quote #${quoteId}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Job Marked as Completed</h2>
        <p>Hello ${cleanerName},</p>
        <p>Your cleaning job for ${customerName} (Quote #${quoteId}) has been marked as completed by the admin.</p>
        <p>Payment will be processed according to your payment schedule.</p>
        <p>Thank you for your excellent service!</p>
      </div>
    `
    
    console.log(`Sending job completion notification to ${cleanerEmail}`)
    // Add your email sending logic here
  }

 async sendCleanerPaymentNotification( cleanerEmail: string, cleanerName: string, quoteId: number, paymentAmount: number)  {
    const subject = `Payment Processed - Quote #${quoteId}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Processed</h2>
        <p>Hello ${cleanerName},</p>
        <p>A payment of $${paymentAmount} for Quote #${quoteId} has been processed.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Payment Amount:</strong> $${paymentAmount}</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Payment Status:</strong> Paid</p>
        </div>
        <p>Please check your account for the payment details.</p>
      </div>
    `
    
    console.log(`Sending payment notification to ${cleanerEmail}`)
    // Add your email sending logic here
  }

}



export const emailService = new EmailService()