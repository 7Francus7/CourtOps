// Listens for messages from popup to highlight detected contacts on the page
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'highlight' && msg.value) {
    highlightText(msg.value)
  }
})

function highlightText(text) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach(node => {
    if (node.textContent.includes(text)) {
      const span = document.createElement('mark')
      span.style.cssText = 'background:#86efac;color:#052e16;border-radius:2px;padding:0 2px;'
      const idx = node.textContent.indexOf(text)
      const before = document.createTextNode(node.textContent.slice(0, idx))
      span.textContent = text
      const after = document.createTextNode(node.textContent.slice(idx + text.length))
      node.parentNode.insertBefore(before, node)
      node.parentNode.insertBefore(span, node)
      node.parentNode.insertBefore(after, node)
      node.parentNode.removeChild(node)
    }
  })
}
