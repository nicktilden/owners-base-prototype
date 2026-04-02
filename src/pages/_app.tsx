import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '@/styles/globals.css';

if (typeof (globalThis as { self?: typeof globalThis }).self === 'undefined') {
  (globalThis as { self?: typeof globalThis }).self = globalThis;
}

// Load providers client-side only to avoid SSR issues with styled-components
const AppProviders = dynamic(() => import('@/components/AppProviders'), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
