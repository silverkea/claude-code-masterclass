import { QueryDocumentSnapshot } from 'firebase/firestore'
import { heistConverter } from '@/types/firestore'

const mockTimestamp = (date: Date) => ({ toDate: () => date })

function makeSnapshot(data: Record<string, unknown>, id = 'heist-1') {
  return { id, data: () => data } as unknown as QueryDocumentSnapshot
}

const baseData = {
  title: 'The Big Score',
  description: 'Rob the vault',
  createdBy: 'uid-123',
  createdByCodename: 'SwiftFoxVault',
  assignedTo: 'uid-456',
  assignedToCodename: 'BoldRavenGhost',
  deadline: mockTimestamp(new Date('2026-04-07')),
  finalStatus: null,
  createdAt: mockTimestamp(new Date('2026-04-05')),
}

describe('heistConverter', () => {
  describe('fromFirestore', () => {
    it('returns createdAt as a Date instance', () => {
      const result = heistConverter.fromFirestore(makeSnapshot(baseData))
      expect(result.createdAt).toBeInstanceOf(Date)
    })

    it('returns deadline as a Date instance', () => {
      const result = heistConverter.fromFirestore(makeSnapshot(baseData))
      expect(result.deadline).toBeInstanceOf(Date)
    })

    it('maps id from snapshot.id, not from the document body', () => {
      const dataWithBodyId = { ...baseData, id: 'body-id' }
      const result = heistConverter.fromFirestore(makeSnapshot(dataWithBodyId, 'snapshot-id'))
      expect(result.id).toBe('snapshot-id')
    })

    it('does not throw when assignedTo and assignedToCodename are absent', () => {
      const { assignedTo: _a, assignedToCodename: _b, ...dataWithoutAssignee } = baseData
      expect(() => heistConverter.fromFirestore(makeSnapshot(dataWithoutAssignee))).not.toThrow()
    })

    it('defaults absent assignedTo to null', () => {
      const { assignedTo: _a, assignedToCodename: _b, ...dataWithoutAssignee } = baseData
      const result = heistConverter.fromFirestore(makeSnapshot(dataWithoutAssignee))
      expect(result.assignedTo).toBeNull()
    })

    it('defaults absent assignedToCodename to null', () => {
      const { assignedTo: _a, assignedToCodename: _b, ...dataWithoutAssignee } = baseData
      const result = heistConverter.fromFirestore(makeSnapshot(dataWithoutAssignee))
      expect(result.assignedToCodename).toBeNull()
    })
  })
})
