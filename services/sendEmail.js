import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Highway Delite" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Thanks for signing up! Click the button below to verify your email address.</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - Highway Delite",
    html,
    text: `Verify your email by clicking this link: ${verificationUrl}`,
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the button below to proceed.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - Highway Delite",
    html,
    text: `Reset your password by clicking this link: ${resetUrl}`,
  });
};

const sendBookingConfirmation = async (email, bookingDetails) => {
  const { experienceName, date, participants, totalAmount, bookingId } =
    bookingDetails;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Booking Confirmed!</h2>
      <p>Your booking has been confirmed. Here are the details:</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin: 5px 0;"><strong>Experience:</strong> ${experienceName}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(
          date
        ).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Participants:</strong> ${participants}</p>
        <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
      </div>
      <p style="color: #666;">We're excited to have you! Check your dashboard for more details.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Booking Confirmation - Highway Delite",
    html,
    text: `Your booking for ${experienceName} has been confirmed. Booking ID: ${bookingId}`,
  });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation,
};
