import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// Use environment variable or generate a default secret for development
const authSecret = process.env.NEXTAUTH_SECRET || 'default-dev-secret-change-in-production';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        console.log('AUTH DEBUG: Authorize called with email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('AUTH DEBUG: Missing email or password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('AUTH DEBUG: User query result:', user ? `Found user` : 'No user found');

        if (!user) {
          console.log('AUTH DEBUG: User not found');
          return null;
        }

        console.log('AUTH DEBUG: User found:', { id: user.id, email: user.email, role: user.role });

        const isValidPassword = await bcrypt.compare(credentials.password as string, user.password);

        console.log('AUTH DEBUG: Password valid:', isValidPassword);

        if (!isValidPassword) {
          console.log('AUTH DEBUG: Invalid password');
          return null;
        }

        // Check if user is admin
        if (user.role !== 'ADMIN') {
          console.log('AUTH DEBUG: User is not admin, role:', user.role);
          return null;
        }

        console.log('AUTH DEBUG: Authentication successful for:', user.email);

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});
