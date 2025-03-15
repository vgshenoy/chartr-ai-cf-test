export function useRedirectOnUserLoggedIn() {
  const fullCookieName = 'sb-redirect-path'
  const redirectPath = useCookie(fullCookieName).value

  const user = useSupabaseUser()

  watch(user, () => {
    if (user.value) {
      // console.log('user login', user.value)
      useCookie(fullCookieName).value = null

      // Redirect to the decoded path or home if no path was stored
      return navigateTo(redirectPath || '/start')
    }
  }, { immediate: true })
}
