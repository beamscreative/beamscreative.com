import { createClient } from '@sanity/client'
import { recordProfileLead } from '../../scripts/record-profile-lead.mjs'

function json(body, status = 200) {
  return Response.json(body, { status })
}

export async function onRequestPost({ request, env }) {
  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET || 'production',
    apiVersion: env.SANITY_API_VERSION || '2025-02-19',
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  })

  try {
    const result = await recordProfileLead(client, payload)
    return json(result, result.ok ? 200 : result.status || 400)
  } catch (error) {
    console.error('[profile-lead]', error)
    return json({ ok: false, error: 'server_error' }, 500)
  }
}
