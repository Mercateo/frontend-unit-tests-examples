const loaderUtils = require('loader-utils');
const babylon = require("babylon");
const babel = require("babel-core");
const traverse = require("babel-traverse");

module.exports = function(contentStr, contentJs) {
  const options = loaderUtils.parseQuery(this.query);

  if (options === null || options === undefined) {
    console.log('No mock options!');
    return contentStr;
  }

  // parse AST
  let ast = babylon.parse(contentStr, {
    // parse in strict mode and allow module declarations
    sourceType: "module",
    plugins: [
      "jsx"
    ]
  });

  // replace imports by injected imports which can be mocked
  Object.keys(options).forEach(key => ast = replaceKeyByInject(key, ast));

  // return converted AST
  return '// BEGIN-injectable-loader\n'
    + babel.transformFromAst(ast).code
    + '\n// END-injectable-loader';
};

function replaceKeyByInject(key, ast) {
  console.log(`Touch "${key}"`);

  const fieldName = 'injectable' + capitalizeFirstLetter(key);
  const overwriteMethodeName = 'overwrite' + capitalizeFirstLetter(key);
  const overwrittenName = 'overwritten' + capitalizeFirstLetter(key);

  // find true used dependency
  let lastUsedImport = null;
  traverse.default(ast, {
    enter(path) {
    }
  });

  // replace usages of object by overwrittenXYZ
  traverse.default(ast, {
    enter(path) {
      if (path.node.type === "Identifier" && path.node.name === key && path.parent.type !== 'ImportSpecifier') {
        path.node.name = overwrittenName;
      }
    }
  });

  // add export member of injectable field
  ast.program.body.unshift({
      type: "FunctionDeclaration",
      id: {
        type: "Identifier",
        loc: {
          identifierName: overwriteMethodeName
        },
        name: overwriteMethodeName
      },
      generator: false,
      expression: false,
      async: false,
      params: [
        {
          type: "Identifier",
          loc: {
            identifierName: "paramOverwrite"
          },
          name: "paramOverwrite"
        }
      ],
      body: {
        type: "BlockStatement",
        body: [
          {
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
                  identifierName: "paramOverwrite"
                },
                name: "paramOverwrite"
              }
            }
          }
        ],
        directives: []
      }
    });
  ast.program.body.unshift({
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          loc: {
            identifierName: overwrittenName
          },
          name: overwrittenName
        },
        init: {
          type: "Identifier",
          loc: {
            identifierName: key
          },
          name: key
        }
      }
    ],
    kind: "var"
  });

  // add export statemetns
  ast.program.body.push({
    "type": "ExportNamedDeclaration",
    "specifiers": [],
    "source": null,
    "declaration": {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "loc": {
              "identifierName": fieldName
            },
            "name": fieldName
          },
          "init": {
            "type": "Identifier",
            "loc": {
              "identifierName": overwriteMethodeName
            },
            "name": overwriteMethodeName
          }
        }
      ],
      "kind": "var"
    },
    "exportKind": "value"
  });

  return ast;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
