<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { PlayerDto } from '~/types/api'

definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
  })
)

const { handleSubmit, resetForm } = useForm({ validationSchema: schema })
const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName')
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName')
const { value: phoneNumber } = useField<string>('phoneNumber')
const { value: dateOfBirth } = useField<string>('dateOfBirth')

// Prefill from auth store
watchEffect(() => {
  const u = auth.user
  if (u) {
    resetForm({
      values: {
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        phoneNumber: u.phoneNumber ?? '',
        dateOfBirth: u.dateOfBirth ?? '',
      },
    })
  }
})

const onSubmit = handleSubmit(async (values) => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    const { $api } = useNuxtApp()
    const updated = await ($api as ReturnType<typeof $fetch.create>)<PlayerDto>(
      '/api/players/me',
      { method: 'PUT', body: values }
    )
    auth.user = updated
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch {
    saveError.value = 'Failed to save profile. Please try again.'
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <div class="max-w-lg mx-auto space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Profile</h1>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <!-- Read-only info -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Email</span>
          <span class="font-medium text-slate-800">{{ auth.user?.email }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Username</span>
          <span class="font-medium text-slate-800">{{ auth.user?.username }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Role</span>
          <span class="font-medium text-slate-800">{{ auth.user?.role }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Status</span>
          <span class="font-medium text-slate-800">{{ auth.user?.status }}</span>
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- Editable form -->
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label for="firstName">First name</Label>
            <Input id="firstName" v-model="firstName" :class="{ 'border-red-400': firstNameError }" />
            <p v-if="firstNameError" class="text-xs text-red-500">{{ firstNameError }}</p>
          </div>
          <div class="space-y-1.5">
            <Label for="lastName">Last name</Label>
            <Input id="lastName" v-model="lastName" :class="{ 'border-red-400': lastNameError }" />
            <p v-if="lastNameError" class="text-xs text-red-500">{{ lastNameError }}</p>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="phoneNumber">Phone <span class="text-slate-400">(optional)</span></Label>
          <Input id="phoneNumber" v-model="phoneNumber" type="tel" placeholder="+1 555 000 0000" />
        </div>

        <div class="space-y-1.5">
          <Label for="dateOfBirth">Date of birth <span class="text-slate-400">(optional)</span></Label>
          <Input id="dateOfBirth" v-model="dateOfBirth" type="date" />
        </div>

        <p v-if="saveError" class="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {{ saveError }}
        </p>
        <p v-if="saveSuccess" class="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          Profile saved successfully.
        </p>

        <Button type="submit" :disabled="saving">
          <span v-if="saving" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving…
          </span>
          <span v-else>Save changes</span>
        </Button>
      </form>
    </div>
  </div>
</template>
