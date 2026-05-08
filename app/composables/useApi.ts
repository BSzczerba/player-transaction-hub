export const useApi = (): typeof $fetch => {
  const { $api } = useNuxtApp()
  return $api as typeof $fetch
}
