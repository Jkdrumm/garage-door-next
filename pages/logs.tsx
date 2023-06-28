import { Fragment, useState } from 'react';
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
  Text,
  VStack,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import { LogCard, useMainLayout } from 'components';
import { requireAdmin } from 'auth';
import { LogLength } from 'types';
import { useLogs } from 'hooks';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { prefetchLogs } from 'hooks/prefetch';

function Logs() {
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
        <Flex flexDir="column" alignItems="center">
          <AnimatePresence initial={false}>
            {logs.map(({ id, ...logEntry }, index) => {
              const formattedDate = new Date(logEntry.date).toLocaleDateString();
              const dateText = (() => {
                if (formattedDate === todayFormatted) return 'Today';
                if (formattedDate === yesterdayFormatted) return 'Yesterday';
                return formattedDate;
              })();
              return (
                <Fragment key={id}>
                  {(index === 0 || new Date(logs[index - 1].date).toLocaleDateString() !== formattedDate) && (
                    <Flex mt="16px" direction="column" align="center" width="100%">
                      <Box bg="red.400" mb="-16px" padding="4px" borderTopRadius="4px">
                        <Text fontSize="14px">{dateText}</Text>
                      </Box>
                      <Divider m="16px 0px " bg="red.400" height="1px" borderRadius="full" opacity="1" />
                    </Flex>
                  )}
                  <motion.div
                    key={id}
                    initial={{
                      height: '0px',
                      width: '80%',
                      opacity: 0,
                    }}
                    animate={{
                      height: 'auto',
                      width: '100%',
                      opacity: 1,
                      transition: {
                        duration: 0.25,
                      },
                    }}>
                    <LogCard {...logEntry} />
                  </motion.div>
                </Fragment>
              );
            })}
          </AnimatePresence>
        </Flex>
      ) : (
        <Stack>
          <Flex m="16px 0px -6px 0px" direction="column" align="center">
            <Box bg="red.400" mb="-16px" padding="4px" borderTopRadius="4px">
              <Skeleton>
                <Text fontSize="14px">Today</Text>
              </Skeleton>
            </Box>
            <Divider m="16px 0px " bg="red.400" height="1px" borderRadius="full" opacity="1" />
          </Flex>
          <VStack gap="2px">
            {[...Array(16).keys()].map(index => (
              <Skeleton key={index} height="40px" borderRadius="8px" width="100%" />
            ))}
          </VStack>
        </Stack>
      )}
    </Container>
  );
}

export default Logs;

export const getServerSideProps = requireAdmin(async () => {
  const queryClient = new QueryClient();
  await prefetchLogs(queryClient);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

Logs.getLayout = useMainLayout;
