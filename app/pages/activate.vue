<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const router = useRouter()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    state.value = 'error'
    errorMessage.value = 'No activation token provided.'
    return
  }
  try {
    const { $api } = useNuxtApp()
    await ($api as ReturnType<typeof $fetch.create>)('/api/auth/activate', {
      method: 'POST',
      body: { token },
    })
    state.value = 'success'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err: unknown) {
    state.value = 'error'
    errorMessage.value =
      (err as { data?: { message?: string } })?.data?.message ??
      'Activation failed. The link may be expired or invalid.'
  }
})
</script>

<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
      <h1 class="text-2xl font-bold text-slate-800">
        <span class="text-teal-500">TX</span>Hub
      </h1>

      <!-- Loading -->
      <template v-if="state === 'loading'">
        <svg class="animate-spin h-8 w-8 text-teal-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p class="text-slate-600">Activating your account…</p>
      </template>

      <!-- Success -->
      <template v-else-if="state === 'success'">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-800">Account activated!</h2>
        <p class="text-sm text-slate-500">Redirecting to login…</p>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-800">Activation failed</h2>
        <p class="text-sm text-red-500">{{ errorMessage }}</p>
        <NuxtLink to="/login" class="text-teal-600 hover:underline text-sm">Back to login</NuxtLink>
      </template>
    </div>
  </div>
</template>
