import type { User } from '@prisma/client';

declare module 'better-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    role: 'ADMIN' | 'USER';
    createdAt: Date;
    updatedAt: Date;
  }
}
