'use client';

import { ReactNode, useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache';
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function AuthBootstrapper({ children }: { children: ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isLoaded && userId) {
      getOrCreateUser({ clerkId: userId }).catch(console.error);
    }
  }, [isLoaded, userId, getOrCreateUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      {/* Convex needs Clerk's context */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* 👇 satisfies useQuery from convex-helpers */}
        <ConvexQueryCacheProvider>
          <AuthBootstrapper>
            {children}
          </AuthBootstrapper>
        </ConvexQueryCacheProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
