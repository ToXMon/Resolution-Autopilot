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
    console.log('\nUsage: bun run index.ts "your message here"')
    console.log('\nExample messages:')
    console.log('  • "Am I at risk of quitting my gym resolution?"')
    console.log('  • "I missed my workout today. What should I do?"')
    console.log('  • "Just got home exhausted. Should I still go to the gym?"')
    process.exit(1)
  }

  try {
    // Run the agent
    await runAgent(userMessage)

    console.log('\n✅ Agent session completed\n')

  } catch (error: any) {
    logError(error)
    process.exit(1)
  }
}

main()
