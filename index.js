const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

require('express-async-errors');
require('./db');

const { port } = require('./config/config');

const authenticate = require('./middlewares/authentication');

const kidRouter = require('./routes/kid');
const supporterRouter = require('./routes/supporter');
const buyerRouter = require('./routes/buyer');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const usersRouter = require('./routes/user');
const stripe = require('./helpers/stripe');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.get('/', authenticate, (req, res) => {
	res.json(req.user);
});

app.get('/secret', async (req, res) => {
	const intent = await stripe.paymentIntents.create({
		amount: 10,
		currency: 'usd',
		// Verify your integration in this guide by including this parameter
		metadata: { integration_check: 'accept_a_payment' },
	});
	res.json({ client_secret: intent.client_secret }); // ... Fetch or create the PaymentIntent
});

app.use(['/kid', '/kids'], kidRouter);
app.use(['/supporter', '/supporters'], supporterRouter);
app.use(['/buyer', '/buyers'], buyerRouter);
app.use(['/post', '/posts'], postRouter);
app.use(['/comment', '/comments'], commentRouter);
app.use(['/product', '/products'], productRouter);
app.use(['/category', '/categories'], categoryRouter);
app.use('/user', usersRouter);

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
