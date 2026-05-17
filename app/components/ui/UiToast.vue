<script setup lang="ts">
const { toasts, remove } = useToast()

const typeConfig = {
  success: { border: 'border-l-green-500', icon: '✓', bg: 'bg-green-500/10', text: 'text-green-400' },
  error:   { border: 'border-l-red-500',   icon: '✕', bg: 'bg-red-500/10',   text: 'text-red-400' },
  info:    { border: 'border-l-electric-500', icon: 'ℹ', bg: 'bg-electric-500/10', text: 'text-electric-400' },
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'glass rounded-xl border-l-4 p-4 flex items-start gap-3 shadow-card cursor-pointer',
            typeConfig[toast.type].border,
            typeConfig[toast.type].bg,
          ]"
          @click="remove(toast.id)"
        >
          <span :class="['text-lg font-bold flex-shrink-0', typeConfig[toast.type].text]">
            {{ typeConfig[toast.type].icon }}
          </span>
          <p class="text-sm text-slate-200 flex-1 leading-relaxed">{{ toast.message }}</p>
          <button class="text-slate-400 hover:text-white transition-colors flex-shrink-0" @click.stop="remove(toast.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
