<!-- LOKASI FILE: src/components/Toast.vue -->
<script setup>
import { useToastStore } from '../stores/toast';
import { CheckCircle, AlertCircle, Info } from 'lucide-vue-next';

const toast = useToastStore();
</script>

<template>
  <transition name="toast-fade">
    <div 
      v-if="toast.show"
      class="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl border backdrop-blur-md"
      :class="{
        'bg-white/90 border-emerald-100 text-emerald-600': toast.type === 'success',
        'bg-white/90 border-rose-100 text-rose-500': toast.type === 'error',
        'bg-white/90 border-sky-100 text-sky-500': toast.type === 'info'
      }"
    >
      <CheckCircle v-if="toast.type === 'success'" :size="20" />
      <AlertCircle v-else-if="toast.type === 'error'" :size="20" />
      <Info v-else :size="20" />
      
      <span class="text-sm font-bold">{{ toast.message }}</span>
    </div>
  </transition>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>