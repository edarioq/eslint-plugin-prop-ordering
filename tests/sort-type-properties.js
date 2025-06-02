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
    // Reserved first, alphabetical, callbacks last (ignoring optional)
    `interface ButtonProps {
      id: string;
      disabled?: boolean;
      variant: string;
      onClick: () => void;
    }`,
    // Test more comprehensive sorting
    `interface DataTableProps {
      id: string;
      className?: string;
      columns: string[];
      data: any[];
      emptyMessage?: string;
      loading?: boolean;
      onPageChange?: () => void;
      onRowClick: () => void;
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
            "Interface properties should be sorted: reserved first, alphabetical, callbacks last.",
        },
      ],
      output: `interface ButtonProps {
        id: string;
        disabled?: boolean;
        variant: string;
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
            "Interface properties should be sorted: reserved first, alphabetical, callbacks last.",
        },
      ],
      output: `interface DataTableProps {
        id: string;
        className?: string;
        columns: string[];
        data: any[];
        emptyMessage?: string;
        loading?: boolean;
        onPageChange?: () => void;
        onRowClick: () => void;
      }`,
    },
  ],
});