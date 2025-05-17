# @edarioq/eslint-plugin-prop-ordering

ESLint plugin for consistent property ordering in TypeScript interfaces and React components.

## Installation

```bash
npm install --save-dev @edarioq/eslint-plugin-prop-ordering
```

## Example usage

```
interface Props {
  effectiveSelectedKeys: "all" | Set<Key>;
  page: number;
  pages: number;
  setPage: Dispatch<SetStateAction<number>>;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function Pagination({
  effectiveSelectedKeys,
  page,
  pages,
  setPage,
  onNextPage,
  onPreviousPage,
}: Props) {
  return (
    <div>
      Notice that all props in both the type definition and the function params are sorted according to the rules
    </div>
  );
}

<Pagination
  effectiveSelectedKeys={effectiveSelectedKeys}
  page={page}
  pages={pages}
  totalItems={10}
  setPage={setPage}
  onNextPage={onNextPage}
  onPreviousPage={onPreviousPage}
/>
```

## Example config in an .eslintrc.json file

```
{
  // other stuff

  "rules": {
    "@edarioq/prop-ordering/sort-type-properties": [
      "warn",
      {
        "callbacksLast": true,
        "shorthandFirst": true,
        "noSortAlphabetically": false,
        "reservedFirst": true,
        "reservedPropsNames": ["id", "key", "ref", "name", "type"]
      }
    ],
    "@edarioq/prop-ordering/sort-component-props": [
      "warn",
      {
        "callbacksLast": true,
        "shorthandFirst": true,
        "noSortAlphabetically": false,
        "reservedFirst": true,
        "reservedPropsNames": ["id", "key", "ref", "name", "type"]
      }
    ],
  }
}
```
