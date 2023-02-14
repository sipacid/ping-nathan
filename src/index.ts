import { config } from "dotenv";
import { iCalPing } from "./ical";
import { steamPing } from "./steam";

config();

async function run() {
	iCalPing();
	setInterval(steamPing, 1000);
}

run();
