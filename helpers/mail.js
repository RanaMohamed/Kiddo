const nodemailer = require("nodemailer");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = nodemailer.createTransport({
  service: "gmail",
  port: process.env.mailport,
  secureConnection: true,
  auth: { user: process.env.user, pass: process.env.pass },
  tls: {
    secureProtocol: "TLSv1_method",
  },
});
