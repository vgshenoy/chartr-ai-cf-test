export function formatChatReference(reference) {
  let content = `
    ::mdc-chat-reference
    ---
    chart-id: ${reference.chartId}
    title: ${reference.title}
  `

  if (reference.text) {
    content += `
    text: ${reference.text}
    `
  }

  content += `
    ---
    ::
  `

  return content
}
