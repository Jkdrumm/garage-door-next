import React, { ReactNode, useContext } from 'react';
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorMode,
  Button,
  Circle
} from '@chakra-ui/react';
import {
  FiHome,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiUser,
  FiUsers,
  FiLogOut,
  FiFileText
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAdminLevel, useNotificationCount, useUser } from '../../utils/hooks';
import { WebSocketContext, WebSocketProvider } from '../contexts';
import { AdminLevel } from '../../utils/enums';
import { getAdminLevelText } from '../../utils/text';

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
  requiredLevel?: AdminLevel;
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Garage', icon: FiHome, href: '/home' },
  { name: 'Profile', icon: FiUser, href: '/profile' },
  { name: 'Settings', icon: FiSettings, requiredLevel: AdminLevel.ADMIN, href: '/settings' },
  { name: 'User Settings', icon: FiUsers, requiredLevel: AdminLevel.ADMIN, href: '/userSettings' },
  { name: 'Logs', icon: FiFileText, requiredLevel: AdminLevel.ADMIN, href: '/logs' }
];

const title = 'Garage Door 3.0';

export function MainLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex minH="100vh" width="100vw" bg={useColorModeValue('gray.100', 'gray.900')} align="stretch">
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <Flex width="inherit" direction="column">
        <WebSocketProvider>
          <MobileNav onOpen={onOpen} />
          <Box ml={{ base: 0, md: 60 }} p="4" flex="1">
            {children}
          </Box>
        </WebSocketProvider>
      </Flex>
    </Flex>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { data: adminLevel } = useAdminLevel();
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.filter(link => !link.requiredLevel || (adminLevel && adminLevel >= link.requiredLevel)).map(link => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  href: string;
  children: ReactNode;
}
const NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  const router = useRouter();
  return (
    <Link href={router.route === href ? '#' : href} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'purple.400',
          color: 'white'
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white'
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { data: user } = useUser();
  const { data: adminLevel } = useAdminLevel();
  const router = useRouter();
  const { toggleColorMode } = useColorMode();
  const themeIcon = useColorModeValue(<MoonIcon w="1.25em" h="1.25em" />, <SunIcon w="1.25em" h="1.25em" />);
  const { webSocket } = useContext(WebSocketContext);
  const { data: numNotifications, isLoading: loadingNotifications } = useNotificationCount();
  const hasNotification = numNotifications !== undefined && numNotifications > 0;
  const getNotificationCircleBorderColor = useColorModeValue('white', 'gray.900');
  const fullName = `${user?.firstName} ${user?.lastName}`;

  const getNotificationList = () => {
    if (loadingNotifications) return <MenuItem>Loading...</MenuItem>;
    if (hasNotification)
      if (adminLevel && adminLevel >= AdminLevel.ADMIN)
        return (
          <MenuItem
            as={Link}
            href={router.route === '/userSettings' ? '#' : '/userSettings'}
            _hover={{ textDecoration: 'none' }}>
            There {numNotifications > 1 ? `are ${numNotifications} users` : 'is 1 user'} waiting on account approval.
            Click here to go to the settings page to upgrade or delete their accounts.
          </MenuItem>
        );
      else return <MenuItem>To gain access to the garage door, please contact your system administrator.</MenuItem>;
    return <MenuItem>You have no notifications</MenuItem>;
  };

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Text display={{ base: 'flex', md: 'none' }} fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      <HStack spacing={{ base: '2', md: '4' }} mr="16px">
        <Button onClick={toggleColorMode} display={{ base: 'none', md: 'block' }}>
          {themeIcon}
        </Button>
        <Menu>
          <MenuButton
            as={IconButton}
            size="lg"
            variant="ghost"
            aria-label="open menu"
            icon={
              <>
                {hasNotification && (
                  <Circle
                    bg="red"
                    size="8px"
                    position="absolute"
                    left="50%"
                    top="33%"
                    borderWidth="1px"
                    borderColor={getNotificationCircleBorderColor}
                  />
                )}
                <FiBell />
              </>
            }
          />
          <MenuList maxWidth="100px">
            <Text fontWeight="semibold" m="8px">
              Notifications
            </Text>
            <MenuDivider />
            {getNotificationList()}
          </MenuList>
        </Menu>
        <Flex alignItems="center">
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar size={'sm'} name={fullName} />
                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                  <Text fontSize="sm">{fullName}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {getAdminLevelText(adminLevel)}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}>
              <MenuItem as={Link} icon={<FiUser size="1.25em" />} href="/profile" _hover={{ textDecoration: 'none' }}>
                Profile
              </MenuItem>
              {(adminLevel ?? -1) >= AdminLevel.ADMIN && (
                <>
                  <MenuItem
                    as={Link}
                    icon={<FiSettings size="1.25em" />}
                    href="/settings"
                    _hover={{ textDecoration: 'none' }}>
                    Settings
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    icon={<FiUsers size="1.25em" />}
                    href="/userSettings"
                    _hover={{ textDecoration: 'none' }}>
                    User Settings
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    icon={<FiFileText size="1.25em" />}
                    href="/logs"
                    _hover={{ textDecoration: 'none' }}>
                    Logs
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={toggleColorMode} display={{ base: 'block', md: 'none' }} icon={themeIcon}>
                {useColorModeValue('Dark Mode', 'Light Mode')}
              </MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<FiLogOut size="1.25em" />}
                onClick={() => {
                  webSocket.current?.disconnect();
                  signOut({ redirect: false })
                    .then(() => router.push('/'))
                    .catch(console.error);
                }}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

export const useMainLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;
