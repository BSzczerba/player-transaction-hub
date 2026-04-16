<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'

const auth = useAuthStore()
const notifications = useNotificationStore()
const router = useRouter()

const role = computed(() => auth.user?.role ?? '')

interface NavItem {
  label: string
  href: string
  badge?: boolean
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navByRole: Record<string, NavSection[]> = {
  Player: [
    {
      section: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/dashboard/player' },
        { label: 'Deposit', href: '/transactions/deposit' },
        { label: 'Withdraw', href: '/transactions/withdraw' },
        { label: 'My Transactions', href: '/transactions' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [
        { label: 'Profile', href: '/profile' },
        { label: 'Settings', href: '/settings' },
        { label: 'Notifications', href: '/notifications', badge: true },
      ],
    },
  ],
  Operator: [
    {
      section: 'OPERATIONS',
      items: [
        { label: 'Dashboard', href: '/dashboard/operator' },
        { label: 'Pending Transactions', href: '/operator/pending', badge: true },
        { label: 'Flagged Transactions', href: '/operator/flagged' },
        { label: 'All Transactions', href: '/transactions' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [{ label: 'Notifications', href: '/notifications', badge: true }],
    },
  ],
  ComplianceOfficer: [
    {
      section: 'COMPLIANCE',
      items: [
        { label: 'Dashboard', href: '/compliance' },
        { label: 'Flagged Transactions', href: '/operator/flagged' },
        { label: 'Player Risk Profiles', href: '/compliance/players' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [{ label: 'Notifications', href: '/notifications', badge: true }],
    },
  ],
  Administrator: [
    {
      section: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'All Transactions', href: '/transactions' },
      ],
    },
    {
      section: 'OPERATIONS',
      items: [
        { label: 'Pending Transactions', href: '/operator/pending', badge: true },
        { label: 'Flagged Transactions', href: '/operator/flagged' },
      ],
    },
    {
      section: 'MANAGEMENT',
      items: [
        { label: 'Players', href: '/admin/players' },
        { label: 'Reports', href: '/admin/reports' },
        { label: 'Audit Logs', href: '/admin/audit-logs' },
      ],
    },
    {
      section: 'ACCOUNT',
      items: [{ label: 'Notifications', href: '/notifications', badge: true }],
    },
  ],
}

const navSections = computed<NavSection[]>(() => navByRole[role.value] ?? [])

const route = useRoute()
const isActive = (href: string) => route.path === href || route.path.startsWith(href + '/')

const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.username?.[0]?.toUpperCase() || '?'
})

function logout() {
  auth.logout()
  router.push('/login')
}

// Notification polling
onMounted(() => {
  if (auth.token) notifications.fetchUnread()
  const interval = setInterval(() => {
    if (auth.token) notifications.fetchUnread()
  }, 30_000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <!-- Logo -->
      <div class="h-14 flex items-center px-5 border-b border-slate-100">
        <span class="font-bold text-slate-800 tracking-tight">
          <span class="text-teal-500">TX</span>Hub
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3">
        <template v-for="section in navSections" :key="section.section">
          <p class="text-[10px] tracking-widest text-slate-400 font-semibold uppercase px-2 mb-1 mt-4 first:mt-0">
            {{ section.section }}
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in section.items" :key="item.href">
              <NuxtLink
                :to="item.href"
                class="flex items-center justify-between px-2 py-2 rounded-md text-sm transition-colors"
                :class="isActive(item.href)
                  ? 'border-l-2 border-teal-500 bg-teal-50 text-teal-700 font-medium pl-[6px]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'"
              >
                <span>{{ item.label }}</span>
                <span
                  v-if="item.badge && notifications.unreadCount > 0"
                  class="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                >
                  {{ notifications.unreadCount }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </template>
      </nav>

      <!-- User footer -->
      <div class="p-3 border-t border-slate-100">
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-slate-50 transition-colors text-left">
            <Avatar class="h-7 w-7 text-xs">
              <AvatarFallback class="bg-teal-100 text-teal-700 text-xs font-semibold">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-800 truncate">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</p>
              <p class="text-[10px] text-slate-400 truncate">{{ auth.user?.role }}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-48">
            <DropdownMenuItem as-child>
              <NuxtLink to="/profile">Profile</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/settings">Settings</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-600 cursor-pointer" @click="logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="h-14 bg-[#0F1117] flex items-center justify-between px-6 shrink-0">
        <div class="text-slate-400 text-sm">
          Gaming Platform Operations
        </div>
        <div class="flex items-center gap-3">
          <!-- Bell icon -->
          <NuxtLink to="/notifications" class="relative text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="notifications.unreadCount > 0"
              class="absolute -top-1.5 -right-1.5 bg-teal-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            >
              {{ notifications.unreadCount > 9 ? '9+' : notifications.unreadCount }}
            </span>
          </NuxtLink>

          <!-- User info -->
          <span class="text-slate-300 text-sm">{{ auth.user?.email }}</span>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto bg-slate-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
