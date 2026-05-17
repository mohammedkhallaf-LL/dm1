export interface Session {
  id: string;
  title: string;
  day: string;
  time: string;
  track: "Keynote" | "Workshop" | "Panel" | "Breakout";
  room: string;
}

export interface Person {
  id: string;
  eventId: string;
  participantType: "attendee" | "speaker" | "exhibitor_staff" | "sponsor_contact" | "other";
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  company: string;
  companyWebsite: string;
  companyPhone: string;
  email: string;
  city: string;
  country: string;
  geoRegion: string;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  bio: string | null;
  industry: string;
  interests: string[];
  eventTypesOrganized: string[] | null;
  orgType: string | null;
  allowMeeting: boolean;
  isNewAttendee: boolean;
  sessions: Session[] | null;
  exhibitorId: string | null;
  boothNumber: string | null;
  hall: string | null;
  sponsorTier: "gold" | "silver" | "bronze" | null;
  profileUrl: string;
  hasGatedSection: boolean;
  gatedInterests: string[] | null;
  meetingSlots: string[] | null;
}

export interface Company {
  id: string;
  eventId: string;
  type: "exhibitor" | "sponsor";
  name: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  industry: string;
  size: string;
  boothNumber: string | null;
  hall: string | null;
  sponsorTier: "gold" | "silver" | "bronze" | null;
  contacts: Person[];
  description: string;
}

export interface EventTerminology {
  attendees: string;
  speakers: string;
  exhibitors: string;
  sponsors: string;
}

export interface EventSummary {
  id: string;
  name: string;
  dates: { start: string; end: string };
  location: { city: string; country: string; venue: string };
  category: string;
  industry: string;
  description: string;
  participantCounts: {
    attendees: number;
    speakers: number;
    exhibitors: number;
    sponsors: number;
  };
  terminology: EventTerminology;
}

export interface EventData extends EventSummary {
  attendees: Person[];
  speakers: Person[];
  exhibitors: Company[];
  sponsors: Company[];
}
