import { useState, useEffect, useCallback } from 'react'
import { getNotifications, NotificationItem } from '@/actions/notifications'

const STORAGE_KEY = 'courtops_notifications_read_timestamp'

export function useNotifications() {
       const [notifications, setNotifications] = useState<NotificationItem[]>([])
       const [loading, setLoading] = useState(true)
       const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0)

       // Fetch from server and sync with local storage
       const fetchNotifications = useCallback(async () => {
              try {
                     setLoading(true)
                     const data = await getNotifications()

                     // Get last read timestamp from local storage
                     const storedTimestamp = localStorage.getItem(STORAGE_KEY)
                     const timestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0
                     setLastReadTimestamp(timestamp)

                     // Mark notifications as read/unread based on timestamp
                     // We are comparing the notification.date (server time) with the local read timestamp.
                     // Ideally we trust the server generated date.
                     const processed = data.map(n => ({
                            ...n,
                            isRead: new Date(n.date).getTime() <= timestamp
                     }))

                     setNotifications(processed)
              } catch (error) {
                     console.error('Error fetching notifications:', error)
              } finally {
                     setLoading(false)
              }
       }, [])

       useEffect(() => {
              fetchNotifications()

              // Optional: Poll every minute
              const interval = setInterval(fetchNotifications, 60000)
              return () => clearInterval(interval)
       }, [fetchNotifications])

       const markAllAsRead = useCallback(() => {
              const now = Date.now()
              localStorage.setItem(STORAGE_KEY, now.toString())
              setLastReadTimestamp(now)

              setNotifications(prev => prev.map(n => ({
                     ...n,
                     isRead: true
              })))
       }, [])

       const unreadCount = notifications.filter(n => !n.isRead).length

       return {
              notifications,
              unreadCount,
              loading,
              markAllAsRead,
              refresh: fetchNotifications
       }
}
