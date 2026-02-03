'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
