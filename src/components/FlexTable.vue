<template>
  <div>
    <q-table
        flat
        bordered
        :rows="rows"
        :columns="columns"
        :rows-per-page-options="[30, 50, 100, 500]"
        row-key="key"
        class="i18n-table"
        :visible-columns="visibleColumns"
    >
      <template #top>
        <span class="i18n-table__title">{{ $t('title') }}</span>
        <q-space/>
        <file-uploader v-model:uploaded-files="uploadedFiles"/>
        <file-download :rows="rows"/>
        <q-space/>
        <q-select
            v-model="visibleColumns"
            color="accent"
            multiple
            outlined
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="toggleColumns"
            option-value="name"
            options-cover
            style="min-width: 150px"
        />
      </template>

      <template #header-cell="props">
        <q-th :props="props">
          {{ props.col.label }}
        </q-th>
      </template>

      <template #header-cell-buttons="props">
        <q-th :props="props">
          <q-btn
              flat
              round
              color="white"
              icon="add"
              @click="showAddColumnDialog = true"
          >
            <q-tooltip>
              {{ $t('tooltips.addLanguage') }}
            </q-tooltip>
          </q-btn>
        </q-th>
      </template>

      <template #bottom="scope">
        <q-btn
            flat
            color="accent"
            icon="add"
            @click="showAddRowDialog = true"
        >
          {{ $t('addTranslation') }}
        </q-btn>
        <q-space/>
        <div class="row">
          <q-btn
              v-if="scope.pagesNumber > 2"
              icon="first_page"
              color="accent"
              round
              dense
              flat
              :disable="scope.isFirstPage"
              @click="scope.firstPage"
          />

          <q-btn
              icon="chevron_left"
              color="accent"
              round
              dense
              flat
              :disable="scope.isFirstPage"
              @click="scope.prevPage"
          />

          <q-btn
              icon="chevron_right"
              color="accent"
              round
              dense
              flat
              :disable="scope.isLastPage"
              @click="scope.nextPage"
          />

          <q-btn
              v-if="scope.pagesNumber > 2"
              icon="last_page"
              color="accent"
              round
              dense
              flat
              :disable="scope.isLastPage"
              @click="scope.lastPage"
          />
        </div>
      </template>

      <template #no-data>
        <q-btn
            flat
            color="accent"
            icon="add"
            @click="showAddRowDialog = true"
        >
          {{ $t('addTranslation') }}
        </q-btn>
      </template>

      <template #body="props">
        <q-tr :props="props">
          <q-td :props="props" :key="'key'">
            <q-tooltip :delay="1000" :offset="[0, 10]">{{ props.row['key'] }}</q-tooltip>
            {{ props.row['key'] }}
          </q-td>
          <q-td :key="col.name" :props="props" v-for="col in i18nColumns">
            <div class="i18n-table__language_column">
              <q-tooltip :delay="1000" :offset="[0, 10]">{{ props.row[col.name] }}</q-tooltip>
              <span>{{ props.row[col.name] }}</span>
              <q-space/>
              <q-icon name="edit"/>
            </div>
            <q-popup-edit v-model="props.row[col.name]" v-slot="scope">
              <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
              />
            </q-popup-edit>
          </q-td>
          <q-td :props="props" :key="'buttons'">
            <q-btn
                flat
                round
                color="white"
                icon="remove"
                @click="removeRow(props.rowIndex)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <add-language v-model:show-dialog="showAddColumnDialog" @language="addNewLanguage"/>
    <add-row v-model:show-dialog="showAddRowDialog" @add-row="addNewRow"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {Uploaded} from 'components/Uploaded';
import AddLanguage from './AddLanguage.vue';
import AddRow from 'components/AddRow.vue';
import Column from 'src/types/Column';
import FileUploader from 'components/FileUploader.vue';
import {useQuasar} from 'quasar';
import {useI18n} from 'vue-i18n';
import Row from 'src/types/Row';
import FileDownload from 'components/FileDownload.vue';
import {filesToRows} from 'src/compositions/i18n-table';

