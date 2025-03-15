export function useNewChatOptions() {
  return useState('newChatOptions', () => ({
    q: '',
    chartId: '',
  }))
}
