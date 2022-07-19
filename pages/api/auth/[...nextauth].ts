import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import { compare } from 'bcryptjs';
import { UsersService } from '../../../utils/services';

const USERNAME_OR_PASSWORD_ERROR_MESSAGE = 'Invalid Username/Password';

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { username, password } = credentials as any;
        const client = await MongoClient.connect(`mongodb://${process.env.MONGODB_URI}`);
        const users = client.db().collection('users');
        const result = await users.findOne({
          username: username
        });
        if (!result) {
          client.close();
          throw new Error(USERNAME_OR_PASSWORD_ERROR_MESSAGE);
        }
        const checkPassword = await compare(password, result.password);
        if (!checkPassword) {
          client.close();
          throw new Error(USERNAME_OR_PASSWORD_ERROR_MESSAGE);
        }
        client.close();
        return {
          id: result._id.toString()
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ session, token }) => {
      const isInCache = UsersService.getInstance().isUserInCache((token as any).user.id);
      if (isInCache) {
        (session as any).user = token.user;
        return session;
      }
      (session as any).user = undefined;
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.user = user;
      return token;
    }
  },
  secret: process.env.AUTH_SECRET
});
