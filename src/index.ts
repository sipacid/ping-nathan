import { config } from "dotenv";
import * as express from "express";

config();

var previousGame = null;
var previousPersonaState = null;

async function getPlayerSummaries() {
	var response = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${process.env.TARGET_STEAM_ID}`
	);
	var data = await response.json();

	return data.response.players[0];
}

async function sendMessageToDiscord(message: string) {
	var body = {
		content: message,
	};

	var response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (response.status != 204) {
		console.log(`Failed to send message to discord with status code: ${response.status}`);
	}
}

async function run() {
	var playerSummaries = await getPlayerSummaries();
	var game = playerSummaries.gameextrainfo;
	var personaState = playerSummaries.personastate;

	if (game != previousGame) {
		if (game != null) {
			sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now playing ${game} on Steam.`);
		} else {
			sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> stopped playing ${previousGame} on Steam.`);
		}
	}

	if (personaState != previousPersonaState) {
		switch (personaState) {
			case 0:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now offline on Steam.`);
				break;
			case 1:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now online on Steam.`);
				break;
			case 3:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now away on Steam.`);
			default:
				break;
		}
	}

	previousGame = game;
	previousPersonaState = personaState;
}

const app = express();

app.listen("3000", () => {
	console.log("Listening on http://localhost:3000");
});

app.get("/", (req, res) => {
	var ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
	sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}>, you got pinged by [\`${ip}\`](<https://ipinfo.io/${ip}>).`);

	return res.send(200);
});

setInterval(run, 1000);
