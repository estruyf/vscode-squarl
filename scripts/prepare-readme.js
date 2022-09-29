const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

const defaultValue = (value) => {
  if (value === undefined) {
    return '';
  } else if (value === null) {
    return '`null`';
  } else if (value === true) {
    return '`true`';
  } else if (value === false) {
    return '`false`';
  } else if (value instanceof Array) {
    return `\`${JSON.stringify(value)}\``;
  } else if (value instanceof Object) {
    return `\`${JSON.stringify(value)}\``;
  } else {
    return value;
  }
}

let readme = fs.readFileSync(path.join(path.resolve('.'), 'README.tmp.md'), 'utf8');

const commands = packageJson.contributes.commands;
const commandsTable = commands.map(command => {
  return `| \`${command.command}\` | ${command.category ? `${command.category}: ` : ""}${command.title} |`;
});

commandsTable.unshift('| --- | --- |');
commandsTable.unshift('| Command | Title |');

readme = readme.replace('<!-- COMMANDS -->', commandsTable.join('\n'));

const settings = packageJson.contributes.configuration.properties;
const settingsTable = Object.keys(settings).map(setting => {
  return `| \`${setting}\` | ${settings[setting].markdownDescription || settings[setting].description} | ${defaultValue(settings[setting].default)} |`;
});

settingsTable.unshift('| --- | --- | --- |');
settingsTable.unshift('| Setting | Description | Default |');

readme = readme.replace('<!-- SETTINGS -->', settingsTable.join('\n'));

fs.writeFileSync(path.join(path.resolve('.'), 'README.md'), readme, 'utf8');