require('dotenv').config({ path: 'variables.env' });

const API_AI_TOKEN = process.env.API;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK;

const request = require('request');
const apiAiClient = require('apiai')(API_AI_TOKEN);

const random = () => {
	const random = new Set();
	random.add(0);
	while (random.size < 4) {
		const temp = ((min, max) => Math.floor(Math.random() * (max - min + 1)) + min )(0, 10);
		random.add(temp);
	}
	return [...random];
};

const sendRestaurant = (senderId, res) => {
	const indexes = random();
	const restaurants = res.split('&end;')
		.filter((r, i) => indexes.includes(i))
		.map(r => r.split('&gap;'));
	const elements = restaurants.map(r => {
		return {
			title: r[0],
			subtitle: r[2],
			image_url: r[3],
			default_action : {
				type: 'web_url',
				url: r[1]
			}
		};
	});

	return request({
		url: 'https://graph.facebook.com/v2.9/me/messages',
		qs: { access_token: FACEBOOK_ACCESS_TOKEN},
		method: 'POST',
		json: {
			recipient: { id: senderId },
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type:	'list',
						elements,
					}
				}
			}
		}
	});
};

const sendTextMessage = (senderId, text) => {
	request({
		url: 'https://graph.facebook.com/v2.9/me/messages',
		qs: { access_token: FACEBOOK_ACCESS_TOKEN},
		method: 'POST',
		json: {
			recipient: { id: senderId },
			message: { text }
		} 
	});
};

module.exports = (event) => {
	const senderId = event.sender.id;
	const message = event.message.text;

	const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'foodchat-3fd1a' });

	apiaiSession.on('response', (res) => {
		const result = res.result.fulfillment.speech;

		if (res.result.metadata.intentName === 'cuisine') {
			sendRestaurant(senderId, result);
		} else {
			sendTextMessage(senderId, result);
		}
	});

	apiaiSession.on('error', error => console.log(error));
	apiaiSession.end();
};