export async function sendMessageToDiscord(message: string): Promise<void> {
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
