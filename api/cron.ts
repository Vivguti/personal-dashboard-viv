import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET/POST for cron
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Configure Web Push
    const vapidPublic = process.env.VITE_VAPID_PUBLIC_KEY
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY
    
    if (!vapidPublic || !vapidPrivate) {
      console.warn('VAPID keys not configured, skipping push notifications.')
      return res.status(200).json({ status: 'VAPID keys missing' })
    }

    webpush.setVapidDetails(
      'mailto:admin@example.com',
      vapidPublic,
      vapidPrivate
    )

    // Get profiles with notifications enabled
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('notifications_enabled', true)

    if (profileErr) throw profileErr
    if (!profiles || profiles.length === 0) {
      return res.status(200).json({ status: 'No users with notifications enabled' })
    }

    let notificationsSent = 0

    // Process each user
    for (const profile of profiles) {
      const userTimezone = profile.timezone || 'UTC'
      const now = new Date()
      
      // Get current hour/minute in user's timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      })
      const timeParts = formatter.format(now).split(':')
      const currentHour = parseInt(timeParts[0], 10)
      const currentMinute = parseInt(timeParts[1], 10)
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      
      // Today date string in user's timezone (YYYY-MM-DD)
      const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: userTimezone })
      const todayStr = dateFormatter.format(now)

      // 1. Morning Summary Check
      if (profile.morning_summary_enabled && profile.morning_summary_time) {
        // Compare times (allowing a 15-minute window for the cron job)
        const summaryHour = parseInt(profile.morning_summary_time.split(':')[0], 10)
        const summaryMin = parseInt(profile.morning_summary_time.split(':')[1], 10)
        
        // If current time is past the summary time but within 30 minutes, it might be due
        const currentTotalMins = currentHour * 60 + currentMinute
        const summaryTotalMins = summaryHour * 60 + summaryMin
        
        if (currentTotalMins >= summaryTotalMins && currentTotalMins < summaryTotalMins + 30) {
          const logRef = `summary_${todayStr}`
          
          // Check if already sent
          const { data: log } = await supabase
            .from('notification_logs')
            .select('*')
            .eq('user_id', profile.id)
            .eq('notification_type', 'morning_summary')
            .eq('reference_id', logRef)
            .single()

          if (!log) {
            // Count today's events
            const { data: events } = await supabase
              .from('calendar_events')
              .select('id, title, start_time')
              .eq('user_id', profile.id)
              .gte('start_time', `${todayStr}T00:00:00Z`)
              .lte('start_time', `${todayStr}T23:59:59Z`)
              
            const eventCount = events ? events.length : 0
            const firstEvent = events && events.length > 0 ? events[0].title : null
            
            let body = `You have ${eventCount} things scheduled today.`
            if (firstEvent) body += ` First up: ${firstEvent}.`

            const success = await sendPushToUser(
              supabase,
              profile.id,
              `Good morning, ${profile.display_name || 'Viv'} 👋`,
              body,
              '/'
            )

            if (success) {
              await supabase.from('notification_logs').insert({
                user_id: profile.id,
                notification_type: 'morning_summary',
                reference_id: logRef
              })
              notificationsSent++
            }
          }
        }
      }

      // 2. Upcoming Event Reminders Check
      if (profile.event_reminders_enabled) {
        const reminderMins = profile.default_reminder_minutes || 30
        
        // Find events starting between NOW and NOW + reminderMins + 15mins
        const reminderStartThreshold = new Date(now.getTime() + (reminderMins - 15) * 60000).toISOString()
        const reminderEndThreshold = new Date(now.getTime() + (reminderMins + 15) * 60000).toISOString()

        const { data: upcomingEvents } = await supabase
          .from('calendar_events')
          .select('id, title, start_time')
          .eq('user_id', profile.id)
          .gte('start_time', reminderStartThreshold)
          .lte('start_time', reminderEndThreshold)

        if (upcomingEvents) {
          for (const ev of upcomingEvents) {
            const logRef = `event_${ev.id}`
            
            // Check if already sent
            const { data: log } = await supabase
              .from('notification_logs')
              .select('*')
              .eq('user_id', profile.id)
              .eq('notification_type', 'event_reminder')
              .eq('reference_id', logRef)
              .single()

            if (!log) {
              const evTime = new Intl.DateTimeFormat('en-US', {
                timeZone: userTimezone, hour: 'numeric', minute: 'numeric'
              }).format(new Date(ev.start_time))

              const success = await sendPushToUser(
                supabase,
                profile.id,
                `Reminder: ${ev.title}`,
                `Starts at ${evTime}`,
                '/calendar'
              )

              if (success) {
                await supabase.from('notification_logs').insert({
                  user_id: profile.id,
                  notification_type: 'event_reminder',
                  reference_id: logRef
                })
                notificationsSent++
              }
            }
          }
        }
      }
    }

    return res.status(200).json({ status: 'success', sent: notificationsSent })

  } catch (err: any) {
    console.error('Cron error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function sendPushToUser(supabase: any, userId: string, title: string, body: string, url: string): Promise<boolean> {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return false

  const payload = JSON.stringify({ title, body, data: { url } })
  let success = false

  for (const sub of subs) {
    try {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }
      await webpush.sendNotification(pushSub, payload)
      success = true
    } catch (err: any) {
      // If subscription is gone, delete it from DB
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      } else {
        console.error('Failed to send push to sub', sub.id, err)
      }
    }
  }

  return success
}
