'use client';

import { useEffect, useState } from 'react';

/**
 * A React hook that returns whether the code is running on the client or not.
 *
 * During server-side rendering, this hook will always return `false`.
 * After hydration on the client, it will return `true`.
 *
 * This is useful for avoiding hydration mismatches when components need to
 * render differently on the server and client.
 *
 * @returns {boolean} True if running on the client, false during SSR
 *
 * @example
 * const MyComponent = () => {
 *   const isClient = useIsClient();
 *
 *   // During SSR, this will always render "Loading..."
 *   // After hydration, it will render the actual content
 *   if (!isClient) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return <div>{window.innerWidth}</div>; // Safe to use window here
 * };
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export default useIsClient;
