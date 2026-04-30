self.addEventListener('push', event => {
	if (!event.data) return

	const payload = event.data.json()
	const title = payload.title || 'CourtOps'

	event.waitUntil(
		self.registration.showNotification(title, {
			body: payload.body || 'Tenés una novedad en tu club.',
			icon: payload.icon || '/icon-192.png',
			badge: payload.badge || '/icon-192.png',
			tag: payload.tag || 'courtops-event',
			data: {
				url: payload.url || '/dashboard',
				...payload.data
			}
		})
	)
})

self.addEventListener('notificationclick', event => {
	event.notification.close()

	const targetUrl = event.notification.data?.url || '/dashboard'

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
			for (const client of clientList) {
				if ('focus' in client) {
					client.navigate?.(targetUrl)
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
