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
      variant: string;
      disabled?: boolean;
      onClick: () => void;
    }`,
    // Test more comprehensive sorting
    `interface DataTableProps {
      id: string;
      columns: string[];
      data: any[];
      className?: string;
      emptyMessage?: string;
      loading?: boolean;
      onRowClick: () => void;
      onPageChange?: () => void;
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
        variant: string;
        disabled?: boolean;
        onClick: () => void;
      }`,
    },
    // Test comprehensive sorting
    {
      code: `interface DataTableProps {
        onRowClick: () => void;
        loading?: boolean;
        id: string;
        data: any[];
        onPageChange?: () => void;
        columns: string[];
        className?: string;
        emptyMessage?: string;
      }`,
      errors: [
        {
          message:
            "Interface properties should be sorted according to the defined order.",
        },
      ],
      output: `interface DataTableProps {
        id: string;
        columns: string[];
        data: any[];
        className?: string;
        emptyMessage?: string;
        loading?: boolean;
        onRowClick: () => void;
        onPageChange?: () => void;
      }`,
    },
  ],
});
