const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

program
  .version('1.0.0')
  .option('-d, --destination [folder]', 'Destination folder')
  .option('-s, --seperator [delimeter]', 'Column Seperator')
  .option('-i, --ignoreColumns [string,...]', 'Ignore Columns')
  .parse(process.argv);

console.log(`\n${chalk.white`---[:`} Start converting locale sheets ${chalk.white`:]---`}`);
const eventTag = (tag) => chalk.bgBlue.rgb(0,0,0)(`\n ${tag} \n`);
const prettyArray = (arr) => chalk.white`\n  - ` + arr.join(chalk.white`\n  - `);

// Get Args
console.log(eventTag('Args'));

const files = Array.from(program.args);
console.log('Sheets:', prettyArray(files));

const destination = program.destination || './translations';
console.log('Output:', destination);

const seperator = program.seperator || ',';
console.log('Seperator:', `"${seperator}"`);

const ignoreColumns = program.ignoreColumns ? program.ignoreColumns.split(',') : [];
console.log('ignoreColumns:', prettyArray(ignoreColumns));


// Convert
console.log(eventTag('Result'));

require('./converter')({
  files,
  destination,
  seperator,
  ignoreColumns,
})
  .subscribe(
    ({ locale, group, translation }) => {
      const filePath = path.join(destination, group || '');

      mkdirp(filePath, (err) => {
        if (err) {
          console.error(`\n${chalk.red`Save Failed:`}`, error);
          return;
        }

        const fileName = `${locale}.json`
        const data = JSON.stringify(translation);
        const output = path.join(filePath, fileName);

        try {
          fs.writeFileSync(output, data, {
            encoding: 'utf8',
            flag: 'a+',
          });
        } catch(error) {
          console.error(`\n${chalk.red`Save Failed:`}`, error);
          return;
        }

        console.log(chalk.cyan`Saved`, output);
      });
    },
    (error) => {
      console.error(`\n${chalk.red`Failed:`}`, error);
    },
);
