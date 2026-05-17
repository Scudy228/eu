<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
})

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const variantClasses = {
  primary: 'bg-electric-gradient text-white font-semibold hover:opacity-90 hover:-translate-y-0.5 shadow-glow-blue hover:shadow-glow-blue-lg',
  secondary: 'bg-electric-500/10 text-electric-400 border border-electric-500/40 font-semibold hover:bg-electric-500/20 hover:border-electric-400/60 hover:-translate-y-0.5',
  ghost: 'text-white/80 hover:text-white hover:bg-white/5 font-medium',
  outline: 'text-white border border-white/30 font-semibold hover:bg-white/10 hover:border-white/60 hover:-translate-y-0.5',
}

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300 cursor-pointer'

const classes = computed(() =>
  `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${(props.disabled || props.loading) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`
)
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled || loading" :class="classes">
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>
