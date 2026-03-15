import { useState, useEffect, useCallback } from 'react'
import { getNotifications, markAllAsRead as markAllAsReadAction, NotificationItem } from '@/actions/notifications'

export function useNotifications() {
       const [notifications, setNotifications] = useState<NotificationItem[]>([])
       const [loading, setLoading] = useState(true)

       const fetchNotifications = useCallback(async () => {
              try {
                     setLoading(true)
                     const data = await getNotifications()
                     setNotifications(data)
              } catch (error) {
                     console.error('Error fetching notifications:', error)
              } finally {
                     setLoading(false)
              }
       }, [])

       useEffect(() => {
              fetchNotifications()

              const interval = setInterval(fetchNotifications, 60000)
              return () => clearInterval(interval)
       }, [fetchNotifications])

       const markAllAsRead = useCallback(async () => {
              // Optimistic update
              setNotifications(prev => prev.map(n => ({
                     ...n,
                     isRead: true
              })))

              // Persist to database
              const result = await markAllAsReadAction()
              if (!result.success) {
                     // Revert on failure
                     await fetchNotifications()
              }
       }, [fetchNotifications])

       const unreadCount = notifications.filter(n => !n.isRead).length

       return {
              notifications,
              unreadCount,
              loading,
              markAllAsRead,
              refresh: fetchNotifications
       }
}
