// import { publicRoutes } from '@/shared/utils/routes'

const completeProfileRoute = '/complete-profile'

export default defineNuxtRouteMiddleware(async (to) => {
  // if public route, do nothing
  if (publicRoutes.includes(to.path)) {
    return
  }

  // if no user, do nothing
  const user = useSupabaseUser()
  if (!user.value) {
    return
  }

  const profile = useState('profile')

  // if no profile, fetch it and store in nuxt state
  if (!profile.value) {
    const { data: profileData } = await useFetch('/api/users/profile', {
      transform: (data) => {
        return {
          ...data,
          fullName: data.full_name,
        }
      },
    })
    profile.value = profileData.value
  }

  watch(user, async () => {
    if (!user.value) {
      profile.value = null
    }
  })

  // if to route is profile, no need to check
  if (to.path === completeProfileRoute) {
    return
  }

  if (!profile.value?.username || !profile.value?.fullName) {
    // store in cookie to redirect after login
    useCookie('check-profile-redirect-path').value = to.path
    return navigateTo(completeProfileRoute)
  }
})
