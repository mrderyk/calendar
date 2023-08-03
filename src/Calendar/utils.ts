import { DateObj } from "dayzed";
import { CalendarEvent, CalendarState, WeekData } from "./types";

/**
 * Given a direction, returns a state representing the next calendar.
 */
export const getUpdatedCalendar = (calendarState: CalendarState, direction: 'next' | 'previous'): CalendarState => {
  const { currentMonth, currentYear } = calendarState;

  if (direction === 'previous') {
    if (currentMonth === 0) {
      return {
        currentMonth: 11,
        currentYear: currentYear - 1,
      }
    }

    return {
      currentMonth: currentMonth - 1,
      currentYear
    };
  }

  if (currentMonth === 11) {
    return {
      currentMonth: 0,
      currentYear: currentYear + 1,
    };
  }

  return {
    currentMonth: currentMonth + 1,
    currentYear,
  }
};

/**
 * Given a date, returns the index of the calendar week to display onscreen.
 */
export const getWeekIndexFromDate = (currentDate: Date, calendarWeeks: Array<WeekData>): number => {
  const currentDateCopy = new Date(currentDate.getTime());
  currentDateCopy.setHours(0, 0, 0, 0);
  let week;

  for (let i = 0; i < calendarWeeks.length; i++) {
    week = calendarWeeks[i];
    if (week.find(day => (day as DateObj).date.toISOString() === currentDateCopy.toISOString())) {
      return i;
    };
  }

  return 0;
};


/**
 * Returns the month indexes and years that are included in the week.
 * E.g. If a single week's dates includes two months:
 *   Sun, Dec 31 2023 -> Sat, Jan 6 2024
 */
export const getMonthsAndYearsIncludedInWeek = (dayDatas: WeekData): {
  months: Array<number>,
  years: Array<number>
} => {
  const firstMonthInWeek = (dayDatas[0] as DateObj).date.getMonth();
  const firstYearInWeek = (dayDatas[0] as DateObj).date.getFullYear();
  const months = [firstMonthInWeek];
  const years = [firstYearInWeek];

  let monthIndex;
  let year;

  for (let i = 1; i < dayDatas.length; i++) {
    monthIndex = (dayDatas[i] as DateObj).date.getMonth();
    year = (dayDatas[i] as DateObj).date.getFullYear();
    if (!months.includes(monthIndex)) {
      months.push(monthIndex);
    }
    if (!years.includes(year)) {
      years.push(year);
    }
  }

  return {
    months,
    years
  };
};

/**
 * Given an array of calendar events, return all the ones taking place on a given date.
 */
export const getEventsForDate = (date: Date, events: Array<CalendarEvent>) => {
  const endOfDate = new Date(date);
  endOfDate.setHours(23, 59, 59);

  return events.filter(event => event.startDate >= date.toISOString() && event.startDate <= endOfDate.toISOString());
};

/**
 * Given an array of calendar events, return all the ones taking place on an array of dates.
 * Returns an array of event arrays.
 */
export const getEventsForDates = (dates: Date[], events: Array<CalendarEvent>) => {
  const eventsArrays: Array<Array<CalendarEvent>> = [];

  dates.forEach(date => {
    eventsArrays.push(getEventsForDate(date, events));
  })

  return eventsArrays;
};