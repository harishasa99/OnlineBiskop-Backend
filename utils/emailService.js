const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Funkcija za slanje e-maila
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Verifikacioni e-mail poslat!");
  } catch (error) {
    console.error("❌ Greška pri slanju e-maila:", error);
    throw new Error("Greška pri slanju e-maila.");
  }
};

module.exports = sendEmail;
