import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: '"Your App" <your-email@gmail.com>',
  to: "receiver@example.com",
  subject: "Test Email",
  text: "Hello from Nodemailer 🚀",
});
