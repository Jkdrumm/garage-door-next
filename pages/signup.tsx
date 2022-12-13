import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text
} from '@chakra-ui/react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CenterBox, Link } from '../components';
import { requireLoggedOut } from '../utils/auth';
import { validateUsername, validatePassword, validateName } from '../utils/validations';

function SignUp() {
  const router = useRouter();
  const [signUpError, setSignUpError] = useState<string>();
  const [signUpLoading, setSignUpLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const createAccountSuccess = async (_data: any, { username, password }: { [field: string]: string }) => {
    const { ok } = (await signIn('credentials', {
      redirect: false,
      username,
      password
    })) as any;
    if (!ok) {
      // If account was created but there was an error logging in for some reason, just return to the login page.
      router.push('/');
    } else router.push('/home');
  };
  const createAccountError = (error: any) => {
    setSignUpError(error.response.data.message);
    setSignUpLoading(false);
  };

  const { mutate: createUser } = useMutation(
    (user: { firstName: string; lastName: string; username: string; password: string }) =>
      axios.post('/api/auth/signup', user),
    {
      onSuccess: createAccountSuccess,
      onError: createAccountError
    }
  );

  return (
    <CenterBox title="Sign Up" showColorToggleOnDesktop>
      <Formik
        initialValues={{ firstName: '', lastName: '', username: '', password: '' }}
        onSubmit={async ({ firstName, lastName, username, password }: { [field: string]: string }) => {
          setSignUpLoading(true);
          createUser({ firstName, lastName, username, password });
        }}>
        {props => (
          <Flex direction="column" width="100%" align="center">
            <Form>
              <Flex direction="column">
                <Flex direction={['column', 'row']}>
                  <Field name="firstName" validate={validateName}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.firstName && form.touched.firstName}
                        isRequired
                        mr={['0px', '8px']}>
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
                        <Input {...field} id="firstName" />
                        <FormErrorMessage>{form.errors.firstName}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="lastName" validate={validateName}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.lastName && form.touched.lastName}
                        isRequired
                        ml={['0px', '8px']}
                        mt={['16px', '0px']}>
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <Input {...field} id="lastName" />
                        <FormErrorMessage>{form.errors.lastName}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>
                <Field name="username" validate={validateUsername}>
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl isInvalid={form.errors.username && form.touched.username} isRequired mt="16px">
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input {...field} id="username" />
                      <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="password" validate={validatePassword}>
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl isInvalid={form.errors.password && form.touched.password} isRequired mt="16px">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <InputGroup>
                        <Input {...field} id="password" type={showPassword ? 'text' : 'password'} />
                        <InputRightElement h="full">
                          <Button variant="ghost" onClick={() => setShowPassword(showPassword => !showPassword)}>
                            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                {signUpError && (
                  <Text textColor="red.300" mt="4px">
                    {signUpError}
                  </Text>
                )}
                <Button
                  type="submit"
                  colorScheme="purple"
                  mt={4}
                  borderRadius="48px"
                  width="100%"
                  height="64px"
                  isLoading={signUpLoading}
                  isDisabled={
                    !props.isValid ||
                    props.values.firstName === '' ||
                    props.values.lastName === '' ||
                    props.values.username === '' ||
                    props.values.password === ''
                  }
                  onClick={() => props.handleSubmit()}>
                  Sign Up
                </Button>
              </Flex>
            </Form>
          </Flex>
        )}
      </Formik>
      <Flex justify="center" mt="16px">
        <Text>
          Already a user?{' '}
          <Link href="/" color="blue.400">
            Login
          </Link>
        </Text>
      </Flex>
    </CenterBox>
  );
}

export const getServerSideProps = requireLoggedOut();

export default SignUp;
