import { CheckCircleIcon, SmallCloseIcon } from '@chakra-ui/icons';
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
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { QueryClient, dehydrate, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '../components';
import { useMainLayout } from '../components/layouts';
import { requireAdmin } from '../utils/auth';
import { useDnsInfo, useIsMobile } from '../utils/hooks';
import { prefetchDnsInfo } from '../utils/hooks/prefetch';
import { DnsService } from '../utils/services';
import { validateDomain, validateApiSecret, validateApiKey } from '../utils/validations';

function Settings() {
  const { isOpen: isOpenDNS, onOpen: onOpenDNS, onClose: onCloseDNS } = useDisclosure();
  const isMobile = useIsMobile();
  const toast = useToast();
  const [dnsSignInError, setDnsSignInError] = useState<string>('');
  const [loadingCertificates, setLoadingCertificates] = useState<boolean>(false);
  const { data: dnsInfo } = useDnsInfo();
  const queryClient = useQueryClient();

  const configureDnsSuccess = (
    _data: any,
    {
      doneSubmitting
    }: {
      key: string;
      secret: string;
      hostname: string;
      resetApiInputs: () => void;
      doneSubmitting: () => void;
    }
  ) => {
    queryClient.setQueryData(['dnsInfo'], (queryData: any) => ({ ...queryData, isLoggedIn: true }));
    doneSubmitting();
    toast({
      title: 'DNS Configuration Updated',
      status: 'success',
      position: 'bottom-left',
      isClosable: true
    });
    closeDnsDrawer();
  };

  const configureDnsError = (
    data: any,
    {
      doneSubmitting
    }: {
      key: string;
      secret: string;
      hostname: string;
      resetApiInputs: () => void;
      doneSubmitting: () => void;
    }
  ) => {
    setDnsSignInError(data.response.data);
    doneSubmitting();
  };

  const { mutate: configureDNS } = useMutation(
    (params: {
      key: string;
      secret: string;
      hostname: string;
      resetApiInputs: () => void;
      doneSubmitting: () => void;
    }) =>
      axios.post('/api/configureDNS', {
        key: params.key,
        secret: params.secret,
        hostname: params.hostname
      }),
    {
      onSuccess: configureDnsSuccess,
      onError: configureDnsError
    }
  );

  const configureCertificatesSuccess = () => {
    setLoadingCertificates(false);
    queryClient.setQueryData(['dnsInfo'], (queryData: any) => ({ ...queryData, isRunningHttps: true }));
    toast({
      title: 'Certificates Configured',
      status: 'success',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const configureCertificatesError = () => {
    setLoadingCertificates(false);
    toast({
      title: 'Error updating certificates',
      status: 'error',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const { mutate: configureCertificates } = useMutation(() => axios.post('/api/getCertificates'), {
    onSuccess: configureCertificatesSuccess,
    onError: configureCertificatesError
  });

  const closeDnsDrawer = () => {
    onCloseDNS();
    setDnsSignInError('');
  };

  const closeIconSeethroughColor = useColorModeValue('white', 'gray.700');

  return (
    <>
      <Container maxW="4xl">
        <Heading mb="32px" mt={{ base: '24px', md: '40px' }}>
          Settings
        </Heading>
        <Stack direction={{ base: 'column', md: 'row' }}>
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
              <Button colorScheme="cyan" onClick={onOpenDNS}>
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
                  setLoadingCertificates(true);
                  configureCertificates();
                }}
                isLoading={loadingCertificates}
                isDisabled={dnsInfo === undefined || !dnsInfo.isLoggedIn}>
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
            initialValues={{ key: '', dnsPassword: '', hostname: dnsInfo?.hostname }}
            onSubmit={(params, { setFieldValue, setSubmitting }) => {
              const updateParams: any = { ...params };
              updateParams.resetApiInputs = () => {
                setFieldValue('key', '');
                setFieldValue('secret', '');
              };
              updateParams.doneSubmitting = () => setSubmitting(false);
              configureDNS(updateParams);
            }}
            isInitialValid={false}>
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
  const dnsService = DnsService.getInstance();
  const dnsInfo = {
    hostname: dnsService.getHostname(),
    isLoggedIn: dnsService.getIsLoggedIn(),
    isRunningHttps: dnsService.getIsRunningHttps()
  };
  prefetchDnsInfo(queryClient, dnsInfo);
  return { props: { dehydratedState: dehydrate(queryClient) } };
});

Settings.getLayout = useMainLayout;

export default Settings;
