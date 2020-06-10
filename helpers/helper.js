// eslint-disable-next-line no-useless-escape
module.exports.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports.login = (model) => async (req, res) => {
	const { username, password } = req.body;
	const user = await model.findOne({
		$or: [{ username: username }, { email: username }],
	});

	if (!user)
		return res.status(401).json({
			message: 'Invalid username or password',
			errors: { errors: { login: 'Invalid username or password' } },
		});

	const isMatched = await user.checkPassword(password);
	if (!isMatched)
		return res.status(403).json({
			message: 'Invalid username or password',
			errors: { errors: { login: 'Invalid username or password' } },
		});

	const token = await user.generateToken();
	res.json({ user, token });
};
