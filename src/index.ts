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

const apiApp = express();

apiApp.listen("3000", () => {
	console.log("Listening on http://localhost:3000");
});

apiApp.get("/ping", (req, res) => {
	var ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
	var message = req.query.message.toString().normalize() || "I just wanted to ping you :)";

	sendMessageToDiscord(`[[\`${ip}\`](<https://ipinfo.io/${ip}>)]: ${message} <@${process.env.TARGET_DISCORD_ID}>.`);

	return res.sendStatus(200);
});

const webApp = express();

webApp.use(express.static("public"));

webApp.listen("3001", () => {
	console.log("Listening on http://localhost:3001");
});

webApp.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

setInterval(run, 1000);
