<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-300">Отзыв</label>

    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="5"
      placeholder="Поделитесь впечатлениями об этом месте..."
      class="w-full bg-[#0b0b0b] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition resize-none"
    />
  </div>
</template>