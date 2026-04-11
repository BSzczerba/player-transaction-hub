export const useUiStore = defineStore('ui', {
  state: () => ({
    isLoading: false,
    globalError: null as string | null,
    activeModal: null as string | null,
  }),
  actions: {
    clearError() {
      this.globalError = null
    },
    openModal(name: string) {
      this.activeModal = name
    },
    closeModal() {
      this.activeModal = null
    },
  },
})
