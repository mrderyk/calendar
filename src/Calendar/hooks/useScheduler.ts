import { atom, useRecoilState } from "recoil";
import { CalendarEvent, CalendarEvents, PendingCalendarEvent } from "../types";
import { recoilPersist } from "recoil-persist";
import { useCallback } from "react";
import { nanoid } from "nanoid";

const { persistAtom } = recoilPersist();

const calendarEventsState = atom<CalendarEvents>({
  key: 'calendarEvents', 
  default: [],
  effects: [persistAtom]
});

/**
 * Exposes a set of utility functions that create and modify calendar events.
 * NOTE: Should we need to integrate a back end later on, that functionality will be inserted here.
 */
export const useScheduler = () => {
  const [calendarEvents, setCalendarEvents] = useRecoilState(calendarEventsState);

  const addEvent = useCallback((newEvent: PendingCalendarEvent) => {
    const calendarEvent = {
      id: nanoid(),
      ...newEvent
    };

    // Insert to the events array in the correct time sequence.
    // Using a real back end, we would also convert the time to UTC before writing to the DB.
    setCalendarEvents((prevState: CalendarEvents) => {
      const updatedEvents = [...prevState];

      if (updatedEvents.length === 0) {
        updatedEvents.push(calendarEvent);
      } else {
        const insertionIndex = updatedEvents.findIndex(event => event.startDate > calendarEvent.startDate);
        if (insertionIndex === -1) {
          updatedEvents.push(calendarEvent);
        } else {
          updatedEvents.splice(insertionIndex, 0, calendarEvent);
        }
      }

      return updatedEvents;
    });
  }, [setCalendarEvents]);

  const updateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {    
    setCalendarEvents((prevState: CalendarEvents) => {
      const eventToUpdateIndex = prevState.findIndex(event => event.id === eventId);
      if (eventToUpdateIndex === -1) {
        return prevState;
      }

      const updatedEvent = {
        ...prevState[eventToUpdateIndex],
        ...updates
      };

      const updatedEvents = [...prevState.slice(0, eventToUpdateIndex), ...prevState.slice(eventToUpdateIndex + 1, prevState.length)];

      // Insert the updated event in proper sorted order.
      const insertionIndex = updatedEvents.findIndex(event => event.startDate > updatedEvent.startDate);
      if (insertionIndex === -1) {
        updatedEvents.push(updatedEvent);
      } else {
        updatedEvents.splice(insertionIndex, 0, updatedEvent);
      }

      return updatedEvents;
    });
  }, [setCalendarEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    setCalendarEvents((prevState: CalendarEvents) => {
      const eventToDeleteIndex = prevState.findIndex(event => event.id === eventId);
      const updatedEvents = [...prevState.slice(0, eventToDeleteIndex), ...prevState.slice(eventToDeleteIndex + 1, prevState.length)];
      return updatedEvents;
    });
  }, [setCalendarEvents]);

  const getEventsForTimeSpan = useCallback((lowerBoundDate: Date, upperBoundDate: Date): Array<CalendarEvent> => {
    // Normalize dates to ensure they capture all relevant events:
    // Set lower bound date time to midnight.
    // Set upper bound date time to 23:59:59.
    const normalizedLowerBoundDate = new Date(lowerBoundDate);
    normalizedLowerBoundDate.setHours(0,0,0);
    const normalizedUpperBoundDate = new Date(upperBoundDate);
    normalizedUpperBoundDate.setHours(23,59,59);
   
    return calendarEvents.filter(
      (calendarEvent: CalendarEvent) => 
        calendarEvent.startDate >= normalizedLowerBoundDate.toISOString() && calendarEvent.startDate <= normalizedUpperBoundDate.toISOString()
    );
  }, [calendarEvents]);

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForTimeSpan
  };
};
