import express = require("express");

export async function startWebApp() {
	const app = express();

	app.use(express.static("public"));

	app.listen(process.env.WEB_PORT, () => {
		console.log(`Listening on http://localhost:${process.env.WEB_PORT}`);
	});

	app.get("/", (req, res) => {
		return res.sendFile(__dirname + "/index.html");
	});
}
