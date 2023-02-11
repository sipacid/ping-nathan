import { sendMessageToDiscord } from "./webhook";

var previousGame = null;
var previousPersonaState = null;

async function getPlayerSummaries() {
	var response = await fetch(
		`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${process.env.TARGET_STEAM_ID}`
	);
	var data = await response.json();

	return data.response.players[0];
}

export async function steamPing() {
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
