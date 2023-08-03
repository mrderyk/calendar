import { Box, Flex, Text, useBreakpoint, useDisclosure } from "@chakra-ui/react";
import { CalendarEvent } from "../../../types";
import { FC, useCallback, useState } from "react";
import { Modal } from "../../../../baseComponents/Modal";
import { EventEditor } from "../EventEditor";
import { CELL_HEIGHT_REMS } from "../../../constants";

const TOTAL_DISPLAY_SLOTS = 96;

interface EventsDisplayProps {
  eventsForDay: Array<CalendarEvent>;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
}

interface EventDisplayConfig {
  // The time slot at which the event starts
  timelineSlotPosition: number;

  // How many slots the event takes in the calendar view
  timelineSlotHeight: number;

  // The percentage width of the event as displayed in the calendar.
  widthPct?: number;

  // The left position display offset of the displayed event.
  leftPosPct?: number;
}

/**
 * Component in charge of displaying calendar events on the calendar timeline.
 * Computes proper positioning based on scheduling conflicts, if any.
 */
export const EventsDisplay: FC<EventsDisplayProps> = ({ eventsForDay, onUpdateEvent, onDeleteEvent }) => {
  // A mapping of event IDs to their display configurations.
  const eventIdToDisplayConfig: Record<string, EventDisplayConfig> = {};

  // A 2D-array containing info on where events (by id) are placed in the timeline.
  // Very similar to grid template areas: https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas.
  const placementConfiguration: Array<Array<string>> = [];
  for (let i = 0; i < TOTAL_DISPLAY_SLOTS; i++) {
    placementConfiguration[i] = [];
  }
  
  // Update placement configuration by marking the slots that will contain the event.
  eventsForDay.forEach(event => {
    const timelineSlotPosition = computeEventTimelineSlotPosition(event.startDate);
    const timelineSlotHeight = computeEventTimelineSlotHeight(event.durationMins);
    
    // Store this computed information in our display config mapping.
    // We'll fill in the width later.
    eventIdToDisplayConfig[event.id] = {
      timelineSlotPosition,
      timelineSlotHeight,
    }

    for (let i = timelineSlotPosition; i < timelineSlotPosition + timelineSlotHeight; i++) {
      placementConfiguration[Math.floor(i)].push(event.id);
    };
  });

  // Now compute for how wide each event should be displayed.
  // This is a function of how many "sibling" events it may have in the same time slot,
  // so we can see overlapping events.
  Object.keys(eventIdToDisplayConfig).forEach(id => {
    const { maxSiblingIds, maxPositionIndex } = getSiblingsContext(id, placementConfiguration);
    const maxNumSiblings = maxSiblingIds.length;
    let widthPct: number;
    let leftPosPct: number;

    if (maxNumSiblings === 1) {
      widthPct = 100;
      leftPosPct = 0
    } else if (maxPositionIndex === 0) {
      widthPct = 100 / maxNumSiblings;
      leftPosPct = 0;
    } else {
      widthPct = 100 / maxNumSiblings;
      leftPosPct = (widthPct * maxPositionIndex) - ((widthPct / 2) * maxPositionIndex);

      maxSiblingIds.forEach(siblingId => {
        if (leftPosPct === eventIdToDisplayConfig[siblingId].leftPosPct) {
          leftPosPct += (widthPct / 2);
        }
      });
    }

    eventIdToDisplayConfig[id] = {
      ...eventIdToDisplayConfig[id],
      widthPct,
      leftPosPct,
    };
  });

  return (
    <>
    {
      eventsForDay.map(event => {
        return (
          <EventDisplay
            key={`eventDisplay:${event.id}:${eventIdToDisplayConfig[event.id].leftPosPct}`}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            eventDetails={event}
            configuration={eventIdToDisplayConfig[event.id]}
          />
        )
      })
    }
    </>
  )
}

interface EventDisplayProps {
  eventDetails: CalendarEvent;
  configuration: EventDisplayConfig;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (eventId: string) => void;
};

