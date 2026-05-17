<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  name?: string
  rows?: number
}>(), {
  required: false,
  rows: 5,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="name" class="text-sm font-medium text-slate-300">
      {{ label }}
      <span v-if="required" class="text-electric-400 ml-0.5">*</span>
    </label>
    <textarea
      :id="name"
      :name="name"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :class="[
        'input-base resize-y',
        error ? 'border-red-500/60 focus:border-red-500' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-red-400 text-xs mt-0.5">{{ error }}</p>
  </div>
</template>
