import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { onSnapshot } from 'firebase/firestore'
import { useHeist } from '@/hooks/useHeist'

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ withConverter: vi.fn(() => 'ref') })),
  onSnapshot: vi.fn(),
}))
vi.mock('@/types/firestore/heist', () => ({
  heistConverter: {},
}))
vi.mock('@/types/firestore', () => ({
  COLLECTIONS: { HEISTS: 'heists' },
}))

const mockOnSnapshot = vi.mocked(onSnapshot)

const mockHeist = {
  id: 'heist-1',
  title: 'The Big Score',
  description: 'Rob the vault',
  createdBy: 'user-123',
  createdByCodename: 'SwiftFox',
  assignedTo: null,
  assignedToCodename: null,
  deadline: new Date('2099-01-01'),
  finalStatus: null,
  createdAt: new Date('2025-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useHeist', () => {
  it('returns loading: true, heist: null, notFound: false before subscription resolves', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useHeist('heist-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.heist).toBeNull()
    expect(result.current.notFound).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns heist and loading: false once snapshot emits with exists: true', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext: any) => {
      onNext({ exists: () => true, data: () => mockHeist, id: 'heist-1' })
      return vi.fn()
    })

    const { result } = renderHook(() => useHeist('heist-1'))

    expect(result.current.loading).toBe(false)
    expect(result.current.heist).toEqual(mockHeist)
    expect(result.current.notFound).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets notFound: true and loading: false when snapshot does not exist', () => {
    mockOnSnapshot.mockImplementation((_ref, onNext: any) => {
      onNext({ exists: () => false })
      return vi.fn()
    })

    const { result } = renderHook(() => useHeist('heist-1'))

    expect(result.current.loading).toBe(false)
    expect(result.current.notFound).toBe(true)
    expect(result.current.heist).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets error and loading: false when onSnapshot emits an error', () => {
    mockOnSnapshot.mockImplementation((_ref, _onNext: any, onError: any) => {
      onError(new Error('Firestore error'))
      return vi.fn()
    })

    const { result } = renderHook(() => useHeist('heist-1'))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Firestore error')
    expect(result.current.heist).toBeNull()
  })

  it('calls unsubscribe on unmount', () => {
    const mockUnsubscribe = vi.fn()
    mockOnSnapshot.mockImplementation((_ref, onNext: any) => {
      onNext({ exists: () => true, data: () => mockHeist, id: 'heist-1' })
      return mockUnsubscribe
    })

    const { unmount } = renderHook(() => useHeist('heist-1'))
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })
})
