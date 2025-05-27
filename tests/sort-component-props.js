const rule = require("../lib/rules/sort-component-props");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("sort-component-props", rule, {
  valid: [
    `function Button({ id, variant, disabled = false, onClick }) {
      return <button id={id} disabled={disabled} onClick={onClick}>{variant}</button>;
    }`,
  ],
  invalid: [
    {
      code: `function Button({ onClick, id, disabled = false, variant }) {
        return <button id={id} disabled={disabled} onClick={onClick}>{variant}</button>;
      }`,
      errors: [
        {
          message:
            "React component props should be sorted according to the defined order.",
        },
      ],
      output: `function Button({ id, variant, disabled = false, onClick }) {
        return <button id={id} disabled={disabled} onClick={onClick}>{variant}</button>;
      }`,
    },
  ],
});
