import { FC } from "react";
import { CalendarEvent } from "../../types";
import { Day, DayProps } from "../Day"
import { Box, Flex } from "@chakra-ui/react";

interface WeekProps extends Omit<DayProps, "events"> {
  eventsArrays: Array<Array<CalendarEvent>>;
}

/**
 * Assembles a sequence of Day components to show a full week with days side-by-side.
 */
export const Week: FC<WeekProps> = ({ eventsArrays, onUpdateEvent, onDeleteEvent }) => {
  return (
    <Flex>
    {
      eventsArrays.map((events, index) => (
        <Box
          key={`events:week:${index}`}
          flex={`0 0 calc(${1/7 * 100}%)`}
          borderLeft="1px solid rgba(75, 75, 75, 0.25)"
          _first={{
            borderLeft: "none"
          }}
        >
          <Day
            events={events}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
          />
        </Box>
      ))
    }
    </Flex>
  )
}
