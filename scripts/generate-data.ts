import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import type {
  EventSummary,
  EventData,
  Person,
  Company,
  Session,
  EventTerminology,
} from "../src/lib/types";

faker.seed(42);

const TERMINOLOGY: Record<keyof EventTerminology, string[]> = {
  attendees: [
    "Registered Delegates",
    "Who's Coming",
    "Participants",
    "Members",
    "Attendee Directory",
    "Delegate List",
    "Registered Guests",
  ],
  speakers: [
    "Featured Voices",
    "Program Faculty",
    "Presenters",
    "Thought Leaders",
    "Speaker Lineup",
    "Keynote & Sessions",
    "Our Speakers",
  ],
  exhibitors: [
    "Show Floor Directory",
    "Find a Company",
    "Exhibiting Companies",
    "Vendors & Partners",
    "The Exhibitors",
    "Company Directory",
    "Marketplace",
  ],
  sponsors: [
    "Our Partners",
    "Supporters",
    "Presenting Partners",
    "Backers",
    "Sponsors & Supporters",
    "Thank Our Partners",
    "Who Makes It Possible",
  ],
};

const CATEGORIES = [
  ...Array(12).fill("Conference"),
  ...Array(10).fill("Trade Show"),
  ...Array(8).fill("Summit"),
  ...Array(6).fill("Forum"),
  ...Array(6).fill("Annual Congress"),
  ...Array(4).fill("Awards Gala"),
  ...Array(4).fill("Hosted Buyer Program"),
];

const INDUSTRIES = [
  "MICE",
  "Technology/SaaS",
  "Healthcare",
  "Finance",
  "Retail",
  "Real Estate",
  "Education",
  "Manufacturing",
  "Media",
  "Energy",
];

const INTERESTS = [
  "France", "Germany", "Italy", "Spain", "Portugal", "Netherlands",
  "Switzerland", "Austria", "UK", "USA", "UAE", "Singapore",
  "Incentive Travel", "Corporate Events", "MICE", "Team Building",
  "Rooms up to 100", "Rooms up to 500", "Rooms over 1000",
  "Spa resort", "Beach resort", "City centre hotel",
];

const EVENT_TYPES = [
  "Incentive Travel", "Corporate Hospitality", "Conference", "Trade Show",
  "Gala Dinner", "Product Launch", "Team Building", "Award Ceremony",
];

