import { DateObj } from "dayzed";

export type CalendarState = {
  // The zero-indexed calendar month
  currentMonth: number;
  currentYear: number;
}

export type WeekData = Array<DateObj | ''>;

export type CalendarEvent = {
  // a unique id to easily be able to modify/delete the event
  id: string;
  title: string;
  attendees: string[];
  // a JS Date ISO string representing the event start date.
  // This is always in the local timezone.
  startDate: string;
  durationMins: number;
  videoType: VideoType;
};

export type PendingCalendarEvent = Omit<CalendarEvent, "id">;

export type VideoType = 'zoom' | 'meet' | null;

export type CalendarEvents = Array<CalendarEvent>;

/**
 * An internal representation of the time of a calendar event.
 */
export type CalendarEventTime = {
  // The date object for the time, in the local TZ.
  date: Date;

  // The Unix timestamp equivalent
  utcTimestamp: number;
}
