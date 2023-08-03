import { FC } from "react";
import { CalendarEvent } from "../../types";
import { Box } from "@chakra-ui/react";
import { EventsDisplay } from "./EventsDisplay";
import { CELL_HEIGHT_REMS } from "../../constants";

const QUARTER_HOURS_IN_DAY = 96;

export interface DayProps {
  events: Array<CalendarEvent>;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}

/**
 * Day View showing all calendar events for that day
 */
export const Day: FC<DayProps> = ({ events, onUpdateEvent, onDeleteEvent }) => {
  const quarterCells = [];

  for (let i = 0; i < QUARTER_HOURS_IN_DAY; i++) {
    quarterCells.push(<TimelineCell key={`timelineCell:${i}`} isTopOfHour={ i % 4 === 0 }/>);
  }

  return (
    <Box position="relative">
    { quarterCells }
    <EventsDisplay eventsForDay={events} onDeleteEvent={onDeleteEvent} onUpdateEvent={onUpdateEvent}/>
    </Box>
  )
};

interface TimelineCellProps {
  isTopOfHour: boolean;
}

const TimelineCell: FC<TimelineCellProps> = ({ isTopOfHour }) => {
  return (
    <Box
      height={`${CELL_HEIGHT_REMS}rem`}
      _first={{borderTop: "none"}}
      borderTop={isTopOfHour ? "1px solid rgb(75, 75, 75)" : "1px dotted rgba(75, 75, 75, 0.5)" }
      backgroundColor="#dcf1f8"
    />
  )
}
