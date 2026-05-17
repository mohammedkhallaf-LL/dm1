import fs from "fs";
import path from "path";
import type { EventSummary, EventData, Person, Company } from "./types";

const DATA_DIR = path.join(process.cwd(), "src/data");

export function getAllEvents(): EventSummary[] {
  const indexPath = path.join(DATA_DIR, "events", "index.json");
  if (!fs.existsSync(indexPath)) return [];
  return JSON.parse(fs.readFileSync(indexPath, "utf-8")) as EventSummary[];
}

export function getEvent(slug: string): EventData | null {
  const filePath = path.join(DATA_DIR, "events", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as EventData;
}

export function getPaginatedEvents(page: number, perPage = 10) {
  const all = getAllEvents();
  const totalPages = Math.ceil(all.length / perPage);
  const items = all.slice((page - 1) * perPage, page * perPage);
  return { items, totalPages, total: all.length, page };
}

export function getPaginatedAttendees(slug: string, page: number, perPage = 20) {
  const event = getEvent(slug);
  if (!event) return null;
  const all = event.attendees;
  const totalPages = Math.ceil(all.length / perPage);
  const items = all.slice((page - 1) * perPage, page * perPage);
  return { items, totalPages, total: all.length, page, event };
}

export function getPaginatedSpeakers(slug: string, page: number, perPage = 20) {
  const event = getEvent(slug);
  if (!event) return null;
  const all = event.speakers;
  const totalPages = Math.ceil(all.length / perPage);
  const items = all.slice((page - 1) * perPage, page * perPage);
  return { items, totalPages, total: all.length, page, event };
}

export function getPaginatedExhibitors(slug: string, page: number, perPage = 20) {
  const event = getEvent(slug);
  if (!event) return null;
  const all = event.exhibitors;
  const totalPages = Math.ceil(all.length / perPage);
  const items = all.slice((page - 1) * perPage, page * perPage);
  return { items, totalPages, total: all.length, page, event };
}

export function getPerson(slug: string, id: string): { person: Person; event: EventData } | null {
  const event = getEvent(slug);
  if (!event) return null;
  const allPersons: Person[] = [
    ...event.attendees,
    ...event.speakers,
    ...event.exhibitors.flatMap((c) => c.contacts),
    ...event.sponsors.flatMap((c) => c.contacts),
  ];
  const person = allPersons.find((p) => p.id === id) ?? null;
  if (!person) return null;
  return { person, event };
}

export function getCompany(slug: string, id: string): { company: Company; event: EventData } | null {
  const event = getEvent(slug);
  if (!event) return null;
  const company =
    event.exhibitors.find((c) => c.id === id) ??
    event.sponsors.find((c) => c.id === id) ??
    null;
  if (!company) return null;
  return { company, event };
}
