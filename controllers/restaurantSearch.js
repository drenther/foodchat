require('dotenv').config({ path: 'variables.env' });

const ZOMATO_API = process.env.ZOMATO;

const request = require('request');

module.exports = (req, res) => {
	if (req.body.result.action === 'cuisine') {
		const cuisine = req.body.result.parameters['cuisine'];
		const start = ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min )(0, 5);
		const apiUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=1&entity_type=city&q=${cuisine}&start=${start}&count=3`;

		request({
			uri: apiUrl,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'user-key': ZOMATO_API
			}
		}, (err, response, body) => {
			const restaurants = JSON.parse(body).restaurants;
			const output = restaurants
				.map(r => `${r.restaurant.name}&gap;${r.restaurant.url}&gap;${r.restaurant.location.address}&gap;${r.restaurant.featured_image}`)
				.join('&end;');

			return res.json({
				speech: output,
				displayText: output,
				source: 'cuisine'
			});
		});
	}
};