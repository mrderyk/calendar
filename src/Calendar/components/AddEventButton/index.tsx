import { AddIcon, } from "@chakra-ui/icons";
import { Button, useDisclosure } from "@chakra-ui/react";
import { FC } from "react";
import { EventPrompter } from "./components/EventPrompter";
import { PendingCalendarEvent } from "../../types";
import { Modal } from "../../../baseComponents/Modal";

interface AddEventButtonProps {
  onAddEvent: (newEventData: PendingCalendarEvent) => void
}

/**
 * Button used to expose the event creation UI.
 */
export const AddEventButton: FC<AddEventButtonProps> = ({ onAddEvent }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        backgroundColor="rgba(38, 135, 0, 0.8)"
        padding={2}
        borderRadius={4}
        _hover={{
          backgroundColor:"rgba(47, 166, 0, 0.8)"
        }}
        onClick={onOpen}
      >
          <AddIcon boxSize={3} color="white" />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <EventPrompter onClose={onClose} onAddEvent={onAddEvent} />
      </Modal>
    </>
  )
};
