const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

require('express-async-errors');
require('./db');

const { port } = require('./config/config');

const kidRouter = require('./routes/kid');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use(['/kid', '/kids'], kidRouter);

app.use(function (req, res, next) {
	res.status(404).send("Sorry can't find that!");
	next();
});

app.use(function (err, req, res, next) {
	console.log(err);
	const status = res.statusCode == 200 ? 500 : res.statusCode;
	const message = res.statusCode == 200 ? 'Something broke!' : err.message;
	res.status(status).json({
		message,
		errors: err,
	});
	next();
});

app.listen(port, () => {
	console.info(`App Listening on port ${port}`);
});
