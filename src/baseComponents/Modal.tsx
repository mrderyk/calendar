import { FC, ReactNode } from "react"
import { Modal as ChakraModal, Flex, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react"
import { ModalCloseButton } from "./buttons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

/**
 * A preconfigured modal component.
 */
export const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter={"blur(8px)"} />
        <ModalContent
          width={{
            base: "100%",
            sm: "90%",
            md: "75%"
          }}
          height={{
            base: "100%",
            sm: "initial"
          }}
          margin={{
            base: 0,
            sm: 16
          }}
          maxWidth="none"
          display="flex"
        >
          <ModalCloseButton onClick={onClose} />
          <ModalBody
            backgroundColor="transparent"
            height="100%" border="1px solid rgba(0, 0, 0, 0.25)"
            p={6}
            borderRadius={6}
          >
            <Flex width="100%" justifyContent="center" alignItems="center" height="100%" >
              { children }
            </Flex>
          </ModalBody>
        </ModalContent>
      </ChakraModal>
  )
}