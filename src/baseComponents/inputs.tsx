import { Box, Input, Select as ChakraSelect, FormControl, FormLabel, Flex } from "@chakra-ui/react";
import { ChangeEvent, FC, LegacyRef, ReactNode, useRef } from "react";
import { HOUR_VALUES, MINUTE_VALUES, MONTH_VALUES } from "../Calendar/constants";

const SELECT_PROPS = {
  fontSize: "1rem",
  fontWeight:"400",
  size: "xs",
  icon: <div />,
};

interface InputProps {
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  defaultValue?: string;
  wrapped?: boolean;
}

/**
 * Wrapped input component used for forms.
 */
export const SmallInput: FC<InputProps & { width?: string; size?: string; }> = ({
  placeholder,
  onChange,
  type="text",
  defaultValue,
  width, size,
  wrapped = true
}) => {
  const input = (
    <Input
      onChange={onChange}
      width="100%"
      border="none"
      fontSize="1rem"
      fontWeight="400"
      placeholder={placeholder}
      type={type}
      defaultValue={defaultValue}
      size={size}
      _focus={{boxShadow: "none"}}
    />
  )
  if (wrapped) {
    return (
      <Box border="1px solid #aaaaaa" width={`${width ?? "50%"}`} py={1} borderRadius={6}>
        { input }
      </Box>
    )
  }

  return input;
};

interface SelectProps {
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  width?: string;
  children?: ReactNode;
  innerRef?: LegacyRef<HTMLSelectElement>;
}

/**
 * Styled select menu
 */
export const Select: FC<SelectProps> = ({ onChange, width, value, children, innerRef }) => (
  <ChakraSelect
    {...SELECT_PROPS}
    ref={innerRef}
    defaultValue={value}
    fontSize="1rem"
    fontWeight="400"
    size="xs"
    icon={<div />}
    onChange={onChange}
    width={width}
  >  
    { children }
  </ChakraSelect>
);

interface DateInputProps {
  currentMonth: number;
  currentDate: number;
  currentYear: number;
  onChangeMonth: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeDate: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeYear: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Assembles multiple Select and SmallInput fields into a reusable date input.
 */
export const DateInput: FC<DateInputProps> = ({
  currentMonth,
  currentDate,
  currentYear,
  onChangeMonth,
  onChangeDate,
  onChangeYear
}) => {
  const daysInEventMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const datesSelectOptions = [];

  for (let i = 1 ; i < daysInEventMonth + 1; i++) {
    datesSelectOptions.push(
      <option key={`dateSelect:${i}`} value={i.toString()}>{`${i < 10 ? "0" : ""}${i}`}</option>
    )
  }
  return (
    <Box>
      <FormControl>
        <FormLabel fontSize="1rem" mb={1}>DATE</FormLabel>
        <Flex border="1px solid #aaaaaa" px={4} py={2} borderRadius={6} gap={1} alignItems="center">
          <Box>
            <Select value={currentMonth.toString()} width="1.5rem" onChange={onChangeMonth}>
              {
                MONTH_VALUES.map(month => {
                  return (
                    <option key={`monthSelect:${month}`} value={month.toString()}>{`${month + 1 < 10 ? "0" : ""}${month + 1}`}</option>
                  )
                })
              }
            </Select>
          </Box>
          /
          <Box>
            <Select
              value={currentDate.toString()}
              width="1.5rem"
              onChange={onChangeDate}
            >
              {datesSelectOptions}
            </Select>
          </Box>
          /
          <Box>
            <Input
              type="number"
              onChange={onChangeYear}
              defaultValue={currentYear.toString()}
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
  )
}

interface TimeInputProps {
  currentHours: number;
  currentMinutes: number;
  onChangeHours: (selectedHours: number, amPm: string) => void;
  onChangeMinutes: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeAmPm: (e: ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Assembles multiple Select components into a reusable time input component.
 */
export const TimeInput: FC<TimeInputProps> = ({
  currentHours,
  currentMinutes,
  onChangeHours,
  onChangeMinutes,
  onChangeAmPm
}) => {
  const ampmRef = useRef<HTMLSelectElement>(null);

  const onChangeHoursInternal = (e: ChangeEvent<HTMLSelectElement>) => {
    onChangeHours(parseInt(e.target.value), ampmRef.current?.value ?? "am")
  };

  let defaultSelectedHours;

  if (currentHours > 12) {
    defaultSelectedHours = (currentHours % 12).toString();
  } else if (currentHours === 12 || currentHours === 0) {
    defaultSelectedHours = "12";
  }
  else {
    defaultSelectedHours = currentHours.toString();
  }

  return (
    <Box>
      <FormControl>
        <FormLabel fontSize="1rem" mb={1}>TIME</FormLabel>
        <Flex border="1px solid #aaaaaa" px={4} py={2} borderRadius={6} gap={1} alignItems="center">
          <Select
            value={defaultSelectedHours}
            onChange={onChangeHoursInternal}
          >
            {
              HOUR_VALUES.map(hour => {
                return (
                  <option key={`hourSelect:${hour.toString()}`} value={hour.toString()} >{`${hour < 10 ? "0" : ""}${hour}`}</option>
                )
              })
            }
          </Select>
          :
          <Select
            value={currentMinutes.toString()}
            onChange={onChangeMinutes}
          >
            {
              MINUTE_VALUES.map(minute => {
                return (
                  <option key={`minuteSelect:${minute}`} value={minute.toString()}>{`${minute < 10 ? "0" : ""}${minute}`}</option>
                )
              })
            }
          </Select>
          <Box flexShrink={0}>
            <Select
              innerRef={ampmRef}
              value={currentHours < 12 ? 'am' : 'pm'}
              onChange={onChangeAmPm}
            >
              <option key={`amPmSelect:am`} value={'am'}>AM</option>
              <option key={`amPmSelect:pm`} value={'pm'}>PM</option>
            </Select>
          </Box>
        </Flex>
      </FormControl>
    </Box>
  )
}

