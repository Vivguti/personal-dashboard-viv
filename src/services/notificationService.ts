import { supabase } from '@/lib/supabase'

/**
 * Checks if the browser supports push notifications and requests permission.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support desktop notifications.')
  }
  
  let permission = Notification.permission
  if (permission !== 'granted') {
    permission = await Notification.requestPermission()
  }
  return permission
}

/**
 * Subscribes the current device to push notifications and saves the subscription to Supabase.
 */
export async function subscribeToPushNotifications(publicVapidKey: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported by this browser.')
  }

  const registration = await navigator.serviceWorker.ready
  
  // Try to get existing subscription
  let subscription = await registration.pushManager.getSubscription()
  
  // If not subscribed, subscribe
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })
  }

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  // Save to database
  const subJSON = subscription.toJSON()
  
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .upsert(
      {
        user_id: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth,
        user_agent: navigator.userAgent
      },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('Failed to save push subscription to database:', error)
    throw error
  }

  return subscription
}

/**
 * Updates the user's notification preferences in their profile.
 */
export async function updateNotificationPreferences(preferences: {
  notifications_enabled?: boolean
  morning_summary_enabled?: boolean
  morning_summary_time?: string
  event_reminders_enabled?: boolean
  default_reminder_minutes?: number
  timezone?: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { error } = await (supabase as any)
    .from('profiles')
    .update(preferences)
    .eq('id', session.user.id)

  if (error) throw error
}

/**
 * Gets current profile settings including notifications.
 */
export async function getProfileSettings() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')

  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) throw error
  return data
}

// Helper to convert base64 VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
