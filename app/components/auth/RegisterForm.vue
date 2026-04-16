<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'At least 3 characters'),
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    dateOfBirth: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a digit')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirmPassword: z.string().min(1, 'Required'),
  }).refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
)

const { handleSubmit, isSubmitting } = useForm({ validationSchema: schema })
const f = <T>(name: string) => useField<T>(name)

const { value: email, errorMessage: emailError } = f<string>('email')
const { value: username, errorMessage: usernameError } = f<string>('username')
const { value: firstName, errorMessage: firstNameError } = f<string>('firstName')
const { value: lastName, errorMessage: lastNameError } = f<string>('lastName')
const { value: dateOfBirth } = f<string>('dateOfBirth')
const { value: phoneNumber } = f<string>('phoneNumber')
const { value: password, errorMessage: passwordError } = f<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = f<string>('confirmPassword')

const router = useRouter()
const globalError = ref('')

const onSubmit = handleSubmit(async (values) => {
  globalError.value = ''
  try {
    const { $api } = useNuxtApp()
    const data = await ($api as ReturnType<typeof $fetch.create>)<{ activationToken?: string }>(
      '/api/auth/register',
      { method: 'POST', body: values }
    )
    const token = data.activationToken
    await router.push(token ? `/activate?token=${token}` : '/login')
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 429) {
      globalError.value = 'Too many requests. Please wait a moment.'
    } else {
      const msg = (err as { data?: { message?: string } })?.data?.message
      globalError.value = msg ?? 'Registration failed. Please try again.'
    }
  }
})
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="firstName">First name</Label>
        <Input id="firstName" v-model="firstName" placeholder="Jane" :class="{ 'border-red-400': firstNameError }" />
        <p v-if="firstNameError" class="text-xs text-red-500">{{ firstNameError }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="lastName">Last name</Label>
        <Input id="lastName" v-model="lastName" placeholder="Doe" :class="{ 'border-red-400': lastNameError }" />
        <p v-if="lastNameError" class="text-xs text-red-500">{{ lastNameError }}</p>
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="email">Email</Label>
      <Input id="email" v-model="email" type="email" placeholder="you@example.com" :class="{ 'border-red-400': emailError }" />
      <p v-if="emailError" class="text-xs text-red-500">{{ emailError }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="username">Username</Label>
      <Input id="username" v-model="username" placeholder="janedoe" :class="{ 'border-red-400': usernameError }" />
      <p v-if="usernameError" class="text-xs text-red-500">{{ usernameError }}</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="dateOfBirth">Date of birth <span class="text-slate-400">(optional)</span></Label>
        <Input id="dateOfBirth" v-model="dateOfBirth" type="date" />
      </div>
      <div class="space-y-1.5">
        <Label for="phoneNumber">Phone <span class="text-slate-400">(optional)</span></Label>
        <Input id="phoneNumber" v-model="phoneNumber" type="tel" placeholder="+1 555 000 0000" />
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="password">Password</Label>
      <Input id="password" v-model="password" type="password" placeholder="••••••••" :class="{ 'border-red-400': passwordError }" />
      <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="confirmPassword">Confirm password</Label>
      <Input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="••••••••" :class="{ 'border-red-400': confirmPasswordError }" />
      <p v-if="confirmPasswordError" class="text-xs text-red-500">{{ confirmPasswordError }}</p>
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
        Creating account…
      </span>
      <span v-else>Create account</span>
    </Button>
  </form>
</template>
