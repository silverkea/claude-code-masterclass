import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Heist, heistConverter } from '@/types/firestore/heist'
import { COLLECTIONS } from '@/types/firestore'

export interface UseHeistResult {
  heist: Heist | null
  loading: boolean
  notFound: boolean
  error: Error | null
}

export function useHeist(id: string): UseHeistResult {
  const [heist, setHeist] = useState<Heist | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const ref = doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotFound(true)
          setHeist(null)
          setLoading(false)
        } else {
          setHeist(snapshot.data() as Heist)
          setNotFound(false)
          setLoading(false)
        }
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [id])

  return { heist, loading, notFound, error }
}
