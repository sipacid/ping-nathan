import express = require("express");
import { sendMessageToDiscord } from "./webhook";

export async function startApiApp() {
	const app = express();

	app.listen(process.env.API_PORT, () => {
		console.log(`Listening on http://localhost:${process.env.API_PORT}`);
	});

	app.get("/ping", (req, res) => {
		var ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
		var message = req.query.message.toString().normalize().replace("https://", "").replace("http://", "") || "I just wanted to ping you :)";

		sendMessageToDiscord(`[[\`${ip}\`](<https://ipinfo.io/${ip}>)]: ${message} <@${process.env.TARGET_DISCORD_ID}>.`);

		return res.sendStatus(200);
	});
}
