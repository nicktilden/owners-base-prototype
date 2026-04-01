import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portfolio');
  }, [router]);

  return null;
}
