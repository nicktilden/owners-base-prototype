import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProjectIndexRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.replace(`/project/${id}/overview`);
    }
  }, [id]);

  return null;
}
