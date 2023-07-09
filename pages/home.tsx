import { Button, Flex, Text } from '@chakra-ui/react';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { FiAlertCircle, FiAlertTriangle, FiLoader, FiLock, FiUnlock } from 'react-icons/fi';
import { useUserLevel, usePress, useGarageState, useDeviceName } from 'hooks';
import { CenterBox, useMainLayout } from 'components';
import { UserLevel, GarageState } from 'enums';
import { requireLoggedIn } from 'auth';
import { prefetchDeviceName, prefetchGarageDoorState } from 'hooks/prefetch';

function Home() {
  const { data: garageDoorState } = useGarageState();
  const doorState = garageDoorState as GarageState;
  const { data: userLevel } = useUserLevel();
  const { mutate: pressButton, isLoading: isWaitingAcknowledgement } = usePress();
  const { data: deviceName } = useDeviceName();

  function getPermissionsText(canView: boolean) {
    if (canView)
      return "You do not have permission to move the garage door, you may only see it's state. If this an error, please contact your system administrator.";
    return "You do not have permission to view the garage door's status. If this an error, please contact your system administrator.";
  }

  function getGarageText(doorState: GarageState) {
    return ['Garage Door: Open', 'Garage Door: Closed', 'Garage Door: Unknown', 'Connecting to server...'][doorState];
  }
  function getGarageBoxColor(doorState: GarageState) {
    return ['green.300', 'red.300', 'purple.300', 'orange.300'][doorState];
  }

  const iconStyles = { size: '48px' };
  function getGarageBoxIcon(doorState: GarageState) {
    return [
      <FiUnlock {...iconStyles} key={1} />,
      <FiLock {...iconStyles} key={2} />,
      <FiAlertCircle {...iconStyles} key={3} />,
      <FiLoader {...iconStyles} key={4} />,
    ][doorState];
  }

  const canMove = userLevel !== undefined && userLevel >= UserLevel.USER;
  const canView = userLevel !== undefined && userLevel >= UserLevel.VIEWER;

  return (
    <CenterBox title={deviceName ?? 'Garage Door'}>
      {(!canMove || !canView) && (
        <Flex
          borderRadius="8px"
          bg="orange.300"
          mb="16px"
          width={{ base: '100%', md: '75%' }}
          padding="16px"
          direction="column"
          align="center">
          {<FiAlertTriangle {...iconStyles} />}
          <Text textAlign="center">{getPermissionsText(canView)}</Text>
        </Flex>
      )}
      {canView && (
        <Flex
          borderRadius="8px"
          bg={getGarageBoxColor(doorState)}
          mb="16px"
          width={{ base: '100%', md: '75%' }}
          padding="16px"
          direction="column"
          align="center">
          {getGarageBoxIcon(doorState)}
          <Text textAlign="center">{getGarageText(doorState)}</Text>
        </Flex>
      )}
      <Button
        onClick={() => pressButton()}
        colorScheme={canMove ? 'purple' : 'red'}
        borderRadius="48px"
        width="50%"
        height="64px"
        isLoading={isWaitingAcknowledgement}
        isDisabled={!canMove || doorState === GarageState.FETCHING}>
        Activate
      </Button>
    </CenterBox>
  );
}

Home.getLayout = useMainLayout;

export const getServerSideProps = requireLoggedIn(async () => {
  const queryClient = new QueryClient();
  prefetchGarageDoorState(queryClient);
  prefetchDeviceName(queryClient);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

export default Home;
