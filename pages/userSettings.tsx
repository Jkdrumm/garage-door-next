import {
  TableContainer,
  Table,
  TableCaption,
  Text,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Skeleton,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Tooltip,
  Flex,
  Alert,
  AlertIcon,
  ScaleFade,
  useToast,
  ToastId,
  IconButton,
  Switch,
  FormLabel
} from '@chakra-ui/react';
import type { User } from '../utils/types';
import TextTransition, { presets } from 'react-text-transition';
import { useRef, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { dehydrate, QueryClient, useMutation, useQueryClient } from 'react-query';
import { CenterBox } from '../components';
import { useMainLayout } from '../components/layouts';
import { requireAdmin } from '../utils/auth';
import { AdminLevel } from '../utils/enums';
import { useIsMobile, useUser, useUsers } from '../utils/hooks';
import { prefetchUsers } from '../utils/hooks/prefetch';
import { getAdminLevelText } from '../utils/text';
import axios from 'axios';

interface AdminButtonDetails {
  label: string;
  adminLevel: AdminLevel;
  colorScheme: string;
  description: string;
}

const UserSettings = () => {
  const { data: user } = useUser();
  const { data: users } = useUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User>();
  const [selectedLevel, setSelectedLevel] = useState<AdminLevel | undefined>(AdminLevel.ACCOUNT);
  const [oldLevel, setOldLevel] = useState<AdminLevel | undefined>(AdminLevel.ACCOUNT);
  const [deleteChecked, setDeleteChecked] = useState<boolean>(false);
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState<boolean>(false);
  const [buttonHovering, setButtonHovering] = useState<AdminLevel | undefined>();

  const toastIdRef = useRef<ToastId>();
  const timerIdRef = useRef<NodeJS.Timeout>();

  const updateUserSuccess = () => {
    queryClient.setQueryData('users', (queryData: any) => {
      const updatedUser = queryData.find((user: User) => user.id === selectedUser?.id);
      if (updatedUser) updatedUser.adminLevel = selectedLevel;
      return queryData;
    });
    if (selectedLevel === AdminLevel.ACCOUNT)
      queryClient.setQueryData('notifications', (queryData: any) => queryData + 1);
    else if (oldLevel === AdminLevel.ACCOUNT)
      queryClient.setQueryData('notifications', (queryData: any) => queryData - 1);
    onClose();
    toast({
      title: 'User updated',
      status: 'success',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const updateUserError = () => {
    toast({
      title: 'Error updating user',
      status: 'error',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const { mutate: updateUser } = useMutation(
    (user: { id: string; adminLevel: AdminLevel }) => axios.post('/api/updateUser', user),
    {
      onSuccess: updateUserSuccess,
      onError: updateUserError
    }
  );

  const deleteUserSuccess = () => {
    queryClient.setQueryData('users', (queryData: any) => {
      const filteredData = queryData.filter((user: User) => user.id !== selectedUser?.id);
      return filteredData;
    });
    if (oldLevel === AdminLevel.ACCOUNT) queryClient.setQueryData('notifications', (queryData: any) => queryData - 1);
    onClose();
    toast({
      title: 'User deleted',
      status: 'success',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const deleteUserError = () => {
    toast({
      title: 'Error deleting user',
      status: 'error',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const { mutate: deleteUser } = useMutation((user: { id: string }) => axios.post('/api/deleteUser', user), {
    onSuccess: deleteUserSuccess,
    onError: deleteUserError
  });

  const handleOpen = (user: User) => {
    setOldLevel(user.adminLevel);
    setSelectedLevel(user.adminLevel);
    setSelectedUser(user);
    setDeleteChecked(false);
    setDeleteConfirmationChecked(false);
    onOpen();
  };

  const getAdminInfo = (button: AdminButtonDetails) => {
    const iconStyles = { size: '24px' };
    if (!isMobile)
      return (
        <Tooltip hasArrow label={button.description}>
          <span>
            <FiInfo {...iconStyles} />
          </span>
        </Tooltip>
      );
    return (
      <IconButton
        aria-label={`${button.label} Information`}
        icon={<FiInfo {...iconStyles} />}
        onClick={() => {
          const toastSettings = {
            title: button.label,
            description: button.description,
            isClosable: true,
            duration: null,
            onCloseComplete: () => (toastIdRef.current = undefined)
          };
          if (toastIdRef.current) {
            clearTimeout(timerIdRef.current);
            toast.update(toastIdRef.current, toastSettings);
          } else toastIdRef.current = toast(toastSettings);
          timerIdRef.current = setTimeout(() => {
            if (toastIdRef.current) toast.close(toastIdRef.current);
            timerIdRef.current = undefined;
          }, 7500);
        }}
      />
    );
  };

  const saveButtonClick = () => {
    if (deleteConfirmationChecked) deleteUser({ id: `${selectedUser?.id}` });
    else updateUser({ id: `${selectedUser?.id}`, adminLevel: selectedLevel ?? AdminLevel.ACCOUNT });
  };

  return (
    <>
      <CenterBox title="User Settings">
        <TableContainer width={{ base: '100%', sm: 'auto' }}>
          <Table variant="simple">
            <TableCaption>Select a user to edit their account level</TableCaption>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Admin Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users && true
                ? users.map(tableUser => (
                    <Tr key={tableUser.id}>
                      <Td>
                        {(() => {
                          const sameUser = user !== null && user !== undefined && tableUser.id === user.id;
                          const button = (
                            <Button
                              onClick={sameUser ? undefined : () => handleOpen(tableUser)}
                              disabled={sameUser}
                              width="100%">
                              {`${tableUser.firstName} ${tableUser.lastName}`}
                            </Button>
                          );
                          if (sameUser)
                            return (
                              <Tooltip
                                hasArrow
                                label="Go to the profile page to edit your own account!"
                                shouldWrapChildren
                                mt="3">
                                {button}
                              </Tooltip>
                            );
                          return button;
                        })()}
                      </Td>
                      <Td>
                        <TextTransition
                          springConfig={presets.stiff}
                          direction={selectedLevel && oldLevel && selectedLevel > oldLevel ? 'down' : 'up'}>
                          {getAdminLevelText(tableUser.adminLevel)}
                        </TextTransition>
                      </Td>
                    </Tr>
                  ))
                : [1, 2, 3].map(key => (
                    <Tr key={key}>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="20px" />
                      </Td>
                    </Tr>
                  ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CenterBox>

      <Drawer isOpen={isOpen} onClose={onClose} placement={isMobile ? 'bottom' : 'right'}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit Account</DrawerHeader>

          <DrawerBody>
            Select an account level for{' '}
            <Text fontWeight="semibold" display="inline">
              {`${selectedUser?.username} (${selectedUser?.firstName} ${selectedUser?.lastName})`}
            </Text>
            :
            <Flex direction="column" m="8px 0px">
              {[
                {
                  label: 'Admin',
                  adminLevel: AdminLevel.ADMIN,
                  colorScheme: 'red',
                  description:
                    'Allows for full unrestricted control over the garage door and all settings. Intended only for trusted household members.'
                },
                {
                  label: 'User',
                  adminLevel: AdminLevel.USER,
                  colorScheme: 'yellow',
                  description: 'Allows for moving the garage door and viewing if the garage is open/closed.'
                },
                {
                  label: 'Viewer',
                  adminLevel: AdminLevel.VIEWER,
                  colorScheme: 'green',
                  description: 'Allows only for viewing if the garage is open/closed.'
                },
                {
                  label: 'Account',
                  adminLevel: AdminLevel.ACCOUNT,
                  colorScheme: 'blue',
                  description:
                    'Does not allow viewing or moving of the garage door. New users are automatically placed here.'
                }
              ].map((button: AdminButtonDetails, index) => (
                <Flex align="center" key={index}>
                  {getAdminInfo(button)}
                  <Button
                    flex="1"
                    m="4px 4px 4px 12px"
                    onMouseEnter={() => setButtonHovering(button.adminLevel)}
                    onMouseLeave={() => setButtonHovering(undefined)}
                    colorScheme={
                      selectedLevel === button.adminLevel || buttonHovering === button.adminLevel
                        ? button.colorScheme
                        : undefined
                    }
                    onClick={() => setSelectedLevel(button.adminLevel)}>
                    {button.label}
                  </Button>
                </Flex>
              ))}
              <Flex align="center" justify="space-between" mt="8px">
                <FormLabel htmlFor="delete-user">Delete User?</FormLabel>
                <Switch
                  id="delete-user"
                  isChecked={deleteChecked}
                  onChange={() => {
                    setDeleteConfirmationChecked(false);
                    setDeleteChecked(!deleteChecked);
                  }}
                />
              </Flex>
              <ScaleFade in={deleteChecked}>
                <Flex align="center" justify="space-between" mt="8px">
                  <FormLabel htmlFor="delete-user-check">Are you sure?</FormLabel>
                  <Switch
                    id="delete-user-check"
                    isChecked={deleteConfirmationChecked}
                    onChange={() => setDeleteConfirmationChecked(!deleteConfirmationChecked)}
                  />
                </Flex>
              </ScaleFade>
            </Flex>
            <ScaleFade in={selectedLevel !== oldLevel || deleteConfirmationChecked}>
              <Alert status="warning" borderRadius="0.375rem">
                <AlertIcon />
                You have unsaved changes!
              </Alert>
            </ScaleFade>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Tooltip label="No changes to save" isDisabled={deleteConfirmationChecked || selectedLevel !== oldLevel}>
              <span>
                <Button
                  colorScheme={deleteConfirmationChecked ? 'red' : 'blue'}
                  disabled={selectedLevel === oldLevel && !deleteConfirmationChecked}
                  onClick={() => saveButtonClick()}>
                  {deleteConfirmationChecked ? 'Delete' : 'Save'}
                </Button>
              </span>
            </Tooltip>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const getServerSideProps = requireAdmin(async () => {
  const queryClient = new QueryClient();
  await prefetchUsers(queryClient);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

UserSettings.getLayout = useMainLayout;

export default UserSettings;
