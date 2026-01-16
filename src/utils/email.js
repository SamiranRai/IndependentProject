const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    
      // 2) Define the email options
      const mailOptions = {
        from: "samiran@hellomail.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
      };

      await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;