const nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = nodemailer.createTransport({
	service: 'gmail',
	port: process.env.MAIL_PORT,
	secureConnection: true,
	auth: { user: process.env.USER, pass: process.env.PASS },
	tls: {
		secureProtocol: 'TLSv1_method',
	},
});
