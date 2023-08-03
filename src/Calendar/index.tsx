import { DateObj, useDayzed } from "dayzed";
import { Box, Button, Flex, Show } from "@chakra-ui/react";
import { CalendarEvent, CalendarState, WeekData } from "./types";
import { DateSelector } from "./components/DateSelector";
import "../Calendar.css";
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useScheduler } from "./hooks/useScheduler";
import {ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { getEventsForDate, getEventsForDates, getMonthsAndYearsIncludedInWeek, getUpdatedCalendar, getWeekIndexFromDate } from "./utils";
import { AddEventButton } from "./components/AddEventButton";
import { Day } from "./components/Day";
import { HOUR_VALUES } from "./constants";
import { Week } from "./components/Week";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const HOUR_VALUES_FULL_DAY = [...HOUR_VALUES, ...HOUR_VALUES.slice(0, 12)];

/**
 * The top-level Calendar widget
 */
export const Calendar = () => {
  const { addEvent, updateEvent, deleteEvent, getEventsForTimeSpan } = useScheduler();
  const initialDate = new Date();
  const initialYear = initialDate.getFullYear();
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentMonth: initialDate.getMonth(),
    currentYear: initialYear
  });
  const pendingCalendarChange = useRef<'previous'|'next' | null>(null);

  const minDate = new Date(calendarState.currentYear, calendarState.currentMonth , 1);
  const maxDate = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0);
  const { calendars } = useDayzed({
    minDate,
    maxDate,
    showOutsideDays: true,
    onDateSelected: () => {}
  });

  const currentMonthCalendar = calendars[0];
  const currentWeekIndex = getWeekIndexFromDate(initialDate, currentMonthCalendar.weeks);
  const [weekIndex, setWeekIndex] = useState<number>(currentWeekIndex);

  const dateDatas = currentMonthCalendar.weeks[weekIndex];
  const initialSelectedDateIndex = getDateIndexFromWeek(initialDate, dateDatas);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(initialSelectedDateIndex > -1 ? initialSelectedDateIndex : 0);
  const eventsForWeek: Array<CalendarEvent> = getEventsForTimeSpan((dateDatas[0] as DateObj).date, (dateDatas[6] as DateObj).date);

  const onMoveWeekBack = useCallback(() => {
    if (weekIndex === 0) {
      pendingCalendarChange.current = 'previous';
      setCalendarState(
        getUpdatedCalendar(calendarState, 'previous')
      );
    } else {
      setWeekIndex(weekIndex - 1);
    }
  }, [calendarState, weekIndex]);

  const onMoveWeekForward = useCallback(() => {
    if (weekIndex === currentMonthCalendar.weeks.length - 1) {
      setWeekIndex(0);
      pendingCalendarChange.current = 'next';
      setCalendarState(
        getUpdatedCalendar(calendarState, 'next')
      );
      
    } else {
      setWeekIndex(weekIndex + 1);
    }
  }, [calendarState, currentMonthCalendar.weeks.length, weekIndex]);

  const onSelectDate = useCallback((selectedDateIndex: number) => {
    setSelectedDateIndex(selectedDateIndex);
  }, [])

  useEffect(() => {
    const weeks = currentMonthCalendar.weeks;
    let weekHasOverflow

    switch (pendingCalendarChange.current) {
      case 'previous':
        weekHasOverflow = getMonthsAndYearsIncludedInWeek(weeks[weeks.length - 1]).months.length > 1;
        if (weekHasOverflow) {
          setWeekIndex(currentMonthCalendar.weeks.length - 2);
        } else {
          setWeekIndex(currentMonthCalendar.weeks.length - 1);
        }
        break;
      case 'next':
        weekHasOverflow = getMonthsAndYearsIncludedInWeek(weeks[0]).months.length > 1;
        if (weekHasOverflow) {
          setWeekIndex(1);
        } else {
          setWeekIndex(0);
        }
        break;
      default:
        break;
    }

    pendingCalendarChange.current = null;

  }, [currentMonthCalendar.weeks]);

  const monthHeaderString = `${MONTHS[calendarState.currentMonth]} ${calendarState.currentYear}`;

  return (
    <Flex  justifyContent="center" height="100%">
      <Flex 
        height="100%"
        alignItems="center"
        direction="column"
        justifyContent="center"
        px={{
          base: 1,
          sm: 4
        }}
        py={2}
        gap={2}
        minWidth="380px"
        maxWidth="1280px"
        flex="1"
        width="100%"
      >
        <Flex width="100%" fontSize="2rem" fontWeight="300" justifyContent="right" gap={2} alignItems="center">
          <Box>
            {monthHeaderString.toUpperCase()}
          </Box>
          <AddEventButton onAddEvent={addEvent} />
        </Flex>
        <Flex width="100%" alignItems="center" gap={1}>
          <MoveWeekButton onClick={onMoveWeekBack}>
            <ArrowBackIcon boxSize={4} />
          </MoveWeekButton>
          <DateSelector dateDatas={dateDatas} events={eventsForWeek} onSelectDate={onSelectDate} selectedDateIndex={selectedDateIndex} />
          <MoveWeekButton onClick={onMoveWeekForward}>
            <ArrowForwardIcon boxSize={4} />
          </MoveWeekButton>
        </Flex>
        <Flex flex="1" width="100%" overflow="scroll" borderRadius={6} border="1px solid rgb(0, 0, 0, 0.2)" borderBottom="3px solid rgba(0, 0, 0, 0.5)">
          <Box width="3rem">
            <HoursDisplay alignment="right"/>
          </Box>
          <Flex flex="1">
            <Box width="100%">
              <Show below="lg">
                <Day events={getEventsForDate((dateDatas[selectedDateIndex] as DateObj).date, eventsForWeek)} onUpdateEvent={updateEvent} onDeleteEvent={deleteEvent}/>
              </Show>
              <Show above="lg">
                <Week
                  eventsArrays={
                    getEventsForDates(dateDatas.map(dateData => (dateData as DateObj).date), eventsForWeek)
                  }
                  onUpdateEvent={updateEvent}
                  onDeleteEvent={deleteEvent}
                />
                
              </Show>
            </Box>
          </Flex>
          <Box backgroundColor="pink" width="3rem">
            <HoursDisplay alignment="left"/>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

interface ButtonProps {
  onClick: () => void;
}

interface HoursDisplayProps {
  alignment: "left" | "right";
}

/**
 * Hourly indicators on either side of the calendar event
 */
const HoursDisplay: FC<HoursDisplayProps> = ({ alignment }) => {
  const containerAlignment = alignment === "left" ? "flex-start" : "flex-end";
  const textAlignment = alignment === "left" ? "left" : "right";

  return (
    <Flex direction="column" backgroundColor="#dcf1f8" alignItems={containerAlignment}>
      {
        HOUR_VALUES_FULL_DAY.map((hour, index) => {
          const amPm = (index < 11 || index === 23) ? "AM" : "PM";
          return (
            <Flex
              key={`hoursDisplay:${alignment}:${hour.toString()}:${amPm}`}
              height="6rem"
              borderTop="1px solid rgba(75, 75, 75)"
              p={1}
              pb={0}
              _first={{ borderTop: "none" }}
              alignItems="flex-end"
              justifyContent={textAlignment}
              fontSize="0.6rem"
              width="75%"
              fontWeight="700"
            >
             {index < 23 && hour}{index < 23 && amPm}
            </Flex>
          )
        })
      }
    </Flex>
  )
}

/**
 * 
 */
const MoveWeekButton: FC<ButtonProps & { children: ReactNode }> = ({ onClick, children }) => {
  return (
    <Button
      padding={2}
      width="2rem"
      borderRadius="50%"
      backgroundColor="rgb(241,202,128)"
      _hover={{
        backgroundColor:"rgba(241,202,128, 0.8)"
      }}
      aspectRatio="1 / 1"
      onClick={onClick}
    >
        { children }
    </Button>
  )
};

/**
 * Returns the index of a given date from an array of dates of a week.
 */
export const getDateIndexFromWeek = (date: Date, dateDatas: WeekData): number => {
  const dateCopy = new Date(date.getTime());
  dateCopy.setHours(0, 0, 0, 0);

  return dateDatas.findIndex(dateData => (dateData as DateObj).date.toISOString() === dateCopy.toISOString());
};
