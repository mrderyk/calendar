import { CloseIcon } from "@chakra-ui/icons";
import { Button as ChakraButton, ModalCloseButtonProps as ChakraModalCloseButtonProps, CloseButton } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "confirm" | "critical"
  children?: ReactNode;
}

const BACKGROUND_COLORS: Record<"default" | "hover" | "active", Record<string, string>> = {
  default: {
    confirm: "rgba(0, 125, 50, 1.0)",
    critical: "rgba(135, 16, 0, 0.9)"
  },
  hover: {
    confirm: "rgba(0, 150, 50, 1.0)",
    critical: "rgba(204, 24, 0, 0.8)",
  },
  active: {
    confirm: "rgba(0, 175, 50, 1.0)",
    critical: "rgba(204, 24, 0, 0.8)",
  }
};

/**
 * Large Button component, used for major workflow actions.
 */
export const LargeButton: FC<ButtonProps> = ({ onClick, variant = "confirm", children }) => {
  return (
    <ChakraButton
      backgroundColor={BACKGROUND_COLORS["default"][variant]}
      _hover={{
        backgroundColor: BACKGROUND_COLORS["hover"][variant],
        cursor: "pointer"
      }}
      _active={{
        backgroundColor: BACKGROUND_COLORS["active"][variant],
        cursor: "pointer"
      }}
      fontSize="1.25rem"
      py={2}
      px={6}
      color="#ffffff"
      fontWeight="300"
      border="none"
      borderRadius={6}
      onClick={onClick}
    >
      {children}
    </ChakraButton>
  );
}

type ModalCloseButtonProps = Pick<ChakraModalCloseButtonProps, "onClick">;

/**
 * Wrapped Chakra button, used to close modals.
 */
export const ModalCloseButton: FC<ModalCloseButtonProps> = ({ onClick }) => {
  return (
    <CloseButton
      position="absolute"
      right={2}
      top={2}
      onClick={onClick}
      backgroundColor="rgba(135, 16, 0, 0.9)"
      padding={2}
      borderRadius={4}
      _hover={{
        backgroundColor:"rgba(204, 24, 0, 0.8)"
      }}
    >
      <CloseIcon color="#ffffff" />
    </CloseButton>
  );
}