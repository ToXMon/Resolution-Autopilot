import type { ToolDefinition, ToolFn } from '../types.js'

export const fetchSmartContractToolDefinition: ToolDefinition = {
  name: 'fetch_smart_contract',
  description: 'Check user\'s smart contract status including stake amount, milestones, and current earnings on the blockchain.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to fetch smart contract for',
      },
    },
    required: ['user_id'],
  },
}

export interface FetchSmartContractInput {
  user_id: string
}

interface SmartContractStatus {
  user_id: string
  contract_address: string
  stake_amount: string
  stake_currency: string
  status: 'active' | 'completed' | 'forfeited'
  milestones: Array<{
    id: number
    target_date: string
    description: string
    completed: boolean
    verified_at?: string
  }>
  current_earnings: string
  bonus_percentage: number
  charity_address?: string
}

export const fetchSmartContract: ToolFn<FetchSmartContractInput, string> = async (input) => {
  const { user_id } = input

  // For MVP: Return mock blockchain data
  // TODO: Later integrate with ethers.js to read from Base testnet

  const mockContractAddress = `0x${Math.random().toString(16).substring(2, 42)}`
  
  const today = new Date()
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)

  const result: SmartContractStatus = {
    user_id,
    contract_address: mockContractAddress,
    stake_amount: '100',
    stake_currency: 'USDC',
    status: 'active',
    milestones: [
      {
        id: 1,
        target_date: new Date(twoWeeksAgo.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Week 1-2: Complete 8 workouts',
        completed: true,
        verified_at: new Date(twoWeeksAgo.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        target_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Week 3-4: Complete 8 workouts',
        completed: false,
      },
      {
        id: 3,
        target_date: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Week 5-6: Complete 8 workouts',
        completed: false,
      },
      {
        id: 4,
        target_date: new Date(today.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Week 7-8: Complete 8 workouts',
        completed: false,
      },
    ],
    current_earnings: '12.50',
    bonus_percentage: 10,
    charity_address: '0x0000000000000000000000000000000000000000',
  }

  return JSON.stringify(result, null, 2)
}
