import { useState } from 'react';
import {
  Button,
  Circle,
  Code,
  Container,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Field, Form, Formik } from 'formik';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { Link, useMainLayout } from 'components';
import { requireAdmin } from 'auth';
import {
  useDnsInfo,
  useVersion,
  useIsMobile,
  useCheckForNewVersion,
  useConfigureDns,
  useConfigureCertificates,
  useInstallUpdate,
} from 'hooks';
import { prefetchDnsInfo, prefetchVersion } from 'hooks/prefetch';
import { validateDomain, validateApiSecret, validateApiKey } from 'validations';
import pack from '../package.json';

function Settings() {
  const { isOpen: isOpenDNS, onOpen: onOpenDNS, onClose: onCloseDNS } = useDisclosure();
  const isMobile = useIsMobile();
  const toast = useToast();
  const [dnsSignInError, setDnsSignInError] = useState<string>('');
  const { data: dnsInfo, isLoading: dnsInfoIsLoading } = useDnsInfo();
  const { data: versionInfo, isLoading: versionInfoIsLoading } = useVersion();

  const { mutate: checkForNewVersion, isLoading: isCheckingForNewVersion } = useCheckForNewVersion();

  const { mutate: downloadUpdate, isLoading: isDownloadingUpdate } = useInstallUpdate();

  const { mutateAsync: configureDNS } = useConfigureDns({
    onSuccess: () => {
      toast({
        title: 'DNS Configuration Updated',
        status: 'success',
        position: 'bottom-left',
        isClosable: true,
      });
      closeDnsDrawer();
    },
    onError: ({ error }) => setDnsSignInError(error),
  });

  const { mutate: configureCertificates, isLoading: isLoadingCertificates } = useConfigureCertificates({
    onSuccess: () =>
      toast({
        title: 'Certificates Configured',
        status: 'success',
        position: 'bottom-left',
        isClosable: true,
      }),
    onError: () =>
      toast({
        title: 'Error updating certificates',
        status: 'error',
        position: 'bottom-left',
        isClosable: true,
      }),
  });

  function closeDnsDrawer() {
    onCloseDNS();
    setDnsSignInError('');
  }

  const closeIconSeethroughColor = useColorModeValue('white', 'gray.700');

  return (
    <>
      <Container maxW="4xl">
        <Heading mb="32px" mt={{ base: '24px', md: '40px' }}>
          Settings
        </Heading>
        <Flex
          borderRadius="20px"
          bg={useColorModeValue('white', 'gray.700')}
          width="100%"
          shadow={`0px 0px 32px 0px ${useColorModeValue('#4E4E4E2E', '#000000AA')}`}
          justify="center"
          align="center"
          direction="column"
          padding="16px 0px"
          mb="16px">
          <Stack direction={{ base: 'column', md: 'row' }} textAlign="center" width="100%">
            <Flex width="100%" flexDir="column" alignItems="center">
              <Text>Current Version: {pack.version}</Text>
              <Flex>
                <Text mr="1">Newest Version:</Text>
                <Skeleton isLoaded={!versionInfoIsLoading}>{versionInfo?.version ?? pack.version}</Skeleton>
              </Flex>
              <Button
                colorScheme="cyan"
                onClick={() => downloadUpdate()}
                isLoading={isDownloadingUpdate || versionInfo?.isCurrentlyUpdating}
                isDisabled={
                  versionInfoIsLoading || versionInfo?.version === undefined || versionInfo?.version <= pack.version
                }>
                Download Update
              </Button>
            </Flex>
            <Flex justify="space-between" width="100%" flexDir="column" height="inherit" alignItems="center">
              <Text mr="1">Last checked:</Text>
              <Skeleton isLoaded={!versionInfoIsLoading}>
                {versionInfo?.timeOfLastCheck
                  ? new Date(versionInfo.timeOfLastCheck).toLocaleString()
                  : '0/0/0000, 00:00:00 AM'}
              </Skeleton>
              <Button
                colorScheme="cyan"
                onClick={() => checkForNewVersion()}
                isLoading={isCheckingForNewVersion}
                isDisabled={isDownloadingUpdate || versionInfo?.isCurrentlyUpdating}>
                Check for New Version
              </Button>
            </Flex>
          </Stack>
        </Flex>
        <Stack direction={{ base: 'column', md: 'row' }} gap="16px">
          <Flex
            borderRadius="20px"
            bg={useColorModeValue('white', 'gray.700')}
            width="100%"
            shadow={`0px 0px 32px 0px ${useColorModeValue('#4E4E4E2E', '#000000AA')}`}
            justify="center"
            align="center"
            direction="column"
            padding="16px 0px">
            {dnsInfo?.isLoggedIn ? (
              <CheckCircleIcon boxSize="24px" color="green.300" />
            ) : (
              <Circle bg="red.300" size="24px">
                <SmallCloseIcon boxSize="24px" color={closeIconSeethroughColor} />
              </Circle>
            )}
            <Divider m="16px 0px" />
            <Flex direction={{ base: 'column', md: 'row' }} justify="flex-start" width="100%" padding="0px 16px">
              <Flex width="100%" height="100%" direction="column" mb="16px">
                <Heading as="h4" size="md">
                  DNS: {dnsInfo?.hostname ? <Code fontSize="xl">{dnsInfo?.hostname}</Code> : 'Not Configured'}
                </Heading>
              </Flex>
              <Button
                colorScheme="cyan"
                onClick={onOpenDNS}
                isDisabled={dnsInfoIsLoading}
                isLoading={dnsInfo?.isLoggingIn}>
                Configure
              </Button>
            </Flex>
          </Flex>
          <Flex
            borderRadius="20px"
            bg={useColorModeValue('white', 'gray.700')}
            width="100%"
            shadow={`0px 0px 32px 0px ${useColorModeValue('#4E4E4E2E', '#000000AA')}`}
            justify="center"
            align="center"
            direction="column"
            padding="16px 0px">
            {dnsInfo?.isRunningHttps ? (
              <CheckCircleIcon boxSize="24px" color="green.300" />
            ) : (
              <Circle bg="red.300" size="24px">
                <SmallCloseIcon boxSize="24px" color={closeIconSeethroughColor} />
              </Circle>
            )}
            <Divider m="16px 0px" />
            <Flex direction={{ base: 'column', md: 'row' }} justify="flex-start" width="100%" padding="0px 16px">
              <Flex width="100%" height="100%" direction="column" mb="16px">
                <Heading as="h4" size="md">
                  Certificates: {dnsInfo?.isRunningHttps ? 'Installed' : 'Not Configured'}
                </Heading>
              </Flex>
              <Button
                colorScheme="cyan"
                onClick={() => {
                  configureCertificates();
                }}
                isLoading={dnsInfo?.isGettingCertificates || isLoadingCertificates}
                isDisabled={dnsInfoIsLoading || !dnsInfo?.isLoggedIn}>
                Configure
              </Button>
            </Flex>
          </Flex>
        </Stack>
      </Container>
      <Drawer isOpen={isOpenDNS} onClose={closeDnsDrawer} placement={isMobile ? 'bottom' : 'right'}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Configure DNS</DrawerHeader>

          <Formik
            initialValues={{ key: '', secret: '', hostname: dnsInfo?.hostname ?? '' }}
            onSubmit={configureDNS}
            validateOnMount={false}>
            {props => (
              <Form>
                <DrawerBody>
                  <Text mb="16px">
                    To configure your{' '}
                    <Link href="https://developer.godaddy.com/keys" isExternal color="blue.400">
                      GoDaddy
                    </Link>{' '}
                    DNS, create an API key and enter the key and secret here. Choose &quot;production&quot; when asked
                    for an environment.
                  </Text>
                  <Field name="key" validate={validateApiKey}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl isInvalid={form.errors.key && form.touched.key}>
                        <FormLabel htmlFor="key">API Key</FormLabel>
                        <Input {...field} id="key" />
                        <FormErrorMessage>{form.errors.key}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="secret" validate={validateApiSecret}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl isInvalid={form.errors.secret && form.touched.secret}>
                        <FormLabel htmlFor="secret">API Secret</FormLabel>
                        <Input {...field} id="secret" type="password" />
                        <FormErrorMessage>{form.errors.secret}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="hostname" validate={validateDomain}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl isInvalid={form.errors.hostname && form.touched.hostname}>
                        <FormLabel htmlFor="hostname">Hostname</FormLabel>
                        <Input {...field} id="hostname" />
                        <FormErrorMessage>{form.errors.hostname}</FormErrorMessage>
                        <FormHelperText>
                          Once configured, the hostname is the web address you will access this website from.
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Field>
                  {dnsSignInError && (
                    <Text textColor="red.300" mt="4px">
                      {dnsSignInError}
                    </Text>
                  )}
                </DrawerBody>
                <DrawerFooter>
                  <Button variant="outline" mr={3} onClick={onCloseDNS}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" type="submit" isDisabled={!props.isValid} isLoading={props.isSubmitting}>
                    Save
                  </Button>
                </DrawerFooter>
              </Form>
            )}
          </Formik>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export const getServerSideProps = requireAdmin(async () => {
  const queryClient = new QueryClient();
  prefetchDnsInfo(queryClient);
  await prefetchVersion(queryClient);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

Settings.getLayout = useMainLayout;

export default Settings;
