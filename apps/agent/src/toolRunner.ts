import { tools } from './tools/index.js'

export const runTool = async (
  toolCall: any,
  userMessage: string
): Promise<string> => {
  const toolName = toolCall.function.name
  const toolArgs = JSON.parse(toolCall.function.arguments)

  console.log(`\n⚙️  Executing tool: ${toolName}`)
  console.log(`   Arguments: ${JSON.stringify(toolArgs, null, 2)}`)

  const startTime = Date.now()

  try {
    // Get the tool function
    const toolFn = tools[toolName as keyof typeof tools]

    if (!toolFn) {
      return JSON.stringify({
        error: `Unknown tool: ${toolName}`,
      })
    }

    // Execute the tool
    const result = await toolFn(toolArgs)
    const duration = Date.now() - startTime

    console.log(`   ✓ Completed in ${duration}ms`)

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`   ✗ Failed after ${duration}ms: ${error.message}`)

    return JSON.stringify({
      error: error.message,
      tool: toolName,
    })
  }
}
