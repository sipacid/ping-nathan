import { config } from "dotenv";
import { startApiApp } from "./api";
import { iCalPing } from "./ical";
import { steamPing } from "./steam";
import { startWebApp } from "./web";

config();

async function run() {
	startApiApp();
	startWebApp();

	iCalPing();
	setInterval(steamPing, 1000);
}

run();
