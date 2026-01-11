import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import db from '@/db';
import { users } from '@/db/schema';

// Use environment variable or generate a default secret for development
const authSecret = process.env.NEXTAUTH_SECRET || 'default-dev-secret-change-in-production';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
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

        const user = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1);

        console.log('AUTH DEBUG: User query result:', user ? `Found ${user.length} users` : 'No users found');

        if (!user || user.length === 0) {
          console.log('AUTH DEBUG: User not found');
          return null;
        }

        console.log('AUTH DEBUG: User found:', { id: user[0].id, email: user[0].email, role: user[0].role });

        const isValidPassword = await bcrypt.compare(credentials.password as string, user[0].password);

        console.log('AUTH DEBUG: Password valid:', isValidPassword);

        if (!isValidPassword) {
          console.log('AUTH DEBUG: Invalid password');
          return null;
        }

        // Check if user is admin
        if (user[0].role !== 'admin') {
          console.log('AUTH DEBUG: User is not admin, role:', user[0].role);
          return null;
        }

        console.log('AUTH DEBUG: Authentication successful for:', user[0].email);

        return {
          id: String(user[0].id),
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
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
