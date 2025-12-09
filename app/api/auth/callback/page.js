'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        router.push('/?error=auth_failed');
        return;
      }

      if (code) {
        try {
          const response = await fetch(`https://api.stack-auth.com/api/v1/auth/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-stack-project-id': process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
              'x-stack-publishable-client-key': process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            const userData = await response.json();
            
            localStorage.setItem('authUser', JSON.stringify({
              id: userData.user_id,
              name: userData.display_name || userData.email,
              email: userData.email,
              image: userData.profile_image_url,
            }));

            router.push('/');
          } else {
            throw new Error('Failed to authenticate');
          }
        } catch (error) {
          console.error('Callback error:', error);
          router.push('/?error=auth_failed');
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}