/**
 * node-js
 * =======
 *
 * Собирает *vanilla.js* и *node.js*-файлы по deps'ам с помощью `require`, сохраняет в виде `?.node.js`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.node.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-diverse-js/techs/node-js'));
 * ```
 */
var EOL = require('os').EOL;
module.exports = require('enb/lib/build-flow').create()
    .name('node-js')
    .target('target', '?.node.js')
    .useFileList(['vanilla.js', 'node.js'])
    .defineOption('devMode', true)
    .builder(function (sourceFiles) {
        var node = this.node,
            dropRequireCacheFunc = [
                'function dropRequireCache(requireFunc, filename) {',
                '    var module = requireFunc.cache[filename];',
                '    if (module) {',
                '        if (module.parent) {',
                '            if (module.parent.children) {',
                '                var moduleIndex = module.parent.children.indexOf(module);',
                '                if (moduleIndex !== -1) {',
                '                    module.parent.children.splice(moduleIndex, 1);',
                '                }',
                '            }',
                '            delete module.parent;',
                '        }',
                '        delete module.children;',
                '        delete requireFunc.cache[filename];',
                '    }',
                '};'
            ].join(EOL),
            devMode = this._devMode || '';

        return [
            devMode && dropRequireCacheFunc,
            sourceFiles.map(function (file) {
                var relPath = node.relativePath(file.fullname);

                return [
                    devMode && 'dropRequireCache(require, require.resolve("' + relPath + '"));',
                    'require("' + relPath + '");'
                ].join(EOL);
            }).join(EOL)
        ].join(EOL);
    })
    .createTech();
