import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { onSnapshot, orderBy, limit } from 'firebase/firestore'
import { useUser } from '@/context/AuthContext'
import { useHeists } from '@/hooks/useHeists'

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ withConverter: vi.fn(() => 'ref') })),
  query: vi.fn((_ref, ...constraints) => ({ constraints })),
  where: vi.fn((field, op, val) => ({ type: 'where', field, op, val })),
  orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
  limit: vi.fn((n) => ({ type: 'limit', n })),
  onSnapshot: vi.fn(),
  Timestamp: { fromDate: vi.fn((d: Date) => d) },
}))
vi.mock('@/context/AuthContext', () => ({ useUser: vi.fn() }))
vi.mock('@/types/firestore/heist', () => ({
  heistConverter: {},
  COLLECTIONS: { HEISTS: 'heists' },
}))

const mockUseUser = vi.mocked(useUser)
const mockOnSnapshot = vi.mocked(onSnapshot)
const mockOrderBy = vi.mocked(orderBy)
const mockLimit = vi.mocked(limit)

const mockUser = { uid: 'user-123' }
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
  vi.useFakeTimers()
  mockUseUser.mockReturnValue({ user: mockUser as never, loading: false })
})

afterEach(() => {
  vi.runAllTimers()
  vi.useRealTimers()
})

describe('useHeists', () => {
  it('returns loading: true and empty array before the subscription timer fires', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn())

    const { result } = renderHook(() => useHeists('active'))
    // deliberately do not advance timers

    expect(result.current.loading).toBe(true)
    expect(result.current.heists).toEqual([])
    expect(result.current.error).toBeNull()
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('returns heists and loading: false once onSnapshot emits a snapshot', () => {
    mockOnSnapshot.mockImplementation((_q, onNext: any) => {
      onNext({ docs: [{ data: () => mockHeist }] })
      return vi.fn()
    })

    const { result } = renderHook(() => useHeists('active'))

    act(() => { vi.runAllTimers() })

    expect(result.current.loading).toBe(false)
    expect(result.current.heists).toEqual([mockHeist])
    expect(result.current.error).toBeNull()
  })

  it('returns error state and loading: false when onSnapshot emits an error', () => {
    mockOnSnapshot.mockImplementation((_q, _onNext: any, onError: any) => {
      onError(new Error('Firestore error'))
      return vi.fn()
    })

    const { result } = renderHook(() => useHeists('active'))

    act(() => { vi.runAllTimers() })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Firestore error')
  })

  it('returns error state and empty array in active mode with no authenticated user', () => {
    mockUseUser.mockReturnValue({ user: null, loading: false })

    const { result } = renderHook(() => useHeists('active'))

    act(() => { vi.runAllTimers() })

    expect(result.current.loading).toBe(false)
    expect(result.current.heists).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('returns error state and empty array in assigned mode with no authenticated user', () => {
    mockUseUser.mockReturnValue({ user: null, loading: false })

    const { result } = renderHook(() => useHeists('assigned'))

    act(() => { vi.runAllTimers() })

    expect(result.current.loading).toBe(false)
    expect(result.current.heists).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('remains in loading state while auth is still resolving', () => {
    mockUseUser.mockReturnValue({ user: null, loading: true })

    const { result } = renderHook(() => useHeists('active'))

    act(() => { vi.runAllTimers() })

    expect(result.current.loading).toBe(true)
    expect(result.current.heists).toEqual([])
    expect(result.current.error).toBeNull()
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('calls orderBy deadline desc and limit 50 in expired mode', () => {
    mockOnSnapshot.mockImplementation((_q, onNext: any) => {
      onNext({ docs: [] })
      return vi.fn()
    })

    renderHook(() => useHeists('expired'))

    act(() => { vi.runAllTimers() })

    expect(mockOrderBy).toHaveBeenCalledWith('deadline', 'desc')
    expect(mockLimit).toHaveBeenCalledWith(50)
  })

  it('calls the unsubscribe function when the component unmounts after subscription is created', () => {
    const mockUnsubscribe = vi.fn()
    mockOnSnapshot.mockImplementation((_q, onNext: any) => {
      onNext({ docs: [] })
      return mockUnsubscribe
    })

    const { unmount } = renderHook(() => useHeists('active'))

    act(() => { vi.runAllTimers() })
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('cancels the timer without calling onSnapshot when unmounted before it fires', () => {
    const { unmount } = renderHook(() => useHeists('active'))
    unmount()
    vi.runAllTimers()

    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('re-subscribes when mode changes between renders', () => {
    mockOnSnapshot.mockImplementation((_q, onNext: any) => {
      onNext({ docs: [] })
      return vi.fn()
    })

    const { rerender } = renderHook(({ mode }: { mode: 'active' | 'assigned' | 'expired' }) => useHeists(mode), {
      initialProps: { mode: 'active' },
    })

    act(() => { vi.runAllTimers() })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    rerender({ mode: 'assigned' })
    act(() => { vi.runAllTimers() })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
  })
})
