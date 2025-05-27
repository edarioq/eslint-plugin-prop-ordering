"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Sort types and interfaces properties matching react/jsx-sort-props logic",
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
          shorthandFirst: {
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
        },
        additionalProperties: false,
      },
    ],
  },

  create: function (context) {
    const options = context.options[0] || {};
    const callbacksLast = options.callbacksLast !== false; // default to true
    const shorthandFirst = options.shorthandFirst || false;
    const noSortAlphabetically = options.noSortAlphabetically || false;
    const reservedFirst = options.reservedFirst !== false; // default to true
    const reservedPropsNames = options.reservedPropsNames || [
      "id",
      "key",
      "ref",
      "name",
      "type",
    ];

    // Improved helper function to check if property is a callback
    function isCallback(propName) {
      // Check for "on" prefix followed by capital letter (onNextPage but not oncallback)
      if (
        propName.length > 2 &&
        propName.startsWith("on") &&
        propName[2] === propName[2].toUpperCase()
      ) {
        return true;
      }

      // Check for "set" prefix followed by capital letter (setPage but not settings)
      if (
        propName.length > 3 &&
        propName.startsWith("set") &&
        propName[3] === propName[3].toUpperCase()
      ) {
        return true;
      }

      // Check for callback/handler suffixes
      if (propName.endsWith("Callback") || propName.endsWith("Handler")) {
        return true;
      }

      return false;
    }

    // Helper function to check if property is reserved
    function isReserved(propName) {
      return reservedPropsNames.includes(propName);
    }

    // Helper function to check if property is shorthand (for interfaces, this could mean optional)
    function isShorthand(property) {
      return property.optional === true;
    }

    // Main sorting function
    function compareProps(a, b) {
      const aPropName = a.key.name;
      const bPropName = b.key.name;

      // Reserved props first
      if (reservedFirst) {
        if (isReserved(aPropName) && !isReserved(bPropName)) {
          return -1;
        }
        if (!isReserved(aPropName) && isReserved(bPropName)) {
          return 1;
        }
      }

      // Callbacks last - separate all callbacks from non-callbacks first
      const aIsCallback = isCallback(aPropName);
      const bIsCallback = isCallback(bPropName);
      
      if (callbacksLast) {
        if (!aIsCallback && bIsCallback) {
          return -1;
        }
        if (aIsCallback && !bIsCallback) {
          return 1;
        }
      }

      // Within the same category (both callbacks or both non-callbacks),
      // sort by required vs optional (non-optional first)
      const aIsOptional = isShorthand(a);
      const bIsOptional = isShorthand(b);
      if (!aIsOptional && bIsOptional) {
        return -1;
      }
      if (aIsOptional && !bIsOptional) {
        return 1;
      }

      // Alphabetical sort
      if (!noSortAlphabetically) {
        return aPropName.localeCompare(bPropName);
      }

      return 0;
    }

    return {
      TSInterfaceDeclaration(node) {
        const properties = node.body.body;

        // Skip interfaces with less than 2 properties
        if (properties.length < 2) {
          return;
        }

        // Filter to only include property signatures
        const propSignatures = properties.filter(
          (prop) => prop.type === "TSPropertySignature"
        );

        if (propSignatures.length < 2) {
          return;
        }

        // Check if already sorted
        let isSorted = true;

        for (let i = 1; i < propSignatures.length; i++) {
          if (compareProps(propSignatures[i - 1], propSignatures[i]) > 0) {
            isSorted = false;
            break;
          }
        }

        if (!isSorted) {
          context.report({
            node,
            message:
              "Interface properties should be sorted according to the defined order.",
            fix(fixer) {
              // Create a map of original positions
              const propMap = new Map();

              for (let i = 0; i < properties.length; i++) {
                propMap.set(properties[i], i);
              }

              // Sort property signatures
              const sortedProps = [...propSignatures].sort(compareProps);

              // Create a new array with sorted properties
              const newProps = [...properties];
              const propIndices = propSignatures.map((p) => propMap.get(p));

              for (let i = 0; i < sortedProps.length; i++) {
                newProps[propIndices[i]] = sortedProps[i];
              }

              // Create the fixes
              const sourceCode = context.getSourceCode();
              const fixes = [];

              for (let i = 0; i < properties.length; i++) {
                if (properties[i] !== newProps[i]) {
                  fixes.push(
                    fixer.replaceText(
                      properties[i],
                      sourceCode.getText(newProps[i])
                    )
                  );
                }
              }

              return fixes;
            },
          });
        }
      },

      // Handle type aliases with object types
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation.type === "TSTypeLiteral") {
          const properties = node.typeAnnotation.members;

          // Skip types with less than 2 properties
          if (properties.length < 2) {
            return;
          }

          // Filter to only include property signatures
          const propSignatures = properties.filter(
            (prop) => prop.type === "TSPropertySignature"
          );

          if (propSignatures.length < 2) {
            return;
          }

          // Check if already sorted
          let isSorted = true;

          for (let i = 1; i < propSignatures.length; i++) {
            if (compareProps(propSignatures[i - 1], propSignatures[i]) > 0) {
              isSorted = false;
              break;
            }
          }

          if (!isSorted) {
            context.report({
              node,
              message:
                "Type properties should be sorted according to the defined order.",
              fix(fixer) {
                // Create a map of original positions
                const propMap = new Map();

                for (let i = 0; i < properties.length; i++) {
                  propMap.set(properties[i], i);
                }

                // Sort property signatures
                const sortedProps = [...propSignatures].sort(compareProps);

                // Create a new array with sorted properties
                const newProps = [...properties];
                const propIndices = propSignatures.map((p) => propMap.get(p));

                for (let i = 0; i < sortedProps.length; i++) {
                  newProps[propIndices[i]] = sortedProps[i];
                }

                // Create the fixes
                const sourceCode = context.getSourceCode();
                const fixes = [];

                for (let i = 0; i < properties.length; i++) {
                  if (properties[i] !== newProps[i]) {
                    fixes.push(
                      fixer.replaceText(
                        properties[i],
                        sourceCode.getText(newProps[i])
                      )
                    );
                  }
                }

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};
