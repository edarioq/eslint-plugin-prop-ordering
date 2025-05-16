const rule = require("../lib/rules/sort-type-properties");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
});

ruleTester.run("sort-type-properties", rule, {
  valid: [
    `interface ButtonProps {
      id: string;
      disabled?: boolean;
      variant: string;
      onClick: () => void;
    }`,
  ],
  invalid: [
    {
      code: `interface ButtonProps {
        onClick: () => void;
        id: string;
        disabled?: boolean;
        variant: string;
      }`,
      errors: [
        {
          message:
            "Interface properties should be sorted according to the defined order.",
        },
      ],
      output: `interface ButtonProps {
        id: string;
        disabled?: boolean;
        variant: string;
        onClick: () => void;
      }`,
    },
  ],
});
