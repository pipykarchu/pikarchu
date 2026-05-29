import { createServer } from 'node:http'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { readFile, mkdir, appendFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const contentDir = join(rootDir, 'content')
const dataDir = join(rootDir, 'data')

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) return

  const raw = readFileSync(filePath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').trim()
    }
  }
}

loadEnvFile(join(rootDir, '.env'))
loadEnvFile(join(__dirname, '.env'))

const port = Number(process.env.API_PORT || process.env.PORT || 5180)
const adminUser = process.env.ADMIN_USER || 'admin'
const adminPass = process.env.ADMIN_PASS || 'pixiyu2026'
const adminSecret = process.env.ADMIN_SECRET || randomBytes(32).toString('hex')
const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL || '1654387747@qq.com'
const sessionTtlMs = 1000 * 60 * 60 * 12
const allowedContactStatuses = new Set(['unread', 'read', 'replied', 'archived'])
const rateLimitBuckets = new Map()

const rateLimitRules = {
  login: { limit: 10, windowMs: 1000 * 60 * 15 },
  contact: { limit: 20, windowMs: 1000 * 60 * 10 },
  track: { limit: 120, windowMs: 1000 * 60 },
  admin: { limit: 180, windowMs: 1000 * 60 }
}

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

const enforceRateLimit = (req, bucketName) => {
  const rule = rateLimitRules[bucketName]
  if (!rule) return

  const now = Date.now()
  const key = `${bucketName}:${getClientIp(req)}`
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > rule.limit) {
    const error = new Error('请求太频繁，请稍后再试')
    error.statusCode = 429
    throw error
  }
}

const readJson = async (fileName) => {
  const raw = await readFile(join(contentDir, fileName), 'utf8')
  return JSON.parse(raw)
}

const readJsonl = async (fileName) => {
  try {
    const raw = await readFile(join(dataDir, fileName), 'utf8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

const getContactId = (contact) => {
  if (contact.id) return contact.id
  return createHash('sha1')
    .update(`${contact.createdAt || ''}:${contact.contact || ''}:${contact.message || ''}`)
    .digest('hex')
    .slice(0, 16)
}

const getContactStatusMap = async () => {
  const updates = await readJsonl('contact_status.jsonl')
  return updates.reduce((acc, update) => {
    if (update.contactId && allowedContactStatuses.has(update.status)) {
      acc[update.contactId] = update
    }
    return acc
  }, {})
}

const getContactReminderMap = async () => {
  const updates = await readJsonl('contact_reminders.jsonl')
  return updates.reduce((acc, update) => {
    if (update.contactId) acc[update.contactId] = update
    return acc
  }, {})
}

const signToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHash('sha256').update(`${body}.${adminSecret}`).digest('base64url')
  return `${body}.${signature}`
}

const verifyToken = (token) => {
  if (!token || !token.includes('.')) return null
  const [body, signature] = token.split('.')
  const expected = createHash('sha256').update(`${body}.${adminSecret}`).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (!payload.exp || Date.now() > payload.exp) return null
  return payload
}

const requireAdmin = (req) => {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    const error = new Error('Unauthorized')
    error.statusCode = 401
    throw error
  }
  return payload
}

const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1024 * 1024) {
        req.destroy()
        reject(new Error('Request body is too large'))
      }
    })

    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

const getContent = async () => {
  const [profile, categories, projects, services] = await Promise.all([
    readJson('profile.json'),
    readJson('categories.json'),
    readJson('projects.json'),
    readJson('services.json')
  ])

  return {
    profile,
    categories: categories.sort((a, b) => a.order - b.order),
    projects: projects.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    services
  }
}

