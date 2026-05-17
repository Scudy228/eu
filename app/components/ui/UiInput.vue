<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  name?: string
  autocomplete?: string
}>(), {
  type: 'text',
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="name" class="text-sm font-medium text-slate-300">
      {{ label }}
      <span v-if="required" class="text-electric-400 ml-0.5">*</span>
    </label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :class="[
        'input-base',
        error ? 'border-red-500/60 focus:border-red-500' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <p v-if="error" class="text-red-400 text-xs mt-0.5">{{ error }}</p>
  </div>
</template>
