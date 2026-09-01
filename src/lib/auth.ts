import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'demo-host',
      name: 'Host Demo Access',
      credentials: {
        email: { label: 'Host Email', type: 'email', placeholder: 'host@eventwishes.com' },
        name: { label: 'Host Name', type: 'text', placeholder: 'Sarah & Alex' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        return {
          id: credentials.email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: credentials.name || 'Event Host',
          email: credentials.email.toLowerCase(),
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id?: string }).id = token.sub || 'demo-host';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'event-wishes-super-secret-production-key-2026',
};
