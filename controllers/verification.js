require('dotenv').config({ path: 'variables.env' });
module.exports = (req, res) => {
	const hubChallenge = req.query['hub.challenge'];
	const hubMode = req.query['hub.mode'];
	const verifyTokenMatches = (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN);

	if (hubMode && verifyTokenMatches) {
		res.status(200).send(hubChallenge);
	} else {
		res.status(403).end();
	}
};