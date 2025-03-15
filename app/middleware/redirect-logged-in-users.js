export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // console.log('user', user.value)

  if (user.value) {
    return navigateTo('/start')
  }
})
