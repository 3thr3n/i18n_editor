<template>
  <q-dialog v-if="show" v-model="show" persistent @keydown="onEnter">
    <q-card>
      <q-card-section class="row items-center">
        <q-input
            ref="inputRef"
            v-model="row"
            clearable
            type="text"
            autofocus
            :rules="rules"
        />
        <q-space/>
        <q-btn icon="add" @click="addRow" flat round dense />
        <q-btn icon="close" @click="closeDialog" flat round dense />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {QInput, ValidationRule} from 'quasar';
import {useI18n} from 'vue-i18n';

const emit = defineEmits(['update:show-dialog', 'add-row']);

const props = defineProps({
  showDialog: {
    required: true,
    type: Boolean,
  },
});

const i18n = useI18n();

const row = ref('');

const inputRef = ref<QInput | undefined>();

const rules: ValidationRule[] = [
  val => !!val || i18n.t('validation.required'),
  val => !!val.match(/^([A-Za-z]+(?:[-_][A-Za-z]+)?)(\.[A-Za-z]+(?:[-_][A-Za-z]+)?)*$/g) || `${i18n.t('validation.key')}: (a-z - _ .)`
]

const show = computed<boolean>({
  get() {
    return props.showDialog;
  },
  set(value) {
    emit('update:show-dialog', value);
  },
});

function addRow() {
  if (!row.value) return;
  inputRef.value?.validate()
  if (inputRef.value?.hasError) {
    return;
  }

  emit('add-row', row.value.toLowerCase().trim());
  emit('update:show-dialog', false);

  row.value = '';
}

function closeDialog() {
  emit('update:show-dialog', false);
  row.value = '';
}

function onEnter(event: any) {
  if (event.key === 'Enter') {
    addRow();
    return
  }
  if (event.key === 'Escape') {
    closeDialog();
  }
}
</script>

<style scoped>

</style>
