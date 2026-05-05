import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';

if (typeof (globalThis as { self?: typeof globalThis }).self === 'undefined') {
  (globalThis as { self?: typeof globalThis }).self = globalThis;
}

// Load providers client-side only to avoid SSR issues with styled-components
const AppProviders = dynamic(() => import('@/components/AppProviders'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Explain pages are standalone — no prototype providers
  if (router.pathname.startsWith('/explain')) {
    return <Component {...pageProps} />;
  }

  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
