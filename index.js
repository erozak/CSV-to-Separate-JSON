const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

program
  .version('1.0.0')
  .option('-k, --key <n>', 'Key id')
  .option('-d, --destination <n>', 'Destination folder')
  .option('-s, --separator <n>', 'Column Separator')
  .option('-i, --ignoreColumns [value]', 'Ignore Columns')
  .parse(process.argv);

console.info(`\n${chalk.white`---[:`} Start converting locale sheets ${chalk.white`:]---`}`);
const eventTag = (tag) => chalk.bgBlue.rgb(0,0,0)(`\n ${tag} \n`);
const prettyArray = (arr) => chalk.white`\n  - ` + arr.join(chalk.white`\n  - `);

// Get Args
console.info(eventTag('Args'));

const files = Array.from(program.args);
console.info('Sheets:', files.length > 1 ? prettyArray(files) : files[0]);

const destination = program.destination || './dist';
console.info('Output:', destination);

const separator = program.separator || ',';
console.info('Separator:', separator);

const key = program.key || 'id';
console.info('Key:', key);

const ignoreColumns = program.ignoreColumns ? program.ignoreColumns.split(',') : [];
if (ignoreColumns.length > 0) {
  console.info('ignoreColumns:', ignoreColumns > 1 ? prettyArray(ignoreColumns) : ignoreColumns[0]);
}


// Convert
console.info(eventTag('Result'));

require('./converter')({
  key,
  files,
  destination,
  separator,
  ignoreColumns,
})
  .subscribe(
    ({ locale, group, translation }) => {
      const filePath = path.join(destination, group);

      mkdirp(filePath, (err) => {
        if (err) {
          console.error(`${chalk.red`Save Failed:`}`, error);
          return;
        }

        const fileName = `${locale}.json`
        const data = JSON.stringify(translation);
        const output = path.join(filePath, fileName);

        try {
          fs.writeFileSync(path.resolve(process.cwd(), output), data, {
            encoding: 'utf8',
            flag: 'a+',
          });
        } catch(error) {
          console.error(`${chalk.red`Save Failed:`}`, error);
          return;
        }

        console.info(chalk.cyan`Saved`, output);
      });
    },
    (error) => {
      console.error(`${chalk.red`Failed:`}`, error.message);
    },
);

