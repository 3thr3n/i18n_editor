<template>
  <q-dialog v-if="show" v-model="show" persistent @keydown="onEnter">
    <q-card>
      <q-card-section class="row items-center">
        <q-select
            ref="languageRef"
            color="accent"
            class="add-language__select"
            v-model="language"
            :options="languages"
            :label="$t('language')"
            use-input
            hide-dropdown-icon
            input-debounce="5"
            @filter="filterLanguageFn"
            @keydown="onEnterLanguage"
        />
        <q-select
            ref="countryRef"
            color="accent"
            class="add-language__select"
            v-model="country"
            :disable="!countryEnabled"
            :options="countries"
            :label="$t('country')"
            use-input
            hide-dropdown-icon
            input-debounce="5"
            @filter="filterCountryFn"
            @keydown="onEnterCountry"
        />
        <q-space/>
        <q-btn icon="add" @click="addLanguage" flat round dense/>
        <q-btn icon="close" @click="closeDialog" flat round dense/>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {getCountryCodes, getLanguageCodes} from '@ladjs/country-language'
import {computed, ref, watch} from 'vue';
import {QSelect} from 'quasar';

const emit = defineEmits(['update:show-dialog', 'language']);

const props = defineProps({
  showDialog: {
    required: true,
    type: Boolean,
  },
});

const countryEnabled = ref(false);

const language = ref<string | null>(null);
const country = ref<string | null>(null);

const languageRef = ref<QSelect | undefined>();
const countryRef = ref<QSelect | undefined>();

const allLanguages: string[] = getLanguageCodes().sort();
const languages = ref(allLanguages);

const allCountries: string[] = getCountryCodes().sort();
const countries = ref(allCountries);

watch(language, (newVal) => {
  if (newVal) {
    countryEnabled.value = true;
    country.value = null;
  }
})

function filterLanguageFn(val: string, update: (_: any) => void) {
  if (val === '') {
    update(() => {
      languages.value = allLanguages.slice(0, 10)
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    languages.value = allLanguages.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

function onEnterLanguage(event: any) {
  if (event.key === 'Enter') {
    language.value = languages.value[0]
    countryRef.value?.focus();
    return
  }
  if (event.key === 'Escape') {
    language.value = null;
  }
}

function filterCountryFn(val: string, update: (_: any) => void) {
  if (val === '') {
    update(() => {
      countries.value = allCountries.slice(0, 10)
    })
    return;
  }

  update(() => {
    const needle = val.toLowerCase()
    countries.value = allCountries.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

function onEnterCountry(event: any) {
  if (event.key === 'Enter') {
    country.value = countries.value[0];
    addLanguage();
    return;
  }
  if (event.key === 'Escape') {
    country.value = null;
  }
}

function addLanguage() {
  if (!language.value) return;

  const combLangCoun = `${language.value}${country.value ? '-' + country.value : ''}`

  emit('language', combLangCoun);
  closeDialog();
}

const show = computed<boolean>({
  get() {
    return props.showDialog;
  },
  set(value) {
    emit('update:show-dialog', value);
  },
});

function reset() {
  language.value = null;
  country.value = null;
  countryEnabled.value = false;
}

function closeDialog() {
  emit('update:show-dialog', false);
  reset();
}

function onEnter(event: any) {
  if (event.key === 'Escape') {
    closeDialog();
  }
}
</script>

<style lang="scss" scoped>
.add-language {
  &__select {
    min-width: 80px;
    max-width: 100px;
  }
}
</style>
