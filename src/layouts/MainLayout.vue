<template>
  <q-layout view="lHh Lpr lFf">
    <div class="q-pa-md">
      <flex-table />
    </div>
    <q-footer class="flex">
      <q-space />
      <a class="link" target="_blank" href="https://github.com/3thr3n">&copy;3thr3n</a>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import FlexTable from 'components/FlexTable.vue';

</script>

<style lang="scss" scoped>
.link {
  text-decoration: none; color: black
}
</style>