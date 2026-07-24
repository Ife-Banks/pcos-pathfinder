/**
 * src/services/push.ts
 * ────────────────────
 * Browser push notification subscription management.
 * Handles permission requests, VAPID subscription, and backend sync.
 */
import apiClient from '@/services/apiClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request browser notification permission, subscribe to push,
 * and register the subscription with the backend.
 * Returns true on success, false if denied or failed.
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('Push notifications are not supported in this browser');
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VITE_VAPID_PUBLIC_KEY is not configured');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = subscription.toJSON();
    const keys = json.keys as { p256dh: string; auth: string };

    await apiClient.post('/notifications/push-subscribe/', {
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    return true;
  } catch (err) {
    console.error('Failed to subscribe to push notifications:', err);
    return false;
  }
}

/**
 * Unsubscribe from browser push and remove the subscription from the backend.
 */
export async function removePushSubscription(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;

    await apiClient.delete('/notifications/push-unsubscribe/', {
      data: { endpoint },
    });

    await subscription.unsubscribe();
  } catch (err) {
    console.error('Failed to unsubscribe from push notifications:', err);
  }
}

/**
 * Check if the user currently has push notification permission granted
 * and an active push subscription exists.
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}
