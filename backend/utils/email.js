const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Check if email credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email credentials missing in .env. Skipping real email.");
    return;
  }

  const isGmail = process.env.EMAIL_HOST?.includes("gmail") || process.env.EMAIL_USER?.includes("gmail");

  const transporterConfig = isGmail 
    ? {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS.replace(/\s/g, ""), // Remove spaces from App Password
        },
      }
    : {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      };

  const transporter = nodemailer.createTransport(transporterConfig);


  const mailOptions = {
    from: `"Cloudify Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
