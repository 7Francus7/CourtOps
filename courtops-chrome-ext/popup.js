const DEFAULT_URL = 'https://app.courtops.net'

async function getCourtOpsUrl() {
  const result = await chrome.storage.local.get('courtopsUrl')
  return result.courtopsUrl || DEFAULT_URL
}

async function init() {
  const urlInput = document.getElementById('courtopsUrl')
  const saveBtn = document.getElementById('saveUrl')
  const statusDot = document.getElementById('statusDot')
  const scanBtn = document.getElementById('scanBtn')
  const contactsList = document.getElementById('contactsList')

  // Load saved URL
  const savedUrl = await getCourtOpsUrl()
  urlInput.value = savedUrl

  // Test connectivity
  try {
    const res = await fetch(savedUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    if (res.ok || res.status < 500) statusDot.classList.add('online')
  } catch {}

  // Quick links navigation
  document.querySelectorAll('.link-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const base = await getCourtOpsUrl()
      const path = btn.dataset.path
      chrome.tabs.create({ url: `${base}${path}` })
    })
  })

  // Save URL
  saveBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim().replace(/\/$/, '')
    if (!url) return
    await chrome.storage.local.set({ courtopsUrl: url })
    saveBtn.textContent = '✓ Guardado'
    saveBtn.classList.add('saved')
    setTimeout(() => {
      saveBtn.textContent = 'Guardar'
      saveBtn.classList.remove('saved')
    }, 2000)
  })

  // Scan page for contacts
  scanBtn.addEventListener('click', async () => {
    scanBtn.textContent = '...'
    scanBtn.disabled = true

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractContacts,
      })

      const contacts = results[0]?.result || []
      renderContacts(contacts, contactsList)
    } catch (err) {
      contactsList.innerHTML = '<p class="empty-msg">No se pudo escanear esta página.</p>'
    }

    scanBtn.textContent = 'Escanear'
    scanBtn.disabled = false
  })
}

function extractContacts() {
  const text = document.body.innerText
  const found = []

  // Phone numbers (Argentina format)
  const phonePatterns = [
    /(?:\+54|0054|54)?[\s\-]?(?:9[\s\-]?)?(?:11|[2-9]\d{2,3})[\s\-]?\d{4}[\s\-]?\d{4}/g,
    /(?:Tel[eé]fono|Cel[ular]*|Tel|Cel|Whatsapp|WA)[:\s]+([+\d\s\-()]{8,18})/gi,
  ]
  const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const igPattern = /@([a-zA-Z0-9._]{2,30})/g

  const phones = new Set()
  for (const pat of phonePatterns) {
    const matches = text.matchAll(pat)
    for (const m of matches) {
      const val = (m[1] || m[0]).replace(/\s+/g, ' ').trim()
      if (val.replace(/\D/g, '').length >= 8) phones.add(val)
    }
  }
  phones.forEach(p => found.push({ type: 'Teléfono', value: p }))

  const emails = new Set(text.match(emailPattern) || [])
  emails.forEach(e => {
    if (!e.includes('example') && !e.includes('test')) found.push({ type: 'Email', value: e })
  })

  const igs = new Set()
  const igMatches = text.matchAll(igPattern)
  for (const m of igMatches) {
    if (!['gmail', 'yahoo', 'hotmail', 'outlook'].includes(m[1].toLowerCase())) igs.add(m[1])
  }
  igs.forEach(ig => found.push({ type: 'Instagram', value: `@${ig}` }))

  // Club name heuristic: og:site_name or title
  const ogSite = document.querySelector('meta[property="og:site_name"]')?.content
  const pageTitle = document.title?.split(' - ')[0]?.split(' | ')[0]?.trim()
  const name = ogSite || pageTitle || ''
  if (name && name.length > 2 && name.length < 60) found.unshift({ type: 'Club', value: name })

  return found.slice(0, 12)
}

function renderContacts(contacts, container) {
  if (!contacts.length) {
    container.innerHTML = '<p class="empty-msg">No se encontraron datos de contacto.</p>'
    return
  }
  container.innerHTML = ''
  contacts.forEach(({ type, value }) => {
    const item = document.createElement('div')
    item.className = 'contact-item'
    item.innerHTML = `
      <div class="contact-info">
        <span class="contact-type">${type}</span>
        <span class="contact-value" title="${value}">${value}</span>
      </div>
      <button class="add-btn" data-value="${encodeURIComponent(value)}" data-type="${type}">+ Agregar</button>
    `
    container.appendChild(item)
  })

  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const base = await getCourtOpsUrl()
      const value = decodeURIComponent(btn.dataset.value)
      const type = btn.dataset.type
      const query = type === 'Email' ? `?email=${encodeURIComponent(value)}`
                  : type === 'Teléfono' ? `?phone=${encodeURIComponent(value)}`
                  : `?name=${encodeURIComponent(value)}`
      chrome.tabs.create({ url: `${base}/clientes/nuevo${query}` })
    })
  })
}

document.addEventListener('DOMContentLoaded', init)
