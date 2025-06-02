module.exports = {
  rules: {
    "sort-type-properties": require("./rules/sort-type-properties"),
    "sort-component-props": require("./rules/sort-component-props"),
  },
  configs: {
    recommended: {
      plugins: ["@edarioq/prop-ordering"],
      rules: {
        "@edarioq/prop-ordering/sort-type-properties": [
          "warn",
          {
            callbacksLast: true,
            noSortAlphabetically: false,
            reservedFirst: true,
            reservedPropsNames: ["id", "key", "ref", "name", "type"],
            callbackPrefixes: ["on", "set", "update", "handle", "render"],
          },
        ],
        "@edarioq/prop-ordering/sort-component-props": [
          "warn",
          {
            callbacksLast: true,
            noSortAlphabetically: false,
            reservedFirst: true,
            reservedPropsNames: ["id", "key", "ref", "name", "type"],
            callbackPrefixes: ["on", "set", "update", "handle", "render"],
          },
        ],
      },
    },
  },
};
