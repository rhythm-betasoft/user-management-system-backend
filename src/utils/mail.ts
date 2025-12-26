import nodemailer, { SendMailOptions } from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: SendMailOptions["attachments"]
) => {
  try {
    await transporter.sendMail({
      from: `"Betasoft Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      attachments,
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Email sending failed");
  }
};
