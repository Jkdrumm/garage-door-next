import { useRef, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Heading,
  IconButton,
  ScaleFade,
  Skeleton,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Thead,
  Th,
  ToastId,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import type { User } from 'types';
import TextTransition, { presets } from 'react-text-transition';
import { FiInfo } from 'react-icons/fi';
import { useMainLayout } from 'components';
import { useDeleteUser, useIsMobile, useUpdateUser, useUser, useUsers } from 'hooks';
import { prefetchUsers } from 'hooks/prefetch';
import { requireAdmin } from 'auth';
import { UserLevel } from 'enums';
import { getUserLevelText } from 'text';
import { QueryClient, dehydrate } from '@tanstack/react-query';

interface UserLevelButtonDetails {
  label: string;
  userLevel: UserLevel;
  colorScheme: string;
  description: string;
}

function UserSettings() {
  const { data: user } = useUser();
  const { data: users } = useUsers();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  const isMobile = useIsMobile();

  const [selectedUser, setSelectedUser] = useState<User>();
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>(UserLevel.ACCOUNT);
  const [oldLevel, setOldLevel] = useState<UserLevel>(UserLevel.ACCOUNT);
  const [deleteChecked, setDeleteChecked] = useState<boolean>(false);
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState<boolean>(false);
  const [buttonHovering, setButtonHovering] = useState<UserLevel | undefined>();

  const toastIdRef = useRef<ToastId>();
  const timerIdRef = useRef<NodeJS.Timeout>();

  const updateUserSuccess = () => {
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

  const { mutate: updateUser } = useUpdateUser({
    onSuccess: updateUserSuccess,
    onError: updateUserError
  });

  const deleteUserSuccess = () => {
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

  const { mutate: deleteUser } = useDeleteUser({
    onSuccess: deleteUserSuccess,
    onError: deleteUserError
  });

  const handleOpen = (user: User) => {
    setOldLevel(user.userLevel);
    setSelectedLevel(user.userLevel);
    setSelectedUser(user);
    setDeleteChecked(false);
    setDeleteConfirmationChecked(false);
    onOpen();
  };

  const getAdminInfo = (button: UserLevelButtonDetails) => {
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
    const args = { id: `${selectedUser?.id}`, userLevel: selectedLevel };
    if (deleteConfirmationChecked) deleteUser(args);
    else updateUser(args);
  };

  return (
    <>
      <Flex alignItems="center" flexDir="column" width="100%">
        <Heading mb="32px" mt={{ base: '24px', md: '40px' }}>
          User Settings
        </Heading>

        <TableContainer width={{ base: '100%', sm: '768px' }}>
          <Table variant="simple">
            <TableCaption>Select a user to edit their account level</TableCaption>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Admin Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users
                ? users.map(tableUser => (
                    <Tr key={tableUser.id}>
                      <Td>
                        {(() => {
                          const sameUser = user !== null && user !== undefined && tableUser.id === user.id;
                          const button = (
                            <Button
                              colorScheme={['blue', 'green', 'yellow', 'red'][tableUser.userLevel]}
                              onClick={sameUser ? undefined : () => handleOpen(tableUser)}
                              disabled={sameUser}>
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
                          direction={selectedLevel > oldLevel ? 'down' : 'up'}>
                          {getUserLevelText(tableUser.userLevel)}
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
      </Flex>

      <Drawer isOpen={isOpen} onClose={onClose} placement={isMobile ? 'bottom' : 'right'}>
        <DrawerOverlay />
        <DrawerContent bgColor={useColorModeValue('gray.200', 'gray.900')}>
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
                  userLevel: UserLevel.ADMIN,
                  colorScheme: 'red',
                  description:
                    'Allows for full unrestricted control over the garage door and all settings. Intended only for trusted household members.'
                },
                {
                  label: 'User',
                  userLevel: UserLevel.USER,
                  colorScheme: 'yellow',
                  description: 'Allows for moving the garage door and viewing if the garage is open/closed.'
                },
                {
                  label: 'Viewer',
                  userLevel: UserLevel.VIEWER,
                  colorScheme: 'green',
                  description: 'Allows only for viewing if the garage is open/closed.'
                },
                {
                  label: 'Account',
                  userLevel: UserLevel.ACCOUNT,
                  colorScheme: 'blue',
                  description:
                    'Does not allow viewing or moving of the garage door. New users are automatically placed here.'
                }
              ].map((button: UserLevelButtonDetails) => (
                <Flex align="center" key={button.label}>
                  {getAdminInfo(button)}
                  <Button
                    flex="1"
                    m="4px 4px 4px 12px"
                    onMouseEnter={() => setButtonHovering(button.userLevel)}
                    onMouseLeave={() => setButtonHovering(undefined)}
                    colorScheme={
                      selectedLevel === button.userLevel || buttonHovering === button.userLevel
                        ? button.colorScheme
                        : undefined
                    }
                    onClick={() => setSelectedLevel(button.userLevel)}>
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
                  isDisabled={selectedLevel === oldLevel && !deleteConfirmationChecked}
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
}

export const getServerSideProps = requireAdmin(async () => {
  const queryClient = new QueryClient();
  prefetchUsers(queryClient);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});
UserSettings.getLayout = useMainLayout;

export default UserSettings;
