'use client';

import { useState } from 'react';
import { Client, Delivery } from '@/lib/types';
import ClientLockScreen from './ClientLockScreen';
import ClientDeliveryView from './ClientDeliveryView';

interface ClientPortalWrapperProps {
  client: Client;
  deliveries: Delivery[];
  initiallyAuthenticated: boolean;
}

export default function ClientPortalWrapper({
  client,
  deliveries,
  initiallyAuthenticated,
}: ClientPortalWrapperProps) {
  const [unlocked, setUnlocked] = useState(initiallyAuthenticated);

  if (!unlocked) {
    return (
      <ClientLockScreen
        client={client}
        onUnlocked={() => setUnlocked(true)}
      />
    );
  }

  return <ClientDeliveryView client={client} deliveries={deliveries} />;
}
