self.addEventListener('push', event => {
	if (!event.data) return

	const payload = event.data.json()
	const title = payload.title || payload.clubName || 'CourtOps'

	event.waitUntil(
		self.registration.showNotification(title, {
			body: payload.body || 'Tienes una novedad en tu club.',
			icon: payload.icon || '/icon-192.png',
			badge: payload.badge || '/icon-192.png',
			tag: payload.tag || 'courtops-event',
			actions: payload.actions || [],
			vibrate: payload.vibrate || [80, 40, 80],
			requireInteraction: Boolean(payload.requireInteraction),
			renotify: Boolean(payload.renotify),
			timestamp: payload.timestamp || Date.now(),
			data: {
				url: payload.url || '/dashboard',
				...payload.data
			}
		})
	)
})

self.addEventListener('notificationclick', event => {
	event.notification.close()

	if (event.action === 'close') {
		return
	}

	const actionUrls = event.notification.data?.actionUrls || {}
	const targetUrl = actionUrls[event.action] || event.notification.data?.url || '/dashboard'

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
			for (const client of clientList) {
				if ('focus' in client) {
					if (client.url !== targetUrl) {
						client.navigate?.(targetUrl)
					}
					return client.focus()
				}
			}

			if (self.clients.openWindow) {
				return self.clients.openWindow(targetUrl)
			}

			return undefined
		})
	)
})
