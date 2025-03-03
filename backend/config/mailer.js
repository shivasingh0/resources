const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

/**
 * Handles mailer setup.
 * @param {string} email - The email address to send the mail to.
 * @param {string} emailType - The type of email to send (e.g., 'reset-password', 'verify-email').
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */

exports.sendEmail = async (recipientEmail, templateName, emailSubject, templateData) => {

  try {
    // Load email template
    const templatePath = path.join(__dirname, ".." ,"view", `${templateName}.ejs`);

    // Render email template
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");

     // Render the EJS template with dynamic data
     const htmlContent = ejs.render(emailTemplate, templateData);

    // Configure nodemailer
    const mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      
      // Email options
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: recipientEmail,
        subject: emailSubject,
        html: htmlContent,
      };
      

    // Send mail
    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Something went wrong in sending mail", error);
    throw new Error(error.message);
  }
};

// module.exports = sendEmail;