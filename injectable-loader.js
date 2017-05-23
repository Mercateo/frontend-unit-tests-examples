const loaderUtils = require('loader-utils');
const babylon = require('babylon');
const babel = require('babel-core');
const traverse = require('babel-traverse');
var expect = require('expect');

module.exports = function (contentStr, contentJs) {
  const options = loaderUtils.parseQuery(this.query);
  const resourcePath = this.resourcePath;

  if (options === null || options === undefined) {
    console.error('No options specified: Use "injectable-loader?fieldA,fieldB!../file"');
    return contentStr;
  }

  const imports = Object.keys(options);

  // parse AST
  let ast = babylon.parse(contentStr, {
    sourceType: 'module',
    plugins: [
      'jsx'
    ]
  });

  // replace imports by injected imports which can be mocked
  imports.forEach(
    key => ast = replaceKeyByInject(key, ast, resourcePath)
  );

  addResetFunction(ast, imports);

  // return converted AST
  return '// BEGIN-injectable-loader\n'
    + babel.transformFromAst(ast).code
    + '\n// END-injectable-loader';
};

function getVariableNames(key) {
  return {
    injectableName: 'injectable' + capitalizeFirstLetter(key),
    overwriteMethodName: 'overwrite' + capitalizeFirstLetter(key),
    overwrittenName: 'overwritten' + capitalizeFirstLetter(key),
    defaultName: 'default' + capitalizeFirstLetter(key)
  }
}

function addResetFunction(ast, imports) {
  const resetMethodName = 'resetAllInjects';

  const expressionStatements = imports.map(importName => {
    const { defaultName, overwrittenName } = getVariableNames(importName);

    return ({
      type: "ExpressionStatement",
      expression: {
        type: "AssignmentExpression",
        operator: "=",
        left: {
          type: "Identifier",
          loc: {
            identifierName: overwrittenName
          },
          name: overwrittenName
        },
        right: {
          type: "Identifier",
          loc: {
            identifierName: defaultName
          },
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
      type: "FunctionDeclaration",
      id: {
        type: "Identifier",
        loc: {
          identifierName: resetMethodName
        },
        name: resetMethodName
      },
      generator: false,
      expression: false,
      async: false,
      params: [],
      body: {
        type: "BlockStatement",
        body: expressionStatements,
        directives: []
      }
    },
    exportKind: 'value'
  });
}

function replaceKeyByInject(key, ast, resourcePath) {
  if (!fileUsesImport(ast, key)) {
    console.warn(`Import ${key} in "${resourcePath}" is not defined. If this is not global, this import is unknown!`);
  }

  const injectableName = 'injectable' + capitalizeFirstLetter(key);
  const overwriteMethodName = 'overwrite' + capitalizeFirstLetter(key);
  const overwrittenName = 'overwritten' + capitalizeFirstLetter(key);
  const defaultName = 'default' + capitalizeFirstLetter(key);

  replaceImportUsages(ast, key, overwrittenName);
  addExportMemberOfInjectableDependency(ast, overwriteMethodName, overwrittenName);
  addOverwriteDeclarationField(ast, key, overwrittenName);
  addDefaultDeclarationField(ast, key, defaultName);
  addExportStatement(ast, injectableName, overwriteMethodName);

  return ast;
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

function addExportMemberOfInjectableDependency(ast, overwriteMethodName, overwrittenName) {
  ast.program.body.unshift({
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      loc: {
        identifierName: overwriteMethodName
      },
      name: overwriteMethodName
    },
    generator: false,
    expression: false,
    async: false,
    params: [
      {
        type: 'Identifier',
        loc: {
          identifierName: 'paramOverwrite'
        },
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
              loc: {
                identifierName: overwrittenName
              },
              name: overwrittenName
            },
            right: {
              type: 'Identifier',
              loc: {
                identifierName: 'paramOverwrite'
              },
              name: 'paramOverwrite'
            }
          }
        }
      ],
      directives: []
    }
  });
}

function addOverwriteDeclarationField(ast, key, overwrittenName) {
  ast.program.body.unshift({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          loc: {
            identifierName: overwrittenName
          },
          name: overwrittenName
        },
        init: {
          type: 'Identifier',
          loc: {
            identifierName: key
          },
          name: key
        }
      }
    ],
    kind: 'var'
  });
}

function addDefaultDeclarationField(ast, key, defaultName) {
  ast.program.body.unshift({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          loc: {
            identifierName: defaultName
          },
          name: defaultName
        },
        init: {
          type: 'Identifier',
          loc: {
            identifierName: key
          },
          name: key
        }
      }
    ],
    kind: 'var'
  });
}

function addExportStatement(ast, injectableName, overwriteMethodName) {
  ast.program.body.push({
    type: 'ExportNamedDeclaration',
    specifiers: [],
    source: null,
    declaration: {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            loc: {
              identifierName: injectableName
            },
            name: injectableName
          },
          init: {
            type: 'Identifier',
            loc: {
              identifierName: overwriteMethodName
            },
            name: overwriteMethodName
          }
        }
      ],
      kind: 'var'
    },
    exportKind: 'value'
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
