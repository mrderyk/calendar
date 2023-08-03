import { Box, Button, Flex, FormControl, FormLabel, Input, useToast, Tag } from "@chakra-ui/react";
import { DateInput, Select, SmallInput, TimeInput } from "../../../../baseComponents/inputs";
import { LargeButton } from "../../../../baseComponents/buttons";
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { CalendarEvent, PendingCalendarEvent, VideoType } from "../../../types";

interface EventEditorProps {
  eventDetails: CalendarEvent | PendingCalendarEvent;
  onConfirm: (latestChange: Partial<CalendarEvent>) => void;
  onDelete?: () => void;
  onClose?: () => void;
  confirmLabel?: string;
  successLabel?: string;
}

type StartTimeUpdates = {
  year?: number;
  month?: number;
  date?: number;
  hours?: number;
  minutes?: number;
}

/**
 * Assembles various form inputs to allow for editing calendar events.
 */
export const EventEditor: FC<EventEditorProps> = ({
  eventDetails,
  onConfirm,
  onDelete,
  onClose,
  confirmLabel = "Save Changes",
  successLabel = "Event edited successfully!"
}) => {
  const eventDate = useMemo(() => new Date(eventDetails.startDate), [eventDetails.startDate]);
  const eventDateMonth = eventDate.getMonth();
  const eventDateDate = eventDate.getDate();
  const eventDateYear = eventDate.getFullYear();
  const eventDateHours = eventDate.getHours();
  const eventDateMins = eventDate.getMinutes();
  const eventVideoType = eventDetails.videoType ?? "none";

  // Initialize changes with existing attendees
  // since any changes will use that initial list as a working set
  const [changes, setChanges] = useState<Partial<CalendarEvent>> ({
    attendees: [...eventDetails.attendees],
  });

  const toast = useToast();

  const onTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChanges(prevState => ({
      ...prevState,
      title: e.target.value
    }));
  }, []);

  const onDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsedDuration = parseInt(e.target.value);
    if (!parsedDuration) {
      return;
    }
    setChanges(prevState => ({
      ...prevState,
      durationMins: parsedDuration,
    }));
  }, []);

  const onAddAttendee = useCallback((attendeeToAdd: string) => {
    const updatedAttendees = changes.attendees ?? [];
    updatedAttendees.push(attendeeToAdd);

    setChanges(prevState => ({
      ...prevState,
      attendees: updatedAttendees,
    }));
  }, [changes]);

  const onRemoveAttendee = useCallback((attendeeToRemove: string) => {
    const updatedAttendees = (changes.attendees ?? []).filter(attendee => attendee !== attendeeToRemove);

    setChanges(prevState => ({
      ...prevState,
      attendees: updatedAttendees,
    }));
  }, [changes]);

  const computeUpdatedStartTime = useCallback((updates: StartTimeUpdates) => {
    const mostRecentStartTimeEdits = changes.startDate ? new Date(changes.startDate) : eventDate;
    const timeParts = {
      year: mostRecentStartTimeEdits.getFullYear(),
      month: mostRecentStartTimeEdits.getMonth(),
      date: mostRecentStartTimeEdits.getDate(),
      hours: mostRecentStartTimeEdits.getHours(),
      minutes: mostRecentStartTimeEdits.getMinutes(),
    };
    
    const updatedTimeParts = {
      ...timeParts,
      ...updates,
    }

    const updatedEventStartDate = new Date(updatedTimeParts.year, updatedTimeParts.month, updatedTimeParts.date, updatedTimeParts.hours, updatedTimeParts.minutes);
    return updatedEventStartDate.toISOString();

  }, [changes.startDate, eventDate]);

  const confirmEdit = useCallback(() => {
    onConfirm(changes);
    onClose?.();
    toast({
      title: successLabel,
      status: "success",
    });
  }, [changes, onClose, onConfirm, successLabel, toast]);

  const confirmDelete = useCallback(() => {
    onDelete?.();
    onClose?.();
    toast({
      title: "Event deleted successfully!",
      status: "success",
    });
  }, [onClose, onDelete, toast]);

  const attendeesWithRecentEdits = changes.attendees ?? eventDetails.attendees;

  return (
    <Flex direction="column" alignItems="left" gap={4} width="100%" position="relative">
      <Box>
        <FormControl >
          <FormLabel fontSize="1rem" mb={1}>EVENT TITLE</FormLabel>
          <SmallInput onChange={onTitleChange} defaultValue={eventDetails.title} width="100%" />
        </FormControl>
      </Box>
      
      <Flex gap={4} flexWrap="wrap">
        <DateInput
          currentMonth={eventDateMonth}
          currentDate={eventDateDate}
          currentYear={eventDateYear}
          onChangeMonth={(e: ChangeEvent<HTMLSelectElement>) => {
            const updatedStartTime = computeUpdatedStartTime({ month: parseInt(e.currentTarget.value) });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime
            }));
          }}
          onChangeDate={(e: ChangeEvent<HTMLSelectElement>) => {
            const updatedStartTime = computeUpdatedStartTime({ date: parseInt(e.target.value) });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime,
            }));
          }}
          onChangeYear={(e: ChangeEvent<HTMLInputElement>) => {
            const updatedStartTime = computeUpdatedStartTime({ year: parseInt(e.target.value) });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime
            }));
          }}
        />
        <TimeInput
          currentHours={eventDateHours}
          currentMinutes={eventDateMins}
          onChangeHours={(selectedHours, amPm) => {
            const possiblyUpdatedAmPm = amPm;
            let updatedHours;

            if (selectedHours === 12) {
              updatedHours = possiblyUpdatedAmPm === "pm" ? 12 : 0;
            } else {
              updatedHours = selectedHours + (possiblyUpdatedAmPm === "pm" ? 12 : 0);
            }
            const updatedStartTime = computeUpdatedStartTime({ hours: updatedHours });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime,
            }));
          }}
          onChangeMinutes={(e: ChangeEvent<HTMLSelectElement>) => {
            const updatedStartTime = computeUpdatedStartTime({ minutes: parseInt(e.target.value) });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime,
            }));
          }}
          onChangeAmPm={(e: ChangeEvent<HTMLSelectElement>) => {
            const ampm = e.target.value;
            const workingDate = new Date(changes.startDate ? changes.startDate : eventDate.toISOString());
            const updatedHours = workingDate.getHours() + (ampm === 'pm' ? 12 : -12);
            const updatedStartTime = computeUpdatedStartTime({ hours: updatedHours });
            setChanges(prevState => ({
              ...prevState,
              startDate: updatedStartTime,
            }));
          }}
        />
        <Box>
          <FormControl flexBasis="0 1 10%">
            <FormLabel fontSize="1rem" mb={1}>DURATION</FormLabel>
            <Flex border="1px solid #aaaaaa" px={4} py={2} borderRadius={6} gap={1} alignItems="center">
              <Box>
                <Input
                  type="number"
                  onChange={onDurationChange}
                  defaultValue={eventDetails.durationMins.toString()}
                  size="sm"
                  padding={0}
                  width="3rem"
                  fontSize="1rem"
                  border="none"
                  height="1.5rem"
                  _focus={{
                    boxShadow: "none"
                  }}
                />
              </Box>
            </Flex>
          </FormControl>
        </Box>
        <Box>
          <FormControl flexBasis="0 1 10%">
            <FormLabel fontSize="1rem" mb={1}>VIDEO</FormLabel>
            <Flex border="1px solid #aaaaaa" px={4} py={2} borderRadius={6} gap={1} alignItems="center">
              <Box>
              <Select
                value={eventVideoType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setChanges(prevState => ({
                    ...prevState,
                    videoType: e.target.value as VideoType
                  }));
                }}
              >
                <option key="video:none" value={'none'}>NONE</option>
                <option key="video:zoom" value={'zoom'}>ZOOM</option>
                <option key="video:meet" value={'meet'}>MEET</option>
              </Select>
              </Box>
            </Flex>
          </FormControl>
        </Box>
      </Flex>
      <Flex>
        <FormControl>
          <FormLabel fontSize="1rem" mb={1}>ATTENDEES</FormLabel>
          <Flex gap={1} flexWrap="wrap">
            {
              attendeesWithRecentEdits.map((name, index) => (
                <Attendee key={`attendee:${index}`} name={name} onDelete={onRemoveAttendee} />
              ))
            }
            <AddAttendee onAdd={onAddAttendee}/>
          </Flex>
        </FormControl>
      </Flex>
      <Flex justifyContent="center" gap={4} mt={4}>
        <LargeButton onClick={confirmEdit}>{confirmLabel}</LargeButton>
        {
          onDelete && <LargeButton variant="critical" onClick={confirmDelete}>Delete</LargeButton>
        }
      </Flex>
    </Flex>
  );
};

