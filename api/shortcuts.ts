import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Apple Shortcuts API Handler
// Requires Authorization: Bearer <Supabase_JWT>
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' })
    }

    // Authenticate the request via JWT in Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) {
      return res.status(401).json({ error: 'Unauthorized access token' })
    }

    // Handle GET: Retrieve today's schedule
    if (req.method === 'GET') {
      const now = new Date()
      // Default to UTC if we don't fetch the profile timezone, but let's fetch it
      const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single()
      const tz = profile?.timezone || 'UTC'
      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)

      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, end_time, location')
        .eq('user_id', user.id)
        .gte('start_time', `${todayStr}T00:00:00Z`)
        .lte('start_time', `${todayStr}T23:59:59Z`)
        .order('start_time', { ascending: true })

      if (error) throw error

      return res.status(200).json({
        message: `Found ${events?.length || 0} events today.`,
        events
      })
    }

    // Handle POST: Add a task or event
    if (req.method === 'POST') {
      const { type, title, start_time, end_time } = req.body

      if (type === 'task') {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: title || 'New Task from Shortcut',
            status: 'inbox'
          })
          .select()
          .single()
        
        if (error) throw error
        return res.status(200).json({ success: true, task: data })
      }

      if (type === 'event') {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({
            user_id: user.id,
            title: title || 'New Event',
            start_time: start_time || new Date().toISOString(),
            end_time: end_time || new Date(Date.now() + 3600000).toISOString(),
            event_type: 'personal',
            source: 'manual'
          })
          .select()
          .single()
        
        if (error) throw error
        return res.status(200).json({ success: true, event: data })
      }

      return res.status(400).json({ error: 'Invalid type payload (use "task" or "event")' })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (err: any) {
    console.error('Shortcuts API error:', err)
    return res.status(500).json({ error: err.message })
  }
}
