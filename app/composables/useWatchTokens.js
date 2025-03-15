export function useWatchTokens() {
  const supabase = useSupabaseClient()
  const toast = useToast()

  onMounted(async () => {
    try {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      // Clear the hash from the URL immediately
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search)

      // Check for error in the hash
      const error = params.get('error')
      const errorCode = params.get('error_code')
      const errorDescription = params.get('error_description')

      if (error) {
        console.error('Error in useWatchTokens:', error, errorCode, errorDescription)
        throw new Error(decodeURIComponent(errorDescription || 'Unknown error'))
      }

      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError) {
          throw new Error(`Error setting session: ${sessionError.message}`)
        }

        console.log('Session set successfully')
        await navigateTo('/start')
      }
      else {
        console.warn('No tokens found in URL')
      }
    }
    catch (error) {
      console.error('Error in useWatchTokens:', error)
      toast.add({
        title: 'Authentication Failed',
        description: error.message,
        color: 'red',
      })
      await navigateTo('/login')
    }
  })
}
