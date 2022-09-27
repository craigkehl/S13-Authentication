import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { connectDatabase } from '../../../lib/db-util';
import { verifyPassword } from '../../../lib/auth';

export default NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      async authorize(credentials, req) {
        const { email, password } = credentials;
        const client = await connectDatabase();
        const usersCollection = client.db().collection('users');

        const user = await usersCollection.findOne({ email });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        const isValid = await verifyPassword(password, user.hashedPassword);

        if (!isValid) {
          client.close();
          throw new Error('Could not log you in!');
        }

        client.close();
        return { email: user.email };
      },
    }),
  ],
  pages: {
    signIn: '/auth',
    signOut: '/',
  },
  callbacks: {
    jwt: params => {
      // update token
      if (params.user?.role) {
        params.token.role = params.user.role;
      }
      // return final_token
      return params.token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    encryption: true,
  },
});
