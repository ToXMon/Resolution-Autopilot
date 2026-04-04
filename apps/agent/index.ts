import 'dotenv/config'
import runAgent from './src/agent.js'
import { showWelcomeBanner, logError } from './src/ui.js'
import { initializeDemoData } from './src/memory.js'

const main = async () => {
  showWelcomeBanner()

  // Initialize demo data
  await initializeDemoData()

  // Get user message from command line args
  const userMessage = process.argv.slice(2).join(' ')

  if (!userMessage) {
    console.error('❌ Error: Please provide a message')
    process.exit(1)
  }

  try {
    // Run the agent
    await runAgent(userMessage)


  } catch (error: any) {
    logError(error)
    process.exit(1)
  }
}

main()
