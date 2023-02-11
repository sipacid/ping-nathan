import * as ical from "node-ical";
import * as schedule from "node-schedule";
import { sendMessageToDiscord } from "./webhook";

let eventsOfToday = [];

async function updateEvents() {
	eventsOfToday = [];

	let webEvents = await ical.async.fromURL(process.env.ICAL_URL);
	for (let key in webEvents) {
		if (webEvents.hasOwnProperty(key)) {
			let event: any = webEvents[key];

			if (new Date(event.start).getDate() === new Date().getDate() && new Date(event.start).getMonth() === new Date().getMonth())
				eventsOfToday.push({ name: event.summary, start: event.start, end: event.end });
		}
	}
}

export async function iCalPing() {
	schedule.scheduleJob("0 0 * * *", async () => {
		await updateEvents();

		eventsOfToday.forEach((event) => {
			schedule.scheduleJob(new Date(event.start), () => {
				sendMessageToDiscord(`${event.name} has started.`);
			});
		});
	});
}