const EventDisplay: FC<EventDisplayProps> = ({ eventDetails, configuration, onUpdateEvent, onDeleteEvent }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { timelineSlotPosition, timelineSlotHeight, widthPct, leftPosPct } = configuration;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const breakpoint = useBreakpoint();
  const isLargeBreakpoint = !["base", "sm", "md"].includes(breakpoint);
  const onDelete = useCallback(() => {
    onDeleteEvent(eventDetails.id)
  }, [eventDetails.id, onDeleteEvent])
  const onConfirmEdit = useCallback((updates: Partial<CalendarEvent>) => {
    onUpdateEvent(eventDetails.id, updates);
  }, [eventDetails.id, onUpdateEvent]);

  const closeEditor = useCallback(() => {
    setIsExpanded(false);
    onClose();
  }, [onClose]);

  return (
    <Box
      position="absolute"
      top={`calc(${CELL_HEIGHT_REMS * timelineSlotPosition}rem + 1px)`}
      left={isExpanded && isLargeBreakpoint ? 0 : `${leftPosPct}%`}
      width={isExpanded && isLargeBreakpoint ? "100%" : `${widthPct}%`}
      height={`calc(${CELL_HEIGHT_REMS * timelineSlotHeight}rem - 1px)`}
      border="1px solid rgb(195, 196, 134)"
      borderRadius={4}
      backgroundColor="rgb(255, 245, 153)"
      cursor="pointer"
      onClick={onOpen}
      zIndex={isExpanded ? 100 : "initial"}
      onMouseOver={() => {
        setIsExpanded(true);
      }}
      onMouseOut={() => {
        setIsExpanded(false);
      }}
      _hover={{
        backgroundColor: "rgb(250, 244, 185)",
        border: "1px solid rgb(200, 201, 139)"
      }}
      overflow="scroll"
    >
      <Box
        fontSize=".75rem"
        px={1}
        py={0.5}
        textAlign="left"
      >
        <Box fontWeight="600" pr={1}>
          {get12HourTimeStringFromDateString(eventDetails.startDate)}
        </Box>
        <Box
          textAlign="left"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {eventDetails.title}
        </Box>
        <EditModal eventDetails={eventDetails} isOpen={isOpen} onClose={closeEditor} onConfirm={onConfirmEdit} onDelete={onDelete} />
      </Box>
    </Box>
  )
};

interface EditModalProps {
  eventDetails: CalendarEvent;
  isOpen: boolean;
  onConfirm: (updates: Partial<CalendarEvent>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const EditModal: FC<EditModalProps> = ({ eventDetails, isOpen, onClose, onConfirm, onDelete }) => {
  return (
    
    <Modal isOpen={isOpen} onClose={onClose}>
      <Flex direction="column" width="100%">
        <Text
          fontSize={{
            base: "1.5rem",
            md: "2rem"
          }}
          fontWeight="300"
        >
          Edit calendar event
        </Text>
        <EventEditor eventDetails={eventDetails} onConfirm={onConfirm} onDelete={onDelete} onClose={onClose} />
      </Flex>
    </Modal>
  );
}

const get12HourTimeStringFromDateString = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = date.getMinutes();
  const format = hours >= 12 ? 'PM' : 'AM';

  return `${normalizedHours}:${minutes < 10 ? '0' + minutes : minutes}${format}`
};

const computeEventTimelineSlotPosition = (startTimeString: CalendarEvent["startDate"]) => {
  const date = new Date(startTimeString);
  const hoursToMinutes = date.getHours() * 60;
  const minutes = date.getMinutes();

  const quarterHoursUntilStartTime = (hoursToMinutes + minutes) / 15;
  return quarterHoursUntilStartTime;
};

const computeEventTimelineSlotHeight = (durationMins: CalendarEvent["durationMins"]) => {
  return (durationMins / 15);
};

type SiblingContext = {
  // The IDs of siblings an event may have in the timeline.
  // Note: These are the siblings at the point in the timeline the event has the MOST siblings.
  maxSiblingIds: string[];

  // The max horizontal index this event would have in the timeline.
  // Ex. For a placement configuration: 
  // [
  //   [a, b, c],
  //   [d, a, b, c]
  // ],
  // Event C would be at index 3 at the max.
  maxPositionIndex: number;
};

const getSiblingsContext = (eventId: string, placementConfiguration: Array<Array<string>>): SiblingContext => {
  let maxNumSiblings = 0;
  let maxPositionIndex = 0;
  let maxSiblingIds: Array<string> = [];
  
  placementConfiguration.forEach(configuration => {
    if (!configuration.includes(eventId)) {
      return;
    }

    if (configuration.length > maxNumSiblings) {
      maxSiblingIds = configuration;
      maxPositionIndex = configuration.indexOf(eventId);
      maxNumSiblings = configuration.length
    }

  });

  return {
    maxSiblingIds,
    maxPositionIndex
  };
};
