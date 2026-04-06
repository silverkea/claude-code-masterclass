import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/context/AuthContext'
import { Heist, heistConverter } from '@/types/firestore/heist'
import { COLLECTIONS } from '@/types/firestore'

export type HeistMode = 'active' | 'assigned' | 'expired'

export interface UseHeistsResult {
  heists: Heist[]
  loading: boolean
  error: Error | null
}

export function useHeists(mode: HeistMode): UseHeistsResult {
  const { user, loading: authLoading } = useUser()
  const [heists, setHeists] = useState<Heist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (authLoading) return

    let unsubscribe: (() => void) | undefined

    const timer = setTimeout(() => {
      if (mode !== 'expired' && !user) {
        setHeists([])
        setLoading(false)
        setError(new Error('User not authenticated'))
        return
      }

      setLoading(true)
      setError(null)

      const now = Timestamp.fromDate(new Date())
      const ref = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)

      const q =
        mode === 'active'
          ? query(ref, where('assignedTo', '==', user!.uid), where('deadline', '>', now))
          : mode === 'assigned'
            ? query(ref, where('createdBy', '==', user!.uid), where('deadline', '>', now))
            : query(ref, where('deadline', '<', now), orderBy('deadline', 'desc'), limit(50))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setHeists(snapshot.docs.map((doc) => doc.data() as Heist))
          setLoading(false)
        },
        (err) => {
          console.error(`[useHeists:${mode}]`, err)
          setError(err)
          setLoading(false)
        }
      )
    }, 0)

    return () => {
      clearTimeout(timer)
      unsubscribe?.()
    }
  }, [mode, authLoading, user?.uid])

  return { heists, loading, error }
}
