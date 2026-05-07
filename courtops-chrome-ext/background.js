chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'courtops-add-client',
    title: 'Agregar a CourtOps como cliente',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'courtops-add-client' && info.selectionText) {
    const result = await chrome.storage.local.get('courtopsUrl')
    const base = result.courtopsUrl || 'https://app.courtops.net'
    const query = `?name=${encodeURIComponent(info.selectionText.trim())}`
    chrome.tabs.create({ url: `${base}/clientes/nuevo${query}` })
  }
})
