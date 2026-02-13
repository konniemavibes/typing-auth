'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SessionProvider 
          refetchInterval={5 * 60}
          refetchOnWindowFocus={false}
          refetchOnMount={true}
          baseUrl={process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL}
        >
          {children}
        </SessionProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
