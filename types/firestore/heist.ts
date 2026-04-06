import { DocumentData, FieldValue, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore'

export interface Heist {
  id: string
  title: string
  description: string
  createdBy: string
  createdByCodename: string
  assignedTo: string | null
  assignedToCodename: string | null
  deadline: Date
  finalStatus: null | 'success' | 'failure'
  createdAt: Date
}

export type SettledHeist = Heist & { finalStatus: 'success' | 'failure' }

export interface CreateHeistInput {
  title: string
  description: string
  createdBy: string
  createdByCodename: string
  assignedTo?: string | null
  assignedToCodename?: string | null
  deadline: Timestamp
  finalStatus: null
  createdAt: FieldValue
}

export interface UpdateHeistInput {
  title?: string
  description?: string
  assignedTo?: string | null
  assignedToCodename?: string | null
  deadline?: Timestamp
  finalStatus?: null | 'success' | 'failure'
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      createdBy: data.createdBy,
      createdByCodename: data.createdByCodename,
      assignedTo: data.assignedTo ?? null,
      assignedToCodename: data.assignedToCodename ?? null,
      deadline: data.deadline?.toDate(),
      finalStatus: data.finalStatus,
      createdAt: data.createdAt?.toDate(),
    }
  },
}
