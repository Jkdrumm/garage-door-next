import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { CenterBox } from '../components';
import { useMainLayout } from '../components/layouts';
import { requireLoggedIn } from '../utils/auth';
import { useUser } from '../utils/hooks';
import { validateName, validatePassword } from '../utils/validations';

const Profile = () => {
  const { data: user } = useUser();
  const [editMode, setEditMode] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const toast = useToast();

  const updateProfileError = () => {
    toast({
      title: 'Error updating profile',
      status: 'error',
      position: 'bottom-left',
      isClosable: true
    });
  };

  const updateProfileSuccess = (
    _data: any,
    { firstName, lastName, resetPassword }: { firstName: string; lastName: string; resetPassword: () => void }
  ) => {
    resetPassword();
    queryClient.setQueryData('user', (queryData: any) => {
      const updatedUser = queryData;
      if (firstName) updatedUser.firstName = firstName;
      if (lastName) updatedUser.lastName = lastName;
      return updatedUser;
    });
    toast({
      title: 'Profile updated',
      status: 'success',
      position: 'bottom-left',
      isClosable: true
    });
    setEditMode(false);
    setShowPassword(false);
  };

  const { mutate: updateProfile } = useMutation(
    (user: { firstName: string; lastName: string; password: string; resetPassword: () => void }) =>
      axios.post('/api/updateProfile', { firstName: user.firstName, lastName: user.lastName, password: user.password }),
    {
      onSuccess: updateProfileSuccess,
      onError: updateProfileError
    }
  );

  const getChangedFields = (values: { [field: string]: string }) => {
    const changedValues = [];
    if (values.firstName !== user?.firstName) changedValues.push('First Name');
    if (values.lastName !== user?.lastName) changedValues.push('Last Name');
    if (values.password !== '') changedValues.push('Password');
    return changedValues.join(' & ');
  };

  const hasChangedFields = (values: { [field: string]: string }) => {
    if (values.firstName !== user?.firstName) return true;
    if (values.lastName !== user?.lastName) return true;
    if (values.password !== '') return true;
    return false;
  };

  return (
    <CenterBox title="Profile">
      <Formik
        initialValues={{
          username: `${user?.username}`,
          firstName: `${user?.firstName}`,
          lastName: `${user?.lastName}`,
          password: ''
        }}
        onSubmit={({ firstName, lastName, password }, { setFieldValue }) => {
          const updateParams: any = {};
          if (firstName && firstName !== user?.firstName) updateParams.firstName = firstName;
          if (lastName && lastName !== user?.lastName) updateParams.lastName = lastName;
          if (password) updateParams.password = password;
          updateParams.resetPassword = () => setFieldValue('password', '');
          updateProfile(updateParams);
        }}>
        {props => (
          <Flex direction="column" width="100%" align="center">
            <Form>
              <Flex direction="column">
                <Field name="username">
                  {({ field, form }: { field: any; form: any }) => (
                    <FormControl isInvalid={form.errors.username && form.touched.username}>
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input {...field} id="username" isDisabled />
                    </FormControl>
                  )}
                </Field>
                <Flex direction={['column', 'row']}>
                  <Field name="firstName" validate={validateName}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.firstName && form.touched.firstName}
                        mr={['0px', '8px']}
                        mt="16px">
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
                        <Input {...field} id="firstName" isDisabled={!editMode} />
                        <FormErrorMessage>{form.errors.firstName}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="lastName" validate={validateName}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl
                        isInvalid={form.errors.lastName && form.touched.lastName}
                        ml={['0px', '8px']}
                        mt="16px">
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <Input {...field} id="lastName" isDisabled={!editMode} />
                        <FormErrorMessage>{form.errors.lastName}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </Flex>
                {editMode && (
                  <Field
                    name="password"
                    validate={(password: string) => (password ? validatePassword(password) : undefined)}>
                    {({ field, form }: { field: any; form: any }) => (
                      <FormControl isInvalid={form.errors.password && form.touched.password} mt="16px">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <InputGroup>
                          <Input {...field} id="password" type={showPassword ? 'text' : 'password'} />
                          <InputRightElement h="full">
                            <Button variant={'ghost'} onClick={() => setShowPassword(showPassword => !showPassword)}>
                              {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                )}
                <FormControl display="flex" alignItems="center" mt="16px">
                  <FormLabel htmlFor="edit-profile" mb="0">
                    Edit
                  </FormLabel>
                  <Switch
                    id="edit-profile"
                    isChecked={editMode}
                    onChange={() => {
                      const newEditMode = !editMode;
                      setEditMode(newEditMode);
                      if (!newEditMode) {
                        props.setValues({
                          username: `${user?.username}`,
                          firstName: `${user?.firstName}`,
                          lastName: `${user?.lastName}`,
                          password: ''
                        });
                      }
                    }}
                  />
                </FormControl>
                {editMode && (
                  <Button
                    colorScheme="purple"
                    mt={4}
                    borderRadius="48px"
                    width="100%"
                    height="64px"
                    isDisabled={!props.isValid || !hasChangedFields(props.values)}
                    type="submit">
                    {`Save ${getChangedFields(props.values)}`}
                  </Button>
                )}
              </Flex>
            </Form>
          </Flex>
        )}
      </Formik>
    </CenterBox>
  );
};
export default Profile;

export const getServerSideProps = requireLoggedIn();

Profile.getLayout = useMainLayout;