const saveContact = async (req) => {
  const body = await readBody(req)
  const payload = body ? JSON.parse(body) : {}
  const contact = {
    id: `${Date.now()}-${randomBytes(4).toString('hex')}`,
    name: String(payload.name || '').trim(),
    contact: String(payload.contact || '').trim(),
    message: String(payload.message || '').trim(),
    source: String(payload.source || 'site').trim(),
    status: 'unread',
    reminderStatus: notifyEmail ? 'pending' : 'email_not_configured',
    createdAt: new Date().toISOString()
  }

  if (!contact.contact && !contact.message) {
    return { ok: false, error: 'contact or message is required' }
  }

  await mkdir(dataDir, { recursive: true })
  await appendFile(
    join(dataDir, 'contacts.jsonl'),
    `${JSON.stringify(contact)}\n`,
    'utf8'
  )

  contact.reminderStatus = await sendContactReminder(contact)
  await appendFile(
    join(dataDir, 'contact_reminders.jsonl'),
    `${JSON.stringify({
      contactId: contact.id,
      status: contact.reminderStatus,
      updatedAt: new Date().toISOString()
    })}\n`,
    'utf8'
  )

  return { ok: true, contact }
}

const sendContactReminder = async (contact) => {
  if (!notifyEmail) return 'email_not_configured'

  const subject = `新留言提醒：${contact.name || '访客'}`
  const text = [
    '你的网站收到一条新留言。',
    '',
    `称呼：${contact.name || '未填写'}`,
    `联系方式：${contact.contact || '未填写'}`,
    `来源：${contact.source || 'site'}`,
    `时间：${contact.createdAt}`,
    '',
    '留言：',
    contact.message || '未填写'
  ].join('\n')

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || 'Pixiyu Admin <onboarding@resend.dev>',
          to: [notifyEmail],
          subject,
          text
        })
      })
      return response.ok ? 'sent_resend' : 'failed_resend'
    } catch {
      return 'failed_resend'
    }
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || 'true') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: notifyEmail,
        subject,
        text
      })
      return 'sent_smtp'
    } catch {
      return 'failed_smtp'
    }
  }

  return 'email_credentials_missing'
}

const saveTrackEvent = async (req) => {
  const body = await readBody(req)
  const payload = body ? JSON.parse(body) : {}
  const event = {
    id: `${Date.now()}-${randomBytes(4).toString('hex')}`,
    type: String(payload.type || 'event').slice(0, 60),
    path: String(payload.path || '').slice(0, 200),
    label: String(payload.label || '').slice(0, 120),
    referrer: String(payload.referrer || '').slice(0, 300),
    sessionId: String(payload.sessionId || '').slice(0, 80),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    createdAt: new Date().toISOString()
  }

  await mkdir(dataDir, { recursive: true })
  await appendFile(join(dataDir, 'events.jsonl'), `${JSON.stringify(event)}\n`, 'utf8')
  return { ok: true }
}

const loginAdmin = async (req) => {
  const body = await readBody(req)
  const payload = body ? JSON.parse(body) : {}
  const username = String(payload.username || '')
  const password = String(payload.password || '')

  if (username !== adminUser || password !== adminPass) {
    return { ok: false, error: '账号或密码不正确' }
  }

  return {
    ok: true,
    token: signToken({
      role: 'admin',
      username,
      exp: Date.now() + sessionTtlMs
    }),
    expiresIn: sessionTtlMs / 1000
  }
}

const updateContactStatus = async (req, contactId) => {
  const body = await readBody(req)
  const payload = body ? JSON.parse(body) : {}
  const status = String(payload.status || '')

  if (!allowedContactStatuses.has(status)) {
    return { ok: false, error: '状态不正确' }
  }

  const contacts = await readJsonl('contacts.jsonl')
  const exists = contacts.some(contact => getContactId(contact) === contactId)
  if (!exists) {
    return { ok: false, error: '留言不存在' }
  }

  const update = {
    contactId,
    status,
    updatedAt: new Date().toISOString()
  }
  await mkdir(dataDir, { recursive: true })
  await appendFile(join(dataDir, 'contact_status.jsonl'), `${JSON.stringify(update)}\n`, 'utf8')
  return { ok: true, update }
}

