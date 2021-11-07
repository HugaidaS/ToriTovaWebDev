import { https } from 'firebase-functions';

export const bigben = https.onRequest((req, res) => {
	const hours = new Date().getHours() % 12 + 1; // London is UTC + 1hr;
	res.status(200).send(`<!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      ${'BONG '.repeat(hours)}
    </body>
  </html>`);
});
