const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ACTIONS = new Set(['submit', 'preview', 'download'])

export async function hashEmail(email) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function recordProfileLead(client, { email, action } = {}) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(normalized)) {
    return { ok: false, error: 'invalid_email', status: 400 }
  }
  if (!ACTIONS.has(action)) {
    return { ok: false, error: 'invalid_action', status: 400 }
  }
  if (!client?.config?.().token) {
    return { ok: false, error: 'cms_unavailable', status: 503 }
  }

  const now = new Date().toISOString()
  const id = `profileLead.${await hashEmail(normalized)}`

  await client.createIfNotExists({
    _id: id,
    _type: 'profileLead',
    email: normalized,
    submittedAt: now,
    lastSeenAt: now,
    previewCount: 0,
    downloadCount: 0,
    downloaded: false,
  })

  const patch = client.patch(id).set({ lastSeenAt: now })
  if (action === 'preview') {
    patch.inc({ previewCount: 1 }).set({ lastPreviewAt: now })
  }
  if (action === 'download') {
    patch.inc({ downloadCount: 1 }).set({ downloaded: true, lastDownloadAt: now })
  }
  await patch.commit()

  return { ok: true }
}
