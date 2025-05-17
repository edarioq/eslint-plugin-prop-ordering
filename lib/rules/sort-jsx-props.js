"use strict";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Sort JSX props with enhanced callback detection",
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
          ignoreCase: {
            type: "boolean",
          },
          multiline: {
            type: "string",
            enum: ["first", "last", "ignore"],
          },
          locale: {
            type: "string",
          },
          callbackPatterns: {
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
    const shorthandFirst = options.shorthandFirst !== false; // default to true
    const noSortAlphabetically = options.noSortAlphabetically || false;
    const reservedFirst = options.reservedFirst !== false; // default to true
    const reservedPropsNames = options.reservedPropsNames || [
      "id",
      "key",
      "ref",
      "name",
      "type",
      "className",
      "style",
    ];
    const ignoreCase = options.ignoreCase || false;
    const multiline = options.multiline || "ignore";
    const locale = options.locale || undefined;
    const callbackPatterns = options.callbackPatterns || [
      "^on[A-Z]",
      "^set[A-Z]",
      "Callback$",
      "Handler$",
      "^handle[A-Z]",
    ];
    const callbackRegexps = callbackPatterns.map(
      (pattern) => new RegExp(pattern)
    );

    const sourceCode = context.getSourceCode();

    // Helper function to check if prop is multiline
    function isMultiline(node) {
      return node.loc.start.line !== node.loc.end.line;
    }

    // Enhanced callback detection
    function isCallback(propName) {
      // Use custom regex patterns if provided
      return callbackRegexps.some((regexp) => regexp.test(propName));
    }

    // Check if prop is reserved
    function isReserved(propName) {
      return reservedPropsNames.includes(propName);
    }

    // Check if prop is shorthand (no value assigned)
    function isShorthand(attribute) {
      return attribute.type === "JSXAttribute" && attribute.value === null;
    }

    // Main comparison function for sorting props
    function compareProps(a, b) {
      // Get prop names
      const aName = a.name.name;
      const bName = b.name.name;

      // Handle multiline props if specified
      if (multiline !== "ignore") {
        const aIsMultiline = isMultiline(a);
        const bIsMultiline = isMultiline(b);

        if (aIsMultiline && !bIsMultiline) {
          return multiline === "first" ? -1 : 1;
        }
        if (!aIsMultiline && bIsMultiline) {
          return multiline === "first" ? 1 : -1;
        }
      }

      // Reserved props first
      if (reservedFirst) {
        if (isReserved(aName) && !isReserved(bName)) return -1;
        if (!isReserved(aName) && isReserved(bName)) return 1;
      }

      // Shorthand props first
      if (shorthandFirst) {
        if (isShorthand(a) && !isShorthand(b)) return -1;
        if (!isShorthand(a) && isShorthand(b)) return 1;
      }

      // Callbacks last
      if (callbacksLast) {
        if (isCallback(aName) && !isCallback(bName)) return 1;
        if (!isCallback(aName) && isCallback(bName)) return -1;
      }

      // Alphabetical sort (with optional case sensitivity and locale)
      if (!noSortAlphabetically) {
        if (ignoreCase) {
          return aName.toLowerCase().localeCompare(bName.toLowerCase(), locale);
        }
        return aName.localeCompare(bName, locale);
      }

      return 0;
    }

    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes.filter(
          (attr) => attr.type === "JSXAttribute"
        );

        // Skip if there are less than 2 attributes to sort
        if (attributes.length < 2) return;

        const sortedAttributes = [...attributes].sort(compareProps);

        // Check if attributes are already sorted
        let isSorted = true;
        for (let i = 0; i < attributes.length; i++) {
          if (attributes[i] !== sortedAttributes[i]) {
            isSorted = false;
            break;
          }
        }

        if (!isSorted) {
          context.report({
            node,
            message:
              "JSX props should be sorted according to the defined order.",
            fix(fixer) {
              const fixes = [];

              // Create a map of original positions
              const attrMap = new Map();
              for (let i = 0; i < node.attributes.length; i++) {
                attrMap.set(node.attributes[i], i);
              }

              // Get indices of the attributes that need to be sorted
              const attrIndices = attributes.map((attr) => attrMap.get(attr));

              // Create the new sorted attributes array
              const newAttributes = [...node.attributes];
              for (let i = 0; i < attributes.length; i++) {
                const sortedAttr = sortedAttributes[i];
                const originalIndex = attrIndices[i];
                newAttributes[originalIndex] = sortedAttr;
              }

              // Create fixes for each attribute that changed position
              for (let i = 0; i < node.attributes.length; i++) {
                if (node.attributes[i] !== newAttributes[i]) {
                  fixes.push(
                    fixer.replaceText(
                      node.attributes[i],
                      sourceCode.getText(newAttributes[i])
                    )
                  );
                }
              }

              return fixes;
            },
          });
        }
      },
    };
  },
};
