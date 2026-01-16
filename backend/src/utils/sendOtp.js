import nodemailer from "nodemailer";

export const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Prodify" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Prodify OTP",
    html: `
      <h2>Your OTP</h2>
      <p><b>${otp}</b></p>
      <p>Valid for 5 minutes.</p>
    `
  });
};