const quasar = useQuasar();
const i18n = useI18n();

const emit = defineEmits(['update:uploadedFiles']);

const uploadedFiles = ref<Uploaded[]>([]);

watch(
    uploadedFiles,
    (newVal) => {
      if (newVal.length === 0) {
        return;
      }

      rows.value = filesToRows(newVal);

      resetColumns();
      newVal
      .map((x) => Object.keys(x)[0])
      .forEach(x => addColumn(x));

      emit('update:uploadedFiles', []);
    }
);

const showAddColumnDialog = ref(false);
const showAddRowDialog = ref(false);

const rows = ref<Row[]>([]);
const columns = ref<Column[]>([]);

const toggleColumns = computed(() => columns.value.filter(x => x.field !== 'key' && x.field !== 'buttons'));

const keyCol: Column = {
  name: 'key',
  label: 'Key',
  field: 'key',
  align: 'left',
  required: true,
  classes: 'i18n-table__key-column',
  headerClasses: 'i18n-table__key-column_header'
};
const buttonCol: Column = {
  name: 'buttons',
  label: '',
  field: 'buttons',
  required: true,
  align: 'right',
  classes: 'i18n-table__button-column',
  headerClasses: 'i18n-table__button-column_header'
};

const i18nColumns = computed(() =>
    columns.value?.filter((x) => x.field !== 'key' && x.field !== 'buttons')
);

const visibleColumns = ref(['key', 'buttons']);

function addNewLanguage(language: string) {
  if (language === '') return;
  addColumn(language);
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

function resetColumns() {
  columns.value = [
    keyCol,
    buttonCol,
  ];
}

function addColumn(language: string, addClass?: string, addHeaderClass?: string) {
  const length = columns.value.length - 1;

  const find = columns.value.find(x => x.field === language);
  if (find) {
    quasar.notify({
      type: 'warning',
      timeout: 1000,
      progress: true,
      message: i18n.t('warnings.language')
    });
    return;
  }

  columns.value = [
    ...columns.value.splice(0, length),
    {
      name: language,
      label: language,
      field: language,
      align: 'left',
      classes: `i18n-table__column ${addClass}`,
      headerClasses: `i18n-table__column_header ${addHeaderClass}`
    },
    ...columns.value,
  ];

  visibleColumns.value.push(language);
}

function addNewRow(r: string) {
  if (r === '') return;

  const find = rows.value.find(x => x.key === r);
  if (find) {
    quasar.notify({
      type: 'warning',
      timeout: 1000,
      progress: true,
      message: i18n.t('warnings.key')
    });
    return;
  }

  rows.value.push({
    key: r
  });
}

onMounted(() => {
  resetColumns();
  addColumn('en');
});
</script>

<style scoped lang="sass">
.i18n-table
  max-height: calc(100vh - 50px)

  thead tr th
    position: sticky
    z-index: 1
    background-color: var(--q-dark-page)

  thead tr:first-child th
    top: 0

  tbody tr:nth-child(odd) td
    background-color: var(--q-primary)

  tbody tr:nth-child(even) td
    background-color: var(--q-secondary)

  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */

  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px

  &__title
    font-size: 24px

  &__column
    overflow: hidden
    text-overflow: ellipsis
    min-width: 140px
    max-width: 300px

  &__column_header
    overflow: hidden
    text-overflow: ellipsis
    min-width: 140px
    max-width: 300px

  &__button-column
    width: 40px !important

  &__button-column_header
    width: 40px !important

  &__key-column
    overflow: hidden
    text-overflow: ellipsis
    width: 80px !important
    max-width: 250px !important

  &__key-column_header
    overflow: hidden
    text-overflow: ellipsis
    width: 80px !important
    max-width: 250px !important

  &__language_column
    display: flex
    flex-wrap: nowrap

    span
      overflow: hidden
      text-overflow: ellipsis

</style>
