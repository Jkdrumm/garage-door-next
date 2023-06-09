import { UsersService } from '../../services';

export const getUsers = () => UsersService.getInstance().getUsers();
