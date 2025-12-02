<!-- LOKASI FILE: src/App.vue -->
<script setup>
import Navbar from './components/Navbar.vue';
import HomeView from './views/HomeView.vue';
import CartDrawer from './components/CartDrawer.vue';
</script>

<template>
  <div class="min-h-screen">
    <Navbar />
    <HomeView />
    <CartDrawer />
  </div>
</template>