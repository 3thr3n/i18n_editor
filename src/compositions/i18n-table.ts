import Row from 'src/types/Row';
import Json from 'src/types/Json';
import {Uploaded} from 'components/Uploaded';

export function filesToRows(files: Uploaded[]): Row[] {
  const listRows: Row[] = [];

  files.forEach((file) => {
    const keys = Object.keys(file);
    keys.forEach((i18n) => {
      const i18nKeys = Object.keys(file[i18n]);
      i18nKeys.forEach((x) => {
        const foundRow = listRows.find((p) => p.key === x);
        if (foundRow) {
          foundRow[i18n] = file[i18n][x];
        } else {
          listRows.push({key: x, [i18n]: file[i18n][x]});
        }
      });
    });
  });

  listRows.sort((a, b) => (a.key > b.key ? 1 : -1));

  return listRows;
}

export function rowsToJson(rows: Row[]): Map<string, Json> {
  const jsons: Map<string, Json> = new Map();

  rows.forEach(row => {
    const keys = Object.keys(row);

    let keySplitted: string[] = [];

    keys.forEach(languageKey => {
      if (languageKey === 'key') {
        keySplitted = row[languageKey].split("\.")
        return;
      }

      if (!jsons.has(languageKey)) {
        jsons.set(languageKey, {})
      }
      const json = jsons.get(languageKey);
      if (json) {
        buildJson(json, keySplitted, row[languageKey])
      }
    })
  })
  return jsons
}

function buildJson(json: Json, splitted: string[], value: string) {
  if (splitted.length === 0) return;

  const split = splitted[0];

  if (!json[split] && splitted.length > 1) {
    json[split] = {}
  }

  if (typeof json[split] !== 'object' && splitted.length === 1) {
      json[split] = value;
      return;
  }

  buildJson(<Json>json[split], splitted.slice(1, splitted.length), value);
}