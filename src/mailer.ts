import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "apismtp@mailtrap.io",
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const sendTestEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  const info = await transporter.sendMail({
    from: "test@gmail.com",
    to,
    subject,
    text,
    html: `<p>${text}</p>`,
  });
  console.log("Message sent:", info.messageId);
};
