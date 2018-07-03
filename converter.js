const chalk = require('chalk');
const csvToJson = require('csvtojson');
const path = require('path');
const fs = require('fs');
const { fromPromise } = require('rxjs/internal/observable/fromPromise');
const { from } = require('rxjs/internal/observable/from');
const { reduce, switchMap, finalize, flatMap, filter } = require('rxjs/operators');

const flatMapAsWritingContext = (group) => flatMap((converted) => from(
  Object.keys(converted)
    .map((locale) => ({
      locale,
      group,
      translation: converted[locale],
    })),
));

const reduceRawJson = reduce((acc, row) => {
  const { id, ...translations } = row;
  const locales = Object.keys(translations);

  locales.forEach((locale) => {
    if (!acc[locale]) {
      acc[locale] = {};
    }

    acc[locale][id] = translations[locale];
  });

  return acc;
}, {});

function convertCsvToRawJson(filePath, group = '', options = {}) {
  return fromPromise(
    csvToJson(options).fromFile(filePath)
  ).pipe(
    switchMap(from),
    reduceRawJson,
    flatMapAsWritingContext(group),
  );
}

const flatMapAsConvert$ = (isSingle, options) => flatMap((file) => {
  const group = isSingle ? '' : path.basename(file, '.csv');

  return convertCsvToRawJson(file, group, options)
});

const filterValidFile = filter((file) => {
  if (path.extname(file) !== '.csv') {
    console.log(chalk.magenta`Invalid:`, file);
    return false;
  }

  try {
    fs.accessSync(path.resolve(process.cwd(), file));
  } catch(error) {
    console.log(chalk.magenta`Not exist:`, file);
    return false;
  }

  return true;
});

module.exports = function convertLocaleSheetsToJSON({ files, separator, ignoreColumns }) {
  const isSingle = files.length === 1;

  return from(files).pipe(
    filterValidFile,
    flatMapAsConvert$(isSingle, {
      delimiter: separator,
      ignoreColumns: new RegExp(`(${ignoreColumns.join('|')})`, 'i'),
    }),
  )
}
