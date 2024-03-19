const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendActivationToken = (userEmail, activationToken) => {
  const activationLink = `https://www.damsgallery.com/activate/${activationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: "Activate Your Account",
    html: `<p>Click <a href="${activationLink}">here</a> to activate your account</p>`,
  };
  transporter.sendMail(mailOptions, (error, success) => {
    if (error) {
      console.log(`Error sending Activation Email`, error);
    } else {
      console.log(`activation email sent`, success.response);
    }
  });
};

module.exports = sendActivationToken;
