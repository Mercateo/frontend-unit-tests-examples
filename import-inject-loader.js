const loaderUtils = require('loader-utils');
const babylon = require('babylon');
const babel = require('babel-core');
const traverse = require('babel-traverse');

module.exports = function (contentStr, sourceMap) {
  const options = loaderUtils.parseQuery(this.query);
  const resourcePath = this.resourcePath;

  if (options === null || options === undefined) {
    console.error('No options specified: Use "import-inject-loader?fieldA,fieldB!../file"');
    return contentStr;
  }

  const imports = Object.keys(options);

  // parse AST
  const ast = babylon.parse(contentStr, {
    sourceType: 'module',
    plugins: [
      'jsx'
    ]
  });

  // replace imports by custom import which can be overwritten
  imports.forEach(
    key => replaceKeyByInject(key, ast, resourcePath)
  );

  // export method to reset all overwritten imports
  addResetFunction(ast, imports);

  // return converted AST
  return '// BEGIN-import-inject-loader\n'
    + babel.transformFromAst(ast).code
    + '\n// END-import-inject-loader';
};

function replaceKeyByInject(key, ast, resourcePath) {
  if (!fileUsesImport(ast, key)) {
    console.warn(`Import ${key} in "${resourcePath}" is not defined. If this is not global, this import is unknown!`);
  }

  const {
    overwriteMethodName,
    usedName,
    defaultName
  } = getVariableNames(key);

  replaceImportUsages(ast, key, usedName);
  addExportedOverwriteMethod(ast, overwriteMethodName, usedName);
  addOverwriteDeclarationField(ast, key, usedName);
  addDefaultDeclarationField(ast, key, defaultName);

  return ast;
}

function getVariableNames(key) {
  const loaderPrefix = 'il';

  return {
    overwriteMethodName: loaderPrefix + 'Overwrite' + capitalizeFirstLetter(key),
    usedName: loaderPrefix + capitalizeFirstLetter(key),
    defaultName: loaderPrefix + 'Default' + capitalizeFirstLetter(key)
  }
}

function addResetFunction(ast, imports) {
  const resetMethodName = 'resetAllInjects';

  const expressionStatements = imports.map(importName => {
    const { defaultName, usedName } = getVariableNames(importName);

    return ({
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: usedName
        },
        right: {
          type: 'Identifier',
          name: defaultName
        }
      }
    });
  });

  ast.program.body.push({
    type: 'ExportNamedDeclaration',
    specifiers: [],
    source: null,
    declaration: {
      type: 'FunctionDeclaration',
      id: {
        type: 'Identifier',
        name: resetMethodName
      },
      generator: false,
      expression: false,
      async: false,
      params: [],
      body: {
        type: 'BlockStatement',
        body: expressionStatements,
        directives: []
      }
    },
    exportKind: 'value'
  });
}

function fileUsesImport(ast, key) {
  let foundImportUsage = false;

  traverse.default(ast, {
    enter(path) {
      if (path.node.type === 'ImportSpecifier' && path.node.local.name === key) {
        foundImportUsage = true;
      }
    }
  });

  return foundImportUsage;
}

function replaceImportUsages(ast, key, overwrittenName) {
  traverse.default(ast, {
    enter(path) {
      if (path.node.type === 'Identifier' && path.node.name === key && path.parent.type !== 'ImportSpecifier') {
        path.node.name = overwrittenName;
      }
    }
  });
}

function addExportedOverwriteMethod(ast, overwriteMethodName, usedName) {
  ast.program.body.push(
    {
      type: 'ExportNamedDeclaration',
      specifiers: [],
      source: null,
      declaration: {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: overwriteMethodName
        },
        generator: false,
        expression: false,
        async: false,
        params: [
          {
            type: 'Identifier',
            name: 'paramOverwrite'
          }
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: {
                  type: 'Identifier',
                  name: usedName
                },
                right: {
                  type: 'Identifier',
                  name: 'paramOverwrite'
                }
              }
            }
          ]
        }
      },
      exportKind: 'value'
    });
}

function addOverwriteDeclarationField(ast, key, overwrittenName) {
  addVariable(ast, overwrittenName, key);
}

function addDefaultDeclarationField(ast, key, defaultName) {
  addVariable(ast, defaultName, key);
}

function addVariable(ast, name, value) {
  ast.program.body.unshift({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: name
        },
        init: {
          type: 'Identifier',
          name: value
        }
      }
    ],
    kind: 'var'
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
