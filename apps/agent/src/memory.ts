import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Database, 
  AIMessage, 
  MessageWithMetadata,
  UserProfile,
  Intervention 
} from './types.js'

const DB_FILE = './db.json'

// Initialize database
let db: Low<Database> | null = null

export const getDb = async (): Promise<Low<Database>> => {
  if (db) return db

  const adapter = new JSONFile<Database>(DB_FILE)
  db = new Low(adapter, {
    messages: [],
    userProfiles: [],
    interventions: [],
  })

  await db.read()
  await db.write()

  return db
}

// Message management
export const addMessages = async (...messages: AIMessage[]): Promise<void> => {
  const database = await getDb()
  
  const messagesWithMetadata: MessageWithMetadata[] = messages.map(msg => ({
    ...msg,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }))

  database.data.messages.push(...messagesWithMetadata)
  await database.write()
}

export const getMessages = async (): Promise<AIMessage[]> => {
  const database = await getDb()
  
  // Strip metadata when returning messages
  return database.data.messages.map(({ id, createdAt, ...msg }) => msg)
}

export const clearMessages = async (): Promise<void> => {
  const database = await getDb()
  database.data.messages = []
  await database.write()
}

// Tool response management
export const saveToolResponse = async (
  toolCallId: string,
  result: string
): Promise<void> => {
  await addMessages({
    role: 'tool',
    content: result,
    toolCallId,
  })
}

// User profile management
export const getUserProfile = async (user_id: string): Promise<UserProfile | null> => {
  const database = await getDb()
  return database.data.userProfiles.find(p => p.user_id === user_id) || null
}

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const database = await getDb()
  
  const existingIndex = database.data.userProfiles.findIndex(
    p => p.user_id === profile.user_id
  )

  if (existingIndex >= 0) {
    database.data.userProfiles[existingIndex] = profile
  } else {
    database.data.userProfiles.push(profile)
  }

  await database.write()
}

// Intervention management
export const logIntervention = async (intervention: Intervention): Promise<void> => {
  const database = await getDb()
  database.data.interventions.push(intervention)
  await database.write()
}

export const getInterventions = async (user_id: string): Promise<Intervention[]> => {
  const database = await getDb()
  return database.data.interventions.filter(i => i.user_id === user_id)
}

export const updateInterventionOutcome = async (
  intervention_id: string,
  outcome: 'success' | 'skipped' | 'failed',
  feedback?: string
): Promise<void> => {
  const database = await getDb()
  
  const intervention = database.data.interventions.find(
    i => i.intervention_id === intervention_id
  )

  if (intervention) {
    intervention.outcome = outcome
    if (feedback) {
      intervention.user_feedback = feedback
    }
    await database.write()
  }
}

// Initialize with demo data
export const initializeDemoData = async (): Promise<void> => {
  const database = await getDb()

  // Check if already initialized
  if (database.data.userProfiles.length > 0) {
    return
  }

  // Add demo user profile
  const demoProfile: UserProfile = {
    user_id: 'demo_user_001',
    resolution: 'Gym 4x/week for 8 weeks',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    stake_amount: 100,
    intervention_preferences: {
      social: true,
      financial: true,
      calendar: true,
    },
    past_interventions: [
      {
        type: 'social',
        effectiveness: 0.73,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: 'calendar',
        effectiveness: 0.68,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }

  database.data.userProfiles.push(demoProfile)
  await database.write()

  console.log('✅ Demo data initialized')
}
