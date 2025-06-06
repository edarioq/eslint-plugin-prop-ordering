"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Sort destructured props in React components: reserved first, alphabetical, callbacks last",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          callbacksLast: {
            type: "boolean",
          },
          noSortAlphabetically: {
            type: "boolean",
          },
          reservedFirst: {
            type: "boolean",
          },
          reservedPropsNames: {
            type: "array",
            items: {
              type: "string",
            },
          },
          callbackPrefixes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function (context) {
    const options = context.options[0] || {};
    const callbacksLast = options.callbacksLast !== false; // default to true
    const noSortAlphabetically = options.noSortAlphabetically || false;
    const reservedFirst = options.reservedFirst !== false; // default to true
    const reservedPropsNames = options.reservedPropsNames || [
      "id",
      "key",
      "ref",
      "name",
      "type",
    ];
    const callbackPrefixes = options.callbackPrefixes || [
      "on",
      "set",
      "update",
      "handle",
      "render",
    ];
    const sourceCode = context.getSourceCode();

    // Helper function to check if parameter is a callback
    function isCallback(paramName) {
      // Check for configurable prefixes followed by capital letter
      for (const prefix of callbackPrefixes) {
        if (
          paramName.length > prefix.length &&
          paramName.startsWith(prefix) &&
          paramName[prefix.length] === paramName[prefix.length].toUpperCase()
        ) {
          return true;
        }
      }

      // Check for callback/handler suffixes
      if (
        paramName.endsWith("Callback") ||
        paramName.endsWith("Handler")
      ) {
        return true;
      }

      return false;
    }

    // Helper function to check if parameter is reserved
    function isReserved(paramName) {
      return reservedPropsNames.includes(paramName);
    }

    // Check if a node is likely a React component
    function isReactComponent(node) {
      // Check if function name is PascalCase (React components convention)
      if (node.id && node.id.name) {
        const name = node.id.name;
        return name[0] === name[0].toUpperCase();
      }

      // For variable declarations
      if (
        node.parent &&
        node.parent.type === "VariableDeclarator" &&
        node.parent.id &&
        node.parent.id.type === "Identifier"
      ) {
        const name = node.parent.id.name;
        return name && name[0] === name[0].toUpperCase();
      }

      // Check for JSX return
      let hasJSXReturn = false;

      if (node.body && node.body.type === "BlockStatement") {
        // Look for return statements with JSX
        const returnStatements = node.body.body.filter(
          (stmt) => stmt.type === "ReturnStatement"
        );

        hasJSXReturn = returnStatements.some(
          (stmt) =>
            stmt.argument &&
            (stmt.argument.type === "JSXElement" ||
              stmt.argument.type === "JSXFragment")
        );
      } else if (
        node.body &&
        (node.body.type === "JSXElement" || node.body.type === "JSXFragment")
      ) {
        // Arrow functions with implicit return of JSX
        hasJSXReturn = true;
      }

      return hasJSXReturn;
    }

    // Check if the parameter is a props destructuring pattern in first position
    function isFirstParamPropsDestructuring(node) {
      return (
        node.params &&
        node.params.length > 0 &&
        node.params[0].type === "ObjectPattern"
      );
    }

    // Handle a destructuring parameter in a React component
    function handleComponentDestructuring(node) {
      // Safety check: only process if it looks like a React component
      if (!isReactComponent(node) && !isFirstParamPropsDestructuring(node)) {
        return;
      }

      const params = node.params;

      // Only handle the first parameter if it's an object destructuring pattern
      if (
        !params ||
        params.length === 0 ||
        params[0].type !== "ObjectPattern"
      ) {
        return;
      }

      const propsParam = params[0];
      const properties = propsParam.properties;

      if (!properties || properties.length < 2) {
        return;
      }

      // Sort the destructured properties
      const sortedProperties = [...properties].sort((a, b) => {
        // Skip rest elements - they should stay at the end
        if (a.type === "RestElement") return 1;
        if (b.type === "RestElement") return -1;

        // Get property names
        const aName = a.key ? a.key.name : null;
        const bName = b.key ? b.key.name : null;

        if (!aName || !bName) {
          return 0;
        }

        // Reserved props first
        if (reservedFirst) {
          if (isReserved(aName) && !isReserved(bName)) {
            return -1;
          }
          if (!isReserved(aName) && isReserved(bName)) {
            return 1;
          }
        }

        // Callbacks last - separate all callbacks from non-callbacks first
        const aIsCallback = isCallback(aName);
        const bIsCallback = isCallback(bName);
        
        if (callbacksLast) {
          if (!aIsCallback && bIsCallback) {
            return -1;
          }
          if (aIsCallback && !bIsCallback) {
            return 1;
          }
        }

        // Alphabetical sort
        if (!noSortAlphabetically) {
          return aName.localeCompare(bName);
        }

        return 0;
      });

      // Check if properties are already sorted
      let needsSorting = false;

      for (let i = 0; i < properties.length; i++) {
        if (properties[i] !== sortedProperties[i]) {
          needsSorting = true;
          break;
        }
      }

      if (needsSorting) {
        context.report({
          node,
          message:
            "React component props should be sorted: reserved first, alphabetical, callbacks last.",
          fix(fixer) {
            const propertyTexts = sortedProperties.map((prop) =>
              sourceCode.getText(prop)
            );
            const newPropertiesText = propertyTexts.join(", ");

            // Get the range of all properties
            const startPos = properties[0].range[0];
            const endPos = properties[properties.length - 1].range[1];

            return fixer.replaceTextRange(
              [startPos, endPos],
              newPropertiesText
            );
          },
        });
      }
    }

    return {
      // Handle function declarations (named components)
      FunctionDeclaration(node) {
        handleComponentDestructuring(node);
      },

      // Handle arrow function expressions
      ArrowFunctionExpression(node) {
        handleComponentDestructuring(node);
      },

      // Handle function expressions
      FunctionExpression(node) {
        handleComponentDestructuring(node);
      },
    };
  },
};