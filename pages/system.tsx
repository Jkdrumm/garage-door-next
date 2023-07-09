import { Container, Heading, Skeleton, Text } from '@chakra-ui/react';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { useMainLayout } from 'components';
import { requireAdmin } from 'auth';
import { useCpuTemp, useDiskSpace } from 'hooks';

function System() {
  const { data: diskSpace, isLoading: isDiskSpaceLoading } = useDiskSpace();
  const { data: cpuTemp, isLoading: isCpuTempLoading } = useCpuTemp();

  return (
    <>
      <Container maxW="4xl">
        <Heading mb="32px" mt={{ base: '24px', md: '40px' }}>
          System
        </Heading>
        <Text display="inline">Free Disk Space:&nbsp;</Text>
        <Skeleton isLoaded={!isDiskSpaceLoading} display="inline">
          {diskSpace ? `${Math.floor(diskSpace.available / 1000000)} MB` : '100000 MB'}
        </Skeleton>
        <br />
        <Text display="inline">Total Disk Space:&nbsp;</Text>
        <Skeleton isLoaded={!isDiskSpaceLoading} display="inline">
          {diskSpace ? `${Math.floor(diskSpace.size / 1000000)} MB` : '100000 MB'}
        </Skeleton>
        <br />
        <Text display="inline">CPU Temp:&nbsp;</Text>
        <Skeleton isLoaded={!isCpuTempLoading} display="inline">
          {cpuTemp ? `${cpuTemp}°C` : '???°C'}
        </Skeleton>
      </Container>
    </>
  );
}

export const getServerSideProps = requireAdmin(async () => {
  const queryClient = new QueryClient();
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

System.getLayout = useMainLayout;

export default System;
