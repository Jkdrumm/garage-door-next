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
import { Formik, Form, Field } from 'formik';
import { signIn } from 'next-auth/react';
import { validateUsername, validatePassword } from '../utils/validations';
import { CenterBox, Link } from '../components';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { requireLoggedOut } from '../utils/auth';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

function Index() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string>();
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <CenterBox title="Login" showColorToggleOnDesktop>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async ({ username, password }: { username: string; password: string }) => {
          setLoginLoading(true);
          const { error, ok } = (await signIn('credentials', {
            redirect: false,
            username,
            password
          })) as any;
          if (!ok) {
            setLoginError(error);
            setLoginLoading(false);
          } else router.push('/home');
        }}>
        {({ handleSubmit }) => (
          <Form>
            <Flex direction="column" width="inherit" align="center">
              <Field name="username" validate={validateUsername}>
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl isInvalid={form.errors.username && form.touched.username}>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <Input {...field} id="username" placeholder="username" />
                    <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="password" validate={validatePassword}>
                {({ field, form }: { field: any; form: any }) => (
                  <FormControl isInvalid={form.errors.password && form.touched.password}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...field}
                        id="password"
                        placeholder="password"
                        type={showPassword ? 'text' : 'password'}
                      />
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
              {loginError && (
                <Text textColor="red.300" mt="4px">
                  {loginError}
                </Text>
              )}
              <Button
                type="submit"
                colorScheme="purple"
                mt={4}
                borderRadius="48px"
                width="75%"
                height="64px"
                isLoading={loginLoading}
                onClick={() => handleSubmit()}>
                Login
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
      <Link href="/signup" color="blue.400" mt="16px">
        Create an Account
      </Link>
    </CenterBox>
  );
}

export const getServerSideProps = requireLoggedOut();

export default Index;
