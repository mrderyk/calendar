import { FC } from "react";
import { CalendarEvent, WeekData } from "../../types";
import { Flex, useBreakpoint } from "@chakra-ui/react";
import { DateObj } from "dayzed";
import { EventCount } from "./components/EventCount";
import { getEventsForDate } from "../../utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface WeekProps {
  dateDatas: WeekData;
  events: Array<CalendarEvent>;
  onSelectDate: (selectedDateIndex: number) => void;
  selectedDateIndex: number;
}

/**
 * Week-wide date display and selector (for smaller breakpoints)
 */
export const DateSelector: FC<WeekProps> = ({ dateDatas, events, onSelectDate, selectedDateIndex }) => {
  return (
      <Flex
        justifyContent={{base: "initial", lg: "space-between"}}
        width="100%"
      >
      {
        dateDatas.map((dateData, index) => {
          const dateObj = (dateData as DateObj);
          const eventsForDate = getEventsForDate(dateObj.date, events);
          return (
            <DateCell
              key={dateObj.date.getDate()}
              date={dateObj.date}
              isToday={dateObj.today}
              events={eventsForDate}
              dayName={DAYS[index]}
              onSelect={() => onSelectDate(index)}
              selected={selectedDateIndex === index}
            />
          )
        })
      }
      </Flex>
  );
};

interface DateCellProps {
  date: Date;
  isToday: boolean;
  events: Array<CalendarEvent>;
  dayName: string;
  onSelect: () => void;
  selected: boolean;
}

const DateCell: FC<DateCellProps> = ({ date, dayName, isToday, events, onSelect, selected }) => {
  const breakpoint = useBreakpoint();
  return (
    <Flex
      flex={`0 0 calc(${1/7 * 100}%)`}
      height="auto"
      maxHeight="320px"
      maxWidth={`0 0 calc(${1/7 * 100})`}
      direction="column"
      justifyContent="right"
      p={1}
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        borderBottom={{
          base: selected ? "4px solid rgb(226,145,83)" : "none",
          lg: "none"
        }}
        _hover={{
          baseborderBottom: {
            base: "4px solid rgb(226,145,83)",
            lg: "none"
          }
        }}
        cursor={{
          base: "pointer",
          lg: "initial"
        }}
        onClick={["base", "sm", "md"].includes(breakpoint) ? onSelect : undefined}
      >
        <Flex
          fontSize={{
            base: "1rem",
            md: "2rem",
            lg:"2.5rem"
          }}
          fontWeight="600"
          alignItems="center"
          justifyContent="center"
          position="relative"
          p={{
            base: 1,
            sm: 2
          }}
          pb={{
            base: 0,
            sm: "initial",
          }}
        >
          {date.getDate()}
          {
            events.length > 0 &&
            <EventCount count={events.length}/>
          }
        </Flex>
        <Flex
          justifyContent="center"
          fontSize=".75rem"
          px={2}
          py={1}
          mt="auto"
          fontWeight="700"
        >
          {["base"].includes(breakpoint) ? dayName.charAt(0).toUpperCase() : dayName.toUpperCase()}
        </Flex>
      </Flex>
    </Flex>
  );
};
