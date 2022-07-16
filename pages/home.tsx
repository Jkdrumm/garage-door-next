import type { Message, PageWithLayout } from '../utils/types';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useMainLayout } from '../components/layouts';
import { AdminLevel, GarageAction, GarageEvent, GarageState } from '../utils/enums';
import { CenterBox } from '../components';
import { requireLoggedIn } from '../utils/auth';
import { WebSocketContext } from '../components/contexts';
import { FiAlertCircle, FiAlertTriangle, FiLoader, FiLock, FiUnlock } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import io from 'socket.io-client';

const Home: PageWithLayout = () => {
  const [doorState, setDoorState] = useState<GarageState>(GarageState.FETCHING);
  const [adminLevel, setAdminLevel] = useState<AdminLevel>(AdminLevel.ACCOUNT);
  const [buttonLoading, setButtonLoading] = useState<boolean>(true);
  const { webSocket, setWebSocket } = useContext(WebSocketContext);

  const queryClient = useQueryClient();
  const router = useRouter();

  const stopWebSocket = useCallback(() => {
    webSocket?.removeAllListeners();
    webSocket?.disconnect();
  }, [webSocket]);

  useEffect(() => {
    return stopWebSocket;
  }, [stopWebSocket]);

  useQuery('socket', () => axios.post('/api/socket'), {
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: () => socketInitializer()
  });

  const timeoutWebsocket = async () => {
    stopWebSocket();
    await signOut({ redirect: false });
    router.push('/');
  };

  const socketInitializer = async () => {
    await axios.post('/api/socket');
    const socket = io();

    socket.on('message', (payload: Message[]) => {
      payload.forEach(item => {
        const { event, message } = item;
        switch (event) {
          case GarageEvent.STATE:
            switch (message) {
              case GarageState.OPEN:
              case GarageState.CLOSED:
              case GarageState.UNKNOWN:
                setDoorState(message);
                break;
              default:
                console.warn(`Unknown state: ${message}`);
            }
            break;
          case GarageEvent.ACKNOWLEDGEMNET:
            setButtonLoading(false);
            break;
          case GarageEvent.ADMIN:
            setAdminLevel(message);
            queryClient.setQueryData('adminLevel', () => message);
            queryClient.invalidateQueries('notifications');
            break;
          case GarageEvent.SESSION_TIMEOUT:
            timeoutWebsocket();
            break;
          default:
            console.warn(`Unknown data: ${event}: ${message}`);
        }
      });
    });

    socket.on('error', (error: any) => console.error(error));

    socket.on('disconnect', () => {
      setDoorState(GarageState.FETCHING);
      setTimeout(socketInitializer, 10000);
    });

    setWebSocket?.(socket);
  };

  const pressButton = () => {
    setButtonLoading(true);
    webSocket?.emit('message', GarageAction.PRESS);
  };

  const getPermissionsText = (canView: boolean) => {
    if (canView)
      return "You do not have permission to move the garage door, you may only see it's state. If this an error, please contact your system administrator.";
    return "You do not have permission to view the garage door's status. If this an error, please contact your system administrator.";
  };

  const getGarageText = (doorState: GarageState) =>
    ['Garage Door: Open', 'Garage Door: Closed', 'Garage Door: Unknown', 'Connecting to server...'][doorState];
  const getGarageBoxColor = (doorState: GarageState) => ['green.300', 'red.300', 'purple.300', 'orange.300'][doorState];

  const iconStyles = { size: '48px' };
  const getGarageBoxIcon = (doorState: GarageState) =>
    [
      <FiUnlock {...iconStyles} key={1} />,
      <FiLock {...iconStyles} key={2} />,
      <FiAlertCircle {...iconStyles} key={3} />,
      <FiLoader {...iconStyles} key={4} />
    ][doorState];

  const canMove = buttonLoading || adminLevel >= AdminLevel.USER;
  const canView = buttonLoading || adminLevel >= AdminLevel.VIEWER;

  return (
    <CenterBox title="Garage Door">
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
        isLoading={buttonLoading}
        disabled={!canMove}>
        Activate
      </Button>
    </CenterBox>
  );
};

Home.getLayout = useMainLayout;

export const getServerSideProps = requireLoggedIn();

export default Home;
