import { parsePartialJson } from '@ai-sdk/ui-utils'

const CHART_TAG_OPEN = '<chartrAiArtifact>'
const CHART_TAG_CLOSE = '</chartrAiArtifact>'

function parseTextToSegments(text) {
  const segments = []
  let currentPosition = 0

  // Find all complete tag pairs in the text
  while (currentPosition < text.length) {
    // Look for the next complete opening tag
    const openTagPos = text.indexOf(CHART_TAG_OPEN, currentPosition)

    // If no opening tag is found, or it's the last thing in the text (potentially incomplete)
    if (openTagPos === -1 || openTagPos + CHART_TAG_OPEN.length >= text.length) {
      // Add all remaining text as markdown
      const remainingText = text.slice(currentPosition)
      const trimmedRemainingText = remainingText.trim()
      if (trimmedRemainingText && !CHART_TAG_OPEN.startsWith(trimmedRemainingText)) {
        segments.push({
          type: 'markdown',
          content: trimmedRemainingText,
        })
      }
      break
    }

    // Add text before the opening tag as markdown
    if (openTagPos > currentPosition) {
      const markdownContent = text.slice(currentPosition, openTagPos)
      if (markdownContent.trim()) {
        segments.push({
          type: 'markdown',
          content: markdownContent,
        })
      }
    }

    // Look for the matching closing tag
    const contentStart = openTagPos + CHART_TAG_OPEN.length
    const closeTagPos = text.indexOf(CHART_TAG_CLOSE, contentStart)

    // If no closing tag is found, or it's the last thing in the text (potentially incomplete)
    if (closeTagPos === -1) {
      // Extract the partial artifact content from after the opening tag to the end
      const partialArtifactContent = text.slice(contentStart)

      // Add as artifact with partial content
      segments.push({
        type: 'artifact',
        content: partialArtifactContent,
        isStreaming: true, // Mark as streaming since it's incomplete
      })

      // Move position to end of text
      currentPosition = text.length
      break
    }

    // Extract the artifact content
    const artifactContent = text.slice(contentStart, closeTagPos)

    // Add as artifact
    segments.push({
      type: 'artifact',
      content: artifactContent,
      isStreaming: false,
    })

    // Move position past the closing tag
    currentPosition = closeTagPos + CHART_TAG_CLOSE.length
  }

  return segments.map((segment) => {
    if (segment.type === 'artifact') {
      try {
        let cleanContent = segment.content
          .replace(/```json/g, '')
          .replace(/```/g, '')

        const { value } = parsePartialJson(cleanContent)

        if (!value) {
          return {
            type: 'markdown',
            content: `
            ::mdc-error
            #description
            Something went wrong with rendering the chart.
            ::
            `,
          }
        }

        // if value?.chartId ends in v followed by numbers, then it is a valid chartId
        if (value?.chartId?.match(/v\d+$/)) {
          return { ...segment, content: value }
        }
        else {
          return { ...segment, content: null } // will be filtered out
        }
      }
      catch (error) {
        console.error('Error parsing chart data:', error.message)
        return { ...segment, content: segment.content }
      }
    }
    return {
      ...segment,
      // strip out newlines at the start and end of the content
      content: segment.content.replace(/^\n+|\n+$/g, ''),
    }
  })
    .filter(segment => segment.content)
}

export function useMessageParser({
  messages, // maybe ref
}) {
  const messagesRef = toRef(messages)

  const parsedMessages = computed(() => messagesRef.value.map(message => ({
    ...message,
    parts: message.parts.map(part => ({
      ...part,
      segments: message.role === 'assistant' && part.type === 'text' ? parseTextToSegments(part.text) : null,
    })),
  })))

  return {
    parsedMessages,
  }
}

export function formatParsedMessages(parsedMessages) {
  return parsedMessages.map((message) => {
    if (message.role !== 'assistant') return message

    const formattedMessage = {
      ...message,
      parts: message.parts.map((part) => {
        if (part.type !== 'text') return part

        return {
          ...part,
          text: formatSegmentsToContent(part.segments),
        }
      }),
    }

    // Calculate content as the sum of all text parts
    formattedMessage.content = formattedMessage.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join('\n\n')

    return formattedMessage
  })
}

function formatSegmentsToContent(segments) {
  // need to also enclose in CHART_TAG_OPEN and CHART_TAG_CLOSE
  return segments.map(segment => segment.type === 'artifact' ? formatChartDataToText(segment.content) : segment.content).join('\n\n')
}

export function formatChartDataToText(chartData) {
  // enclose in CHART_TAG_OPEN and CHART_TAG_CLOSE
  return CHART_TAG_OPEN + JSON.stringify(chartData) + CHART_TAG_CLOSE
}
