/**
 * Created by MaxSosnov on 21.03.2016.
 */
var fs = require('fs');
var path = require('path');
function getDirectories(srcpath) {
 return fs.readdirSync(srcpath).filter(function(file) {
   return fs.statSync(path.join(srcpath, file)).isDirectory();
 });
}

console.log(getDirectories("node_modules").length);
for (var y = 0; y < getDirectories("node_modules").length; y++) {
 console.log('"node_modules/' + getDirectories("node_modules")[y] + '/**/*.js",');
}
