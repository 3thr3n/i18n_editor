<template>
  <div class="q-ml-lg">
    <q-btn
      @click="downloadFile"
      icon="download"
      round
      dense
      flat
      :loading="loading"
    >
      <q-tooltip>
        {{ $t('tooltips.download') }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import {PropType, ref} from 'vue';
import Row from 'src/types/Row';
import {rowsToJson} from 'src/compositions/i18n-table';
import Json from 'src/types/Json';
import JSZip from 'jszip';
import FileSaver from 'file-saver'

const props = defineProps({
  rows: {
    required: true,
    type: Array as PropType<Row[]>,
  }
});

const loading = ref(false);

function downloadFile() {
  loading.value = true;
  const jsons: Map<string, Json> = rowsToJson(props.rows)

  const zip = new JSZip();

  jsons.forEach((value, key) => {
    zip.file(`${key}.json`, JSON.stringify(value));
  })

  zip.generateAsync({ type: 'blob' }).then(function (content) {
    FileSaver.saveAs(content, 'i18n.zip');
  });

  loading.value = false;
}
</script>

<style lang="scss">

</style>