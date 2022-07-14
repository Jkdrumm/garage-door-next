import { UsersService } from '../../services';

export const getUsers = async () => UsersService.getInstance().getUsers();
