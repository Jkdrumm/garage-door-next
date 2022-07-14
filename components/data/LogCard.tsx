import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Center,
  Flex,
  useColorModeValue,
  Text,
  Table,
  Th,
  Thead,
  Tr,
  Tbody,
  Td
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import { GarageState } from '../../utils/enums';
import { LogEntryResult, LogEvent } from '../../utils/types/LogEntry';

export interface LogCardProps extends Omit<LogEntryResult, 'id'> {}

export const LogCard = ({ event, date, oldValue, newValue, userId, username, firstName, lastName }: LogCardProps) => {
  const dateObject = new Date(date);
  const timeFormatted = dateObject.toLocaleTimeString();

  const getBadgeColor = () => {
    switch (event) {
      case LogEvent.PRESS:
        return 'purple';
      case LogEvent.STATE_CHANGE:
        return 'green';
      case LogEvent.SHUT_DOWN:
        return 'red';
      case LogEvent.BOOT:
      default:
        return 'default';
    }
  };

  const getBodyText = () => {
    switch (event) {
      case LogEvent.PRESS:
        return (
          <>
            <Text display="inline">User: </Text>
            <Text display="inline" fontWeight="semibold">{`${firstName} ${lastName} (${username})`}</Text>
          </>
        );
      case LogEvent.STATE_CHANGE:
        return (
          <Table width="auto" variant="unstyled" m="-16px -23px">
            <Thead>
              <Tr>
                <Th>From</Th>
                <Th>To</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{oldValue !== undefined && <Badge>{GarageState[oldValue]}</Badge>}</Td>
                <Td>{newValue !== undefined && <Badge>{GarageState[newValue]}</Badge>}</Td>
              </Tr>
            </Tbody>
          </Table>
        );
      case LogEvent.BOOT:
        return <Text fontWeight="semibold">System Boot</Text>;
      case LogEvent.SHUT_DOWN:
        return <Text fontWeight="semibold">System Shutdown</Text>;
      default:
        return <Text fontWeight="semibold">{event}</Text>;
    }
  };

  return (
    <Box padding="4px" margin="-6px -4px -8px">
      <Box
        as={Accordion}
        allowToggle
        overflow="hidden"
        borderColor="purple.300"
        bg={useColorModeValue('gray.400', 'gray.700')}
        borderRadius="8px"
        mb="8px"
        _hover={{ margin: '-3px -3px 5px -3px', borderWidth: '3px' }}>
        <AccordionItem border="none">
          {({ isExpanded }) => (
            <>
              <AccordionButton padding="8px 16px 8px 8px">
                <Flex justify="space-between" width="100%">
                  <Box>
                    <Badge mt="-4px" colorScheme={getBadgeColor()}>
                      {event}
                    </Badge>
                  </Box>
                  <Flex>
                    {timeFormatted}
                    <Center
                      ml="8px"
                      transition="transform 0.2s, color 0.2s"
                      transformOrigin="center"
                      transform={isExpanded ? 'rotate(-180deg)' : undefined}
                      color="purple.300">
                      <FiChevronDown size="16px" />
                    </Center>
                  </Flex>
                </Flex>
              </AccordionButton>
              <Box as={AccordionPanel} padding="16px" bg={useColorModeValue('gray.300', 'gray.600')}>
                {getBodyText()}
              </Box>
            </>
          )}
        </AccordionItem>
      </Box>
    </Box>
  );
};
