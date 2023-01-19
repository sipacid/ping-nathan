import { config } from "dotenv";

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
			sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now playing ${game}.`);
		} else {
			sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> stopped playing ${previousGame}.`);
		}
	}

	if (personaState != previousPersonaState) {
		switch (personaState) {
			case 0:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is offline.`);
				break;
			case 1:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is online.`);
				break;
			case 3:
				sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is away.`);
			default:
				break;
		}
	}

	previousGame = game;
	previousPersonaState = personaState;
}

setInterval(run, 1000);
