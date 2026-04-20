'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'; 
import { setToken } from '@/lib/api';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');

      if (code) {
        // Initialize Supabase (Ensure these ENV variables are set in Vercel!)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Exchange the temporary 'code' for a real 'session'
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Axiom_Auth_Error:", error.message);
          router.push('/auth?error=exchange_failed');
          return;
        }

        if (data.session) {
          // 2. Save the access token so our API helper can use it
          setToken(data.session.access_token);
          
          // 3. Protocol Success: Proceed to Dashboard
          router.push('/dashboard');
        }
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white font-mono">
      <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-20" />
      <div className="space-y-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em]">Exchanging_Auth_Code...</p>
        <p className="text-[7px] text-zinc-500 uppercase tracking-widest animate-pulse">Establishing_Secure_Session</p>
      </div>
    </div>
  );
}

// Suspense is required for useSearchParams in Next.js 14/15
export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="bg-black h-screen" />}>
      <CallbackHandler />
    </Suspense>
  );
}