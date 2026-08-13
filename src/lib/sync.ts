import { useEffect } from 'react'

// Singleton BroadcastChannel for cross-tab synchronization
// Only initialize on the client side
const channel = typeof window !== 'undefined' ? new BroadcastChannel('viv-app-sync') : null

/**
 * Trigger a global sync event that will cause all mounted pages
 * to immediately re-fetch their data. This works across tabs as well.
 */
export const triggerSync = () => {
  if (typeof window !== 'undefined') {
    // 1. Dispatch locally in the current tab
    window.dispatchEvent(new Event('app-sync'))
    
    // 2. Broadcast to other open tabs
    if (channel) {
      channel.postMessage('sync')
    }
  }
}

/**
 * Hook to automatically listen for sync events and execute a callback.
 * Typically used in top-level pages to trigger data re-fetching.
 * 
 * @param callback The function to run when a sync event is received (e.g. loadData)
 */
export function useAppSync(callback: () => void) {
  useEffect(() => {
    // Handler for local events
    const handleLocalSync = () => {
      callback()
    }
    
    // Handler for cross-tab events
    const handleRemoteSync = (event: MessageEvent) => {
      if (event.data === 'sync') {
        callback()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('app-sync', handleLocalSync)
      if (channel) {
        channel.addEventListener('message', handleRemoteSync)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('app-sync', handleLocalSync)
        if (channel) {
          channel.removeEventListener('message', handleRemoteSync)
        }
      }
    }
  }, [callback])
}
