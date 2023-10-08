<template>
  <drop-zone class="drop-area" @files-dropped="onFilesAdded" #default="{ dropZoneActive }">
    <label for="file-input">
      <span v-if="dropZoneActive">
        <span>{{ $t('dragAndDrop.dropHere') }}</span>
      </span>
      <span v-else>
        <span>{{ $t('dragAndDrop.dragHere') }}</span>
      </span>
    </label>
    <input type="file" id="file-input" multiple @change="onInputChange"/>
  </drop-zone>
</template>

<script setup lang="ts">
import type {I18nObject, Uploaded} from './Uploaded';
import {computed, PropType, ref} from 'vue';
import DropZone from 'components/file_upload/DropZone.vue';

const emit = defineEmits(['update:uploadedFiles']);
const props = defineProps({
  uploadedFiles: {
    required: true,
    type: Array as PropType<Uploaded[]>,
  },
});

const files = ref<FileList | null>(null);

const pip = computed({
  get() {
    return props.uploadedFiles;
  },
  set(value) {
    emit('update:uploadedFiles', value);
  },
});

function onInputChange(e: any) {
  onFilesAdded(e.target.files);
  e.target.value = '';
}

function onFilesAdded(fileArr: FileList | null) {
  if (!fileArr || fileArr.length === 0) return;

  const list: Promise<Uploaded>[] = [];

  Array.from(fileArr).forEach((file) => {
    if (file.type === 'application/json') {
      list.push(
        file.text().then((str) => {
          return {[file.name.split('.')[0]]: setupJson(str)};
        })
      );
    }
  });

  Promise.all(list).then((strArr) => {
    pip.value = strArr;
    files.value = null;
  });
}

function setupJson(str: string): I18nObject {
  const json = JSON.parse(str);
  const obj: I18nObject = {};
  iterateOverJson(json, '', obj);
  return obj;
}

function iterateOverJson(
  keys: any,
  currentKey: string,
  currentObj: I18nObject
) {
  for (const key in keys) {
    const value = keys[key];
    const newCurrentKey = currentKey === '' ? key : `${currentKey}.${key}`;

    if (typeof value === 'string') {
      currentObj[newCurrentKey] = value;
    } else {
      iterateOverJson(value, newCurrentKey, currentObj);
    }
  }
}
</script>

<style lang="scss">
.drop-area {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

  label {
    height: 70px;
    width: 170px;
    display: grid;
    margin-left: 8px;
    margin-right: 8px;
    align-content: center;
    justify-content: center;
    cursor: pointer;
  }

  input {
    position: absolute !important;
    height: 1px !important;
    width: 1px !important;
    padding: 0 !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    z-index: -1;
  }
}
</style>