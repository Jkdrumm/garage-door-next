import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { DatabaseService, OpenSslService, UsersService } from 'services';

const USERNAME_OR_PASSWORD_ERROR_MESSAGE = 'Invalid Username/Password';

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const password = credentials?.password ?? '';
        const username = credentials?.username ?? '';
        const users = DatabaseService.getInstance().getClient().collection('users');
        const result = await users.findOne({ username: { $regex: new RegExp(username, 'i') } });
        if (!result) throw new Error(USERNAME_OR_PASSWORD_ERROR_MESSAGE);
        const checkPassword = await compare(password, result.password);
        if (!checkPassword) throw new Error(USERNAME_OR_PASSWORD_ERROR_MESSAGE);
        return {
          id: result._id.toString(),
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ session, token }) => {
      const isInCache = UsersService.getInstance().isUserInCache((token as any).user.id);
      (session as any).user = isInCache ? token.user : undefined;
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.user = user;
      return token;
    },
  },
  secret: OpenSslService.getInstance().getNextAuthSecret(),
});