interface AttendeeProps {
  name: string;
  onDelete: (attendeeToRemove: string) => void;
}

/**
 * attendee badget widget
 */
const Attendee: FC<AttendeeProps> = ({ name, onDelete }) => {
  return (
    <Tag display="flex" backgroundColor="rgb(220,241,248)" border="1px solid rgb(152,214,250)" alignItems="center" gap={1}>
      <Box>{name}</Box>
      <Box >
      <Button
          backgroundColor="transparent"
          onClick={() => onDelete(name)}
          border="2px solid rgba(0, 0, 0, 0.4)"
          height="1rem"
          width="1rem"
          minWidth="none"
          padding={1}
          borderRadius="50%"
        >
          <CloseIcon color="rgba(0, 0, 0, 0.8)" boxSize={1.5} />
        </Button>
        </Box>
    </Tag>
  )
};

interface AddAttendeeProps {
  onAdd: (name: string) => void;
}

/**
 * UI sub-component for adding an attendee to a calendar event.
 */
const AddAttendee: FC<AddAttendeeProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const startAdding = () => {
    setIsAdding(true)
  };

  const addValidAttendee = () => {
    if (!inputRef.current?.value) {
      toast({
        title: "Error: invalid attendee name",
        status: "error"
      })
    } else {
      onAdd(inputRef.current.value);
      setIsAdding(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [isAdding]);

  return (
    <Tag
      display="flex"
      backgroundColor="rgb(220,241,248)"
      border="1px solid rgb(152,214,250)"
      alignItems="center"
      gap={1}
      cursor="pointer"
    >
      <Flex alignItems="center" gap={1}>
        {
          isAdding &&
          (
            <Input
              ref={inputRef}
              fontSize=".8rem"
              size="xs"
              p={0}
              height="1rem"
              _focus={{
                boxShadow: "none"
              }}
            />
          ) 
        }
          
        <Button
          border="2px solid rgba(0, 0, 0, 0.4)"
          color="rgba(0, 0, 0, 0.5)"
          onClick={isAdding ? addValidAttendee : startAdding}
          height="1rem"
          width="1rem"
          minWidth="none"
          padding={1}
          borderRadius="50%"
        >
          <AddIcon color="rgba(0, 0, 0, 0.8)" boxSize={1.5} />
        </Button>
      </Flex>
    </Tag>
  )
}