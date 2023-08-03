import { Flex, Text } from "@chakra-ui/react";
import { FC, useCallback, useMemo } from "react";
import { CalendarEvent, PendingCalendarEvent} from "../../../../types";
import { EventEditor } from "../../../Day/EventEditor";

interface EventPrompterProps {
  onAddEvent: (newEventData: PendingCalendarEvent) => void;
  onClose: () => void;
}

/**
 * Basic form to add a new calendar event.
 */
export const EventPrompter: FC<EventPrompterProps> = ({ onAddEvent, onClose }) => {
  const timeRoundingBasis = 1000 * 60 * 5;
  const dateBasis = useMemo(() => new Date(), []); 

  const pendingCalendarEvent: PendingCalendarEvent = useMemo(() => ({
    title: "My New Event",
    startDate: new Date(Math.ceil(dateBasis.getTime() / timeRoundingBasis) * timeRoundingBasis).toISOString(),
    attendees: [],
    durationMins: 60,
    videoType: null,
  }), [dateBasis, timeRoundingBasis]);

  const onConfirm = useCallback((updates: Partial<CalendarEvent>) => {
    onAddEvent({
      ...pendingCalendarEvent,
      ...updates
    });
    onClose();
  }, [onAddEvent, onClose, pendingCalendarEvent]);

  return (
    <Flex direction="column" alignItems="center" gap={4} width="100%" position="relative">
      <Text
        fontSize={{
          base: "1.5rem",
          md: "2rem"
        }}
        fontWeight="300"
      >
        Add a calendar event
      </Text>
      <EventEditor
        eventDetails={pendingCalendarEvent}
        onConfirm={onConfirm}
        confirmLabel="Schedule It"
        successLabel="Event created successfully!"
      />
    </Flex>
  );
};
