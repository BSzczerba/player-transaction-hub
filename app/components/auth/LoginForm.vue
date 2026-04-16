<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const schema = toTypedSchema(
  z.object({
    emailOrUsername: z.string().min(1, 'Required'),
    password: z.string().min(1, 'Required'),
  })
)

const { handleSubmit, isSubmitting, setErrors } = useForm({ validationSchema: schema })
const { value: emailOrUsername, errorMessage: emailError } = useField<string>('emailOrUsername')
const { value: password, errorMessage: passwordError } = useField<string>('password')

const auth = useAuthStore()
const globalError = ref('')

const onSubmit = handleSubmit(async (values) => {
  globalError.value = ''
  try {
    await auth.login(values)
    const redirectMap: Record<string, string> = {
      Player: '/dashboard/player',
      Operator: '/dashboard/operator',
      Administrator: '/dashboard/admin',
      ComplianceOfficer: '/compliance',
    }
    await navigateTo(redirectMap[auth.user?.role ?? ''] ?? '/dashboard/player')
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 401) {
      globalError.value = 'Invalid email/username or password.'
    } else if (status === 429) {
      globalError.value = 'Too many attempts. Please wait a moment.'
    } else {
      globalError.value = 'Login failed. Please try again.'
    }
  }
})
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-1.5">
      <Label for="emailOrUsername">Email or Username</Label>
      <Input
        id="emailOrUsername"
        v-model="emailOrUsername"
        type="text"
        autocomplete="username"
        placeholder="you@example.com"
        :class="{ 'border-red-400': emailError }"
      />
      <p v-if="emailError" class="text-xs text-red-500">{{ emailError }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="password">Password</Label>
      <Input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        :class="{ 'border-red-400': passwordError }"
      />
      <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>
    </div>

    <p v-if="globalError" class="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {{ globalError }}
    </p>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      <span v-if="isSubmitting" class="flex items-center gap-2">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Signing in…
      </span>
      <span v-else>Sign in</span>
    </Button>
  </form>
</template>