const getAdminSummary = async () => {
  const [rawContacts, events, statusMap, reminderMap] = await Promise.all([
    readJsonl('contacts.jsonl'),
    readJsonl('events.jsonl'),
    getContactStatusMap(),
    getContactReminderMap()
  ])
  const contacts = rawContacts.map(contact => {
    const id = getContactId(contact)
    const update = statusMap[id]
    const reminder = reminderMap[id]
    return {
      ...contact,
      id,
      status: update?.status || contact.status || 'unread',
      statusUpdatedAt: update?.updatedAt || null,
      reminderStatus: reminder?.status || contact.reminderStatus || 'unknown',
      reminderUpdatedAt: reminder?.updatedAt || null
    }
  })
  const now = Date.now()
  const oneDay = 1000 * 60 * 60 * 24
  const isRecent = (item, days) => now - new Date(item.createdAt).getTime() <= oneDay * days
  const pageViews = events.filter(event => event.type === 'page_view')
  const sessions = new Set(events.map(event => event.sessionId).filter(Boolean))
  const todayEvents = events.filter(event => isRecent(event, 1))

  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {})
  const statusCounts = contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1
    return acc
  }, {})

  return {
    ok: true,
    stats: {
      contacts: contacts.length,
      unreadContacts: statusCounts.unread || 0,
      readContacts: statusCounts.read || 0,
      repliedContacts: statusCounts.replied || 0,
      archivedContacts: statusCounts.archived || 0,
      pageViews: pageViews.length,
      sessions: sessions.size,
      eventsToday: todayEvents.length,
      contacts7d: contacts.filter(item => isRecent(item, 7)).length
    },
    contacts: contacts.slice(-80).reverse(),
    recentEvents: events.slice(-120).reverse(),
    eventCounts,
    statusCounts,
    reminder: {
      email: notifyEmail,
      enabled: Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)),
      provider: process.env.RESEND_API_KEY ? 'resend' : (process.env.SMTP_HOST ? 'smtp' : 'none'),
      note: process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
        ? '邮件提醒已具备发送配置。'
        : '已设置收件邮箱，但还缺 SMTP 授权码或 Resend API Key。'
    },
    security: {
      customAdminSecret: Boolean(process.env.ADMIN_SECRET),
      customAdminPassword: Boolean(process.env.ADMIN_PASS),
      https: process.env.NODE_ENV === 'production' ? '需要由部署平台或反向代理提供 HTTPS' : '本地开发未启用 HTTPS',
      rateLimit: true
    }
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {})
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'pixiyu-personal-ip-api',
        time: new Date().toISOString()
      })
    }

    if (req.method === 'GET' && url.pathname === '/api/content') {
      return sendJson(res, 200, await getContent())
    }

    if (req.method === 'POST' && url.pathname === '/api/contact') {
      enforceRateLimit(req, 'contact')
      const result = await saveContact(req)
      return sendJson(res, result.ok ? 201 : 400, result)
    }

    if (req.method === 'POST' && url.pathname === '/api/track') {
      enforceRateLimit(req, 'track')
      return sendJson(res, 201, await saveTrackEvent(req))
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      enforceRateLimit(req, 'login')
      const result = await loginAdmin(req)
      return sendJson(res, result.ok ? 200 : 401, result)
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/summary') {
      enforceRateLimit(req, 'admin')
      requireAdmin(req)
      return sendJson(res, 200, await getAdminSummary())
    }

    const contactStatusMatch = url.pathname.match(/^\/api\/admin\/contacts\/([^/]+)\/status$/)
    if (req.method === 'PATCH' && contactStatusMatch) {
      enforceRateLimit(req, 'admin')
      requireAdmin(req)
      const result = await updateContactStatus(req, decodeURIComponent(contactStatusMatch[1]))
      return sendJson(res, result.ok ? 200 : 400, result)
    }

    return sendJson(res, 404, { ok: false, error: 'API not found' })
  } catch (error) {
    console.error(error)
    return sendJson(res, error.statusCode || 500, { ok: false, error: error.message || 'Server error' })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`API server ready: http://127.0.0.1:${port}`)
})
