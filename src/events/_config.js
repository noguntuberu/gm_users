/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/
const glob = require('glob');
const { resolve } = require('path');

/** require all event handlers here */
const basePath = resolve(__dirname, './handlers/');
const files = glob.sync('*.js', { cwd: basePath })
files.forEach(file => {
    if ((file.toLocaleLowerCase()).includes('_config')) return;
    require(resolve(basePath, file));
});