import {
  Box,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react';
import { Fragment, useState } from 'react';
import { LogCard } from '../components';
import { useMainLayout } from '../components/layouts';
import { requireAdmin } from '../utils/auth';
import { useLogs } from '../utils/hooks';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import { LogLength } from '../utils/types/LogEntry';

const Logs = () => {
  const todayFormatted = new Date().toLocaleDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toLocaleDateString();

  const [date, setDate] = useState(new Date());
  const [length, setLength] = useState<LogLength>('day');
  const { data: logs } = useLogs(date, length);

  return (
    <Container maxW="4xl">
      <Heading mb="32px" mt={{ base: '24px', md: '40px' }}>
        Logs
      </Heading>
      <FormControl>
        <FormLabel htmlFor="date-input">Start Date</FormLabel>
        <SingleDatepicker name="date-input" date={date} onDateChange={setDate} />
        <FormLabel htmlFor="length" mt="8px">
          Search back one...
        </FormLabel>
        <RadioGroup defaultValue="day" name="length" onChange={e => setLength(e as LogLength)}>
          <Stack spacing={4} direction="row">
            <Radio value="day">Day</Radio>
            <Radio value="week">Week</Radio>
            <Radio value="month">Month</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      {logs ? (
        logs.map(({ id, ...logEntry }, index) => {
          const formattedDate = new Date(logEntry.date).toLocaleDateString();
          return (
            <Fragment key={id}>
              {(index === 0 || new Date(logs[index - 1].date).toLocaleDateString() !== formattedDate) && (
                <Flex m="16px 0px 2px 0px" direction="column" align="center">
                  <Box bg="red.400" mb="-16px" padding="4px" borderTopRadius="4px">
                    <Text fontSize="14px">
                      {formattedDate === todayFormatted
                        ? 'Today'
                        : formattedDate === yesterdayFormatted
                        ? 'Yesterday'
                        : formattedDate}
                    </Text>
                  </Box>
                  <Divider m="16px 0px " bg="red.400" height="1px" borderRadius="full" opacity="1" />
                </Flex>
              )}
              <LogCard {...logEntry} />
            </Fragment>
          );
        })
      ) : (
        <Stack>
          <Flex m="16px 0px -8px 0px" direction="column" align="center">
            <Box bg="red.400" mb="-16px" padding="4px" borderTopRadius="4px">
              <Skeleton>
                <Text fontSize="14px">Today</Text>
              </Skeleton>
            </Box>
            <Divider m="16px 0px " bg="red.400" height="1px" borderRadius="full" opacity="1" />
          </Flex>
          {[...Array(16).keys()].map(index => (
            <Skeleton key={index} height="40px" mb="8px" borderRadius="8px" />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Logs;

export const getServerSideProps = requireAdmin();

Logs.getLayout = useMainLayout;