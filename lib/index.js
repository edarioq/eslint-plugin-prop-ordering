module.exports = {
  rules: {
    "sort-type-properties": require('./rules/sort-type-properties'),
    "sort-component-props": require('./rules/sort-component-props')
  },
  configs: {
    recommended: {
      plugins: ["@edarioq/prop-ordering"],
      rules: {
        "@edarioq/prop-ordering/sort-type-properties": ["warn", {
          "callbacksLast": true,
          "shorthandFirst": true,
          "noSortAlphabetically": false,
          "reservedFirst": true
        }],
        "@edarioq/prop-ordering/sort-component-props": ["warn", {
          "callbacksLast": true,
          "shorthandFirst": true,
          "noSortAlphabetically": false,
          "reservedFirst": true
        }]
      }
    }
  }
};