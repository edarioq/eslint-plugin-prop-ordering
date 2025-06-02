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
    // Reserved first, alphabetical, callbacks last
    `function Button({ id, disabled = false, variant, onClick }) {
      return <button id={id} disabled={disabled} onClick={onClick}>{variant}</button>;
    }`,
    // Test more comprehensive sorting
    `function DataTable({ id, className, columns, data, emptyMessage = "No data", loading = false, onPageChange, onRowClick }) {
      return <div>{data.length}</div>;
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
            "React component props should be sorted: reserved first, alphabetical, callbacks last.",
        },
      ],
      output: `function Button({ id, disabled = false, variant, onClick }) {
        return <button id={id} disabled={disabled} onClick={onClick}>{variant}</button>;
      }`,
    },
    // Test comprehensive sorting
    {
      code: `function DataTable({ onRowClick, loading = false, id, data, onPageChange, columns, className, emptyMessage = "No data" }) {
        return <div>{data.length}</div>;
      }`,
      errors: [
        {
          message:
            "React component props should be sorted: reserved first, alphabetical, callbacks last.",
        },
      ],
      output: `function DataTable({ id, className, columns, data, emptyMessage = "No data", loading = false, onPageChange, onRowClick }) {
        return <div>{data.length}</div>;
      }`,
    },
  ],
});