export const usePagination = (fetchFn: (page: number) => Promise<void>) => {
  const page = ref(1)
  const pageSize = ref(20)

  const goTo = async (p: number) => {
    page.value = p
    await fetchFn(p)
  }

  const next = () => goTo(page.value + 1)
  const prev = () => goTo(page.value - 1)

  return { page, pageSize, goTo, next, prev }
}
