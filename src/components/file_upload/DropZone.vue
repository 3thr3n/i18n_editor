<template>
  <div :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive" @dragleave.prevent="setInactive" @drop.prevent="onDrop">
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue';

const emit = defineEmits(['files-dropped']);
const events = ['dragenter', 'dragover', 'dragleave', 'drop']

const active = ref(false)

function setActive() {
  active.value = true
}
function setInactive() {
  active.value = false
}

function onDrop(e: any) {
  setInactive()
  emit('files-dropped', [...e.dataTransfer.files])
}

function preventDefaults(e: any) {
  e.preventDefault()
}

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>