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

const reduceRawJson = (key) => reduce((acc, row) => {
  const keyColumn = row[key];
  if (!keyColumn) {
    throw new Error('Invalid key column');
  }

  const otherColumns = Object.keys(row).filter((column) => column !== key);

  otherColumns.forEach((column) => {
    if (!acc[column]) {
      acc[column] = {};
    }

    acc[column][keyColumn] = row[column];
  });

  return acc;
}, {});

function convertCsvToRawJson(filePath, options = {}) {
  const { key, group, ...csvToJsonOptions } = options;
  const resolvedFilePath = path.resolve(process.cwd(), filePath);

  return fromPromise(
    csvToJson(csvToJsonOptions).fromFile(resolvedFilePath)
  ).pipe(
    switchMap(from),
    reduceRawJson(key),
    flatMapAsWritingContext(group),
  );
}

const filterValidFile = filter((file) => {
  if (path.extname(file) !== '.csv') {
    console.warn(chalk.magenta`Invalid:`, file);
    return false;
  }

  try {
    fs.accessSync(path.resolve(process.cwd(), file));
  } catch(error) {
    console.warn(chalk.magenta`Not exist:`, file);
    return false;
  }

  return true;
});

module.exports = function convertLocaleSheetsToJSON({ files, ignoreColumns, key, ...otherOptions }) {
  const isSingle = files.length === 1;

  return from(files).pipe(
    filterValidFile,
    flatMap((file) => convertCsvToRawJson(file, {
      key,
      group: isSingle ? '' : path.basename(file, '.csv'),
      ignoreColumns: ignoreColumns.length > 0 ? new RegExp(`(${ignoreColumns.join('|')})`, 'i') : undefined,
      ...otherOptions,
    })),
  )
}