const GEO_REGIONS = [
  "Western Europe", "Central Europe", "Eastern Europe", "North America",
  "Latin America", "Middle East", "Asia Pacific", "Africa", "Worldwide",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500–1000", "1000+"];

const HALLS = ["Hall 1", "Hall 2", "Hall 3", "Hall 4", "Hall 5", "Outdoor"];

const TRACKS: Session["track"][] = ["Keynote", "Workshop", "Panel", "Breakout"];

const ROOMS = [
  "Main Stage", "Room A", "Room B", "Room C", "Room D",
  "Auditorium", "Conference Room 1", "Conference Room 2",
];

function pick<T>(arr: T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => faker.number.float() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

let personCounter = 0;
let companyCounter = 0;

function makePersonId(): string {
  return String(100000 + personCounter++);
}

function makeCompanyId(): string {
  return String(200000 + companyCounter++);
}

function generateSession(eventId: string, idx: number): Session {
  const day = `Day ${faker.number.int({ min: 1, max: 3 })}`;
  const hour = faker.number.int({ min: 9, max: 17 });
  const endHour = hour + faker.number.int({ min: 1, max: 2 });
  return {
    id: `${eventId}-session-${idx}`,
    title: faker.lorem.sentence({ min: 4, max: 8 }).replace(/\.$/, ""),
    day,
    time: `${String(hour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00`,
    track: pick(TRACKS),
    room: pick(ROOMS),
  };
}

function generatePerson(
  eventId: string,
  slug: string,
  section: "attendees" | "speakers" | "exhibitor_staff" | "sponsor_contact" | "other",
  overrides: Partial<Person> = {}
): Person {
  const id = makePersonId();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const hasLinkedin = faker.datatype.boolean({ probability: 0.65 });
  const hasTwitter = faker.datatype.boolean({ probability: 0.2 });
  const hasInstagram = faker.datatype.boolean({ probability: 0.15 });
  const hasBio =
    section === "speakers"
      ? true
      : section === "attendees" || section === "other"
      ? faker.datatype.boolean({ probability: 0.3 })
      : faker.datatype.boolean({ probability: 0.1 });
  const hasGated = faker.datatype.boolean({ probability: 0.4 });
  const allowMeeting = faker.datatype.boolean({ probability: 0.7 });

  const sectionToType: Record<string, Person["participantType"]> = {
    attendees: "attendee",
    speakers: "speaker",
    exhibitor_staff: "exhibitor_staff",
    sponsor_contact: "sponsor_contact",
    other: "other",
  };
  const participantType = sectionToType[section] ?? "attendee";

  const sectionPath =
    participantType === "attendee" || participantType === "other"
      ? "attendees"
      : participantType === "speaker"
      ? "speakers"
      : participantType === "exhibitor_staff"
      ? "exhibitors"
      : "sponsors";

  return {
    id,
    eventId,
    participantType,
    firstName,
    lastName,
    fullName,
    position: faker.person.jobTitle(),
    company: faker.company.name(),
    companyWebsite: `https://www.${faker.internet.domainName()}`,
    companyPhone: faker.phone.number(),
    email: faker.internet.email({ firstName, lastName }),
    city: faker.location.city(),
    country: faker.location.country(),
    geoRegion: pick(GEO_REGIONS),
    linkedin: hasLinkedin
      ? `https://www.linkedin.com/in/${faker.internet.username({ firstName, lastName }).toLowerCase()}/`
      : null,
    twitter: hasTwitter ? `https://twitter.com/${faker.internet.username()}` : null,
    instagram: hasInstagram ? `https://instagram.com/${faker.internet.username()}` : null,
    bio: hasBio ? faker.lorem.sentences({ min: 2, max: 3 }) : null,
    industry: pick(INDUSTRIES),
    interests: pickN(INTERESTS, faker.number.int({ min: 3, max: 10 })),
    eventTypesOrganized:
      faker.datatype.boolean({ probability: 0.5 })
        ? pickN(EVENT_TYPES, faker.number.int({ min: 1, max: 4 }))
        : null,
    orgType: faker.datatype.boolean({ probability: 0.4 }) ? faker.company.buzzNoun() : null,
    allowMeeting,
    isNewAttendee: faker.datatype.boolean({ probability: 0.15 }),
    sessions: null,
    exhibitorId: null,
    boothNumber: null,
    hall: null,
    sponsorTier: null,
    profileUrl: `/events/${slug}/${sectionPath}/${id}`,
    hasGatedSection: hasGated,
    gatedInterests: hasGated
      ? pickN(INTERESTS, faker.number.int({ min: 2, max: 6 }))
      : null,
    meetingSlots:
      allowMeeting
        ? pickN(
            ["Mon 9-11am", "Mon 2-4pm", "Tue 9-11am", "Tue 2-4pm", "Wed 9-11am", "Wed 2-4pm"],
            faker.number.int({ min: 1, max: 3 })
          )
        : null,
    ...overrides,
  };
}

function generateCompany(
  eventId: string,
  slug: string,
  type: "exhibitor" | "sponsor",
  tier?: "gold" | "silver" | "bronze"
): Company {
  const id = makeCompanyId();
  const boothNumber = type === "exhibitor" ? `#${faker.number.int({ min: 100, max: 9999 })}` : null;
  const hall = type === "exhibitor" ? pick(HALLS) : null;
  const contactCount = faker.number.int({ min: 1, max: type === "exhibitor" ? 8 : 3 });

  const contacts: Person[] = Array.from({ length: contactCount }, () =>
    generatePerson(
      eventId,
      slug,
      type === "exhibitor" ? "exhibitor_staff" : "sponsor_contact",
      {
        exhibitorId: type === "exhibitor" ? id : null,
        boothNumber,
        hall,
        sponsorTier: tier ?? null,
      }
    )
  );

  return {
    id,
    eventId,
    type,
    name: faker.company.name(),
    website: `https://www.${faker.internet.domainName()}`,
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    industry: pick(INDUSTRIES),
    size: pick(COMPANY_SIZES),
    boothNumber,
    hall,
    sponsorTier: tier ?? null,
    contacts,
    description: faker.lorem.sentences(2),
  };
}

const usedSlugs = new Set<string>();

function generateEvent(index: number): { summary: EventSummary; data: EventData } {
  const category = CATEGORIES[index];
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const city = faker.location.city();
  const country = faker.location.country();
  const startDate = faker.date.future({ years: 1 });
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 3 }));

  const yearSuffix = startDate.getFullYear();
  const baseName = `${faker.company.buzzAdjective()} ${category} ${yearSuffix}`;
  let slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Ensure uniqueness
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${index}`;
  }
  usedSlugs.add(slug);

  const id = slug;

  const terminology: EventTerminology = {
    attendees: TERMINOLOGY.attendees[index % TERMINOLOGY.attendees.length],
    speakers: TERMINOLOGY.speakers[index % TERMINOLOGY.speakers.length],
    exhibitors: TERMINOLOGY.exhibitors[index % TERMINOLOGY.exhibitors.length],
    sponsors: TERMINOLOGY.sponsors[index % TERMINOLOGY.sponsors.length],
  };

  const attendeeCount = faker.number.int({ min: 4000, max: 5000 });
  const attendees: Person[] = Array.from({ length: attendeeCount }, () =>
    generatePerson(id, slug, "attendees")
  );

  const speakerCount = faker.number.int({ min: 200, max: 350 });
  const speakers: Person[] = Array.from({ length: speakerCount }, (_, i) => {
    const sessionCount = faker.number.int({ min: 1, max: 3 });
    const sessions: Session[] = Array.from({ length: sessionCount }, (_, j) =>
      generateSession(id, i * 10 + j)
    );
    return generatePerson(id, slug, "speakers", { sessions });
  });

  const exhibitorCount = faker.number.int({ min: 150, max: 300 });
  const exhibitors: Company[] = Array.from({ length: exhibitorCount }, () =>
    generateCompany(id, slug, "exhibitor")
  );

  const goldCount = faker.number.int({ min: 2, max: 4 });
  const silverCount = faker.number.int({ min: 4, max: 8 });
  const bronzeCount = faker.number.int({ min: 8, max: 20 });
  const sponsors: Company[] = [
    ...Array.from({ length: goldCount }, () => generateCompany(id, slug, "sponsor", "gold")),
    ...Array.from({ length: silverCount }, () => generateCompany(id, slug, "sponsor", "silver")),
    ...Array.from({ length: bronzeCount }, () => generateCompany(id, slug, "sponsor", "bronze")),
  ];

  const summary: EventSummary = {
    id,
    name: baseName,
    dates: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
    location: { city, country, venue: `${city} Convention Centre` },
    category,
    industry,
    description: faker.lorem.sentences(3),
    participantCounts: {
      attendees: attendees.length,
      speakers: speakers.length,
      exhibitors: exhibitors.length,
      sponsors: sponsors.length,
    },
    terminology,
  };

  const data: EventData = { ...summary, attendees, speakers, exhibitors, sponsors };
  return { summary, data };
}

const outDir = path.join(process.cwd(), "src/data/events");
fs.mkdirSync(outDir, { recursive: true });

const allSummaries: EventSummary[] = [];
let totalPersons = 0;

console.log("Generating 50 events...");
for (let i = 0; i < 50; i++) {
  const { summary, data } = generateEvent(i);
  allSummaries.push(summary);

  const eventPersons =
    data.attendees.length +
    data.speakers.length +
    data.exhibitors.reduce((sum, c) => sum + c.contacts.length, 0) +
    data.sponsors.reduce((sum, c) => sum + c.contacts.length, 0);
  totalPersons += eventPersons;

  fs.writeFileSync(path.join(outDir, `${summary.id}.json`), JSON.stringify(data));
  process.stdout.write(`\r  ${i + 1}/50 — ${summary.name} (${eventPersons.toLocaleString()} persons)`);
}

fs.writeFileSync(
  path.join(process.cwd(), "src/data/events/index.json"),
  JSON.stringify(allSummaries, null, 2)
);

fs.writeFileSync(
  path.join(process.cwd(), "src/data/stats.json"),
  JSON.stringify({ totalEvents: 50, totalPersons }, null, 2)
);

console.log(`\n\nDone. ${totalPersons.toLocaleString()} total persons across 50 events.`);
