import * as dotenv from "dotenv";

dotenv.config();

var previousGame = null;

async function getSteamGame() {
	var response = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${process.env.TARGET_STEAM_ID}`
	);
	var data = await response.json();
	var game = data.response.players[0].gameextrainfo;
	return game;
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
	var game = await getSteamGame();
	if (game != null && game != previousGame) {
		sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> is now playing ${game}.`);
	} else if (game == null && previousGame != null) {
		sendMessageToDiscord(`<@${process.env.TARGET_DISCORD_ID}> stopped playing ${previousGame}.`);
	}

	previousGame = game;
}

setInterval(run, 1000);
