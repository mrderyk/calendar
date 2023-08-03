import { Flex } from "@chakra-ui/react";
import { FC } from "react";

interface EventCountProps {
  count: number;
}

/**
 * A small widget showing the number of events present in a given date.
 */
export const EventCount: FC<EventCountProps> = ({ count }) => {
  return (
    <>
      <Flex
        backgroundColor="rgb(38, 135, 0)"
        width={{
          base: "1.2rem",
          lg: "1.5rem"
        }}
        height={{
          base: "1.2rem",
          lg: "1.5rem"
        }}
        position="absolute"
        right={{
          base: "-.75rem",
          sm: "-.5rem"
        }}
        top={{
          base: "-.5rem",
          sm: "-.25rem",
          md: "0"
        }}
        color="#fff"
        fontSize={{
          base: ".6rem",
          lg: ".75rem"
        }}
        fontWeight={600}
        alignItems="center"
        justifyContent="center"
        borderRadius="50%"
      >
        {count}{count > 9 ? "+" : ""}
      </Flex>
    </>
  )
}