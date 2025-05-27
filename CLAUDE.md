# eslint-plugin-react-props-sort

A comprehensive ESLint plugin that enforces consistent ordering of React component props and TypeScript interface/type properties. This plugin helps maintain clean, readable, and predictable code structure across your React and TypeScript projects.

## Features

- **Destructured Props Sorting**: Automatically sorts destructured props in React component parameters
- **TypeScript Interface Sorting**: Sorts properties in TypeScript interfaces and type literals
- **Intelligent Callback Detection**: Recognizes callbacks by common patterns (`onClick`, `onSubmit`, `setData`, `handleClick`, etc.)
- **Reserved Props Prioritization**: Ensures important props like `id`, `key`, `ref` appear first
- **Flexible Configuration**: Customize sorting behavior to match your team's preferences
- **Auto-fix Support**: Automatically reorder properties with ESLint's `--fix` option

## Installation

```bash
npm install --save-dev eslint-plugin-react-props-sort
```

## Usage

Add the plugin to your ESLint configuration:

```json
{
  "plugins": ["react-props-sort"],
  "rules": {
    "react-props-sort/sort-destructured-props": "warn",
    "react-props-sort/sort-interface-props": "warn"
  }
}
```

## Rules

### `sort-destructured-props`

Sorts destructured props in React component function parameters to match a consistent order.

**Before:**

```jsx
function UserProfile({ onClick, id, name, email, isActive, onSubmit }) {
  return <div>...</div>;
}
```

**After:**

```jsx
function UserProfile({ id, email, isActive, name, onClick, onSubmit }) {
  return <div>...</div>;
}
```

### `sort-interface-props`

Sorts properties in TypeScript interfaces and type literals according to the same ordering logic.

**Before:**

```typescript
interface UserProps {
  onClick: () => void;
  id: string;
  name: string;
  email?: string;
  isActive: boolean;
  onSubmit: (data: any) => void;
}
```

**After:**

```typescript
interface UserProps {
  id: string;
  email?: string;
  isActive: boolean;
  name: string;
  onClick: () => void;
  onSubmit: (data: any) => void;
}
```

## Configuration Options

Both rules accept the same configuration options:

```json
{
  "react-props-sort/sort-destructured-props": [
    "warn",
    {
      "callbacksLast": true,
      "shorthandFirst": false,
      "noSortAlphabetically": false,
      "reservedFirst": true,
      "reservedPropsNames": ["id", "key", "ref", "name", "type"]
    }
  ]
}
```

### Options

| Option                 | Type     | Default                                | Description                                      |
| ---------------------- | -------- | -------------------------------------- | ------------------------------------------------ |
| `callbacksLast`        | boolean  | `true`                                 | Move callback functions to the end               |
| `shorthandFirst`       | boolean  | `false`                                | Move optional properties first (TypeScript only) |
| `noSortAlphabetically` | boolean  | `false`                                | Disable alphabetical sorting                     |
| `reservedFirst`        | boolean  | `true`                                 | Move reserved props to the beginning             |
| `reservedPropsNames`   | string[] | `["id", "key", "ref", "name", "type"]` | List of props considered "reserved"              |

## Sorting Logic

The plugin applies the following sorting order:

1. **Reserved props first** (if `reservedFirst: true`)

   - Props like `id`, `key`, `ref`, `name`, `type`

2. **Optional properties first** (if `shorthandFirst: true`, TypeScript only)

   - Properties marked with `?`

3. **Regular properties** (alphabetically sorted if `noSortAlphabetically: false`)

   - All other properties in alphabetical order

4. **Callbacks last** (if `callbacksLast: true`)

   - Properties starting with `on` + capital letter (`onClick`, `onSubmit`)
   - Properties starting with `set` + capital letter (`setData`, `setUser`)
   - Properties ending with `Callback` or `Handler`
   - Properties starting with `handle`

5. **Rest elements always last**
   - Spread operators (`...rest`) remain at the end

## Smart Component Detection

The `sort-destructured-props` rule intelligently detects React components by:

- **PascalCase naming**: Functions with names starting with uppercase letters
- **JSX returns**: Functions that return JSX elements or fragments
- **First parameter destructuring**: Only processes the first parameter if it's object destructuring

This ensures the rule only applies to actual React components and doesn't interfere with regular JavaScript functions.

## Callback Detection Patterns

The plugin recognizes callbacks using these patterns:

- `on` + PascalCase: `onClick`, `onSubmit`, `onDataChange`
- `set` + PascalCase: `setData`, `setUser`, `setIsLoading`
- Ending with `Callback`: `submitCallback`, `errorCallback`
- Ending with `Handler`: `clickHandler`, `submitHandler`
- Starting with `handle`: `handleClick`, `handleSubmit`

## Examples

### Basic Component Sorting

```jsx
// ❌ Before
function Button({ onClick, disabled, children, id, type = "button" }) {
  return (
    <button id={id} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

// ✅ After
function Button({ id, type = "button", children, disabled, onClick }) {
  return (
    <button id={id} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
```

### TypeScript Interface Sorting

```typescript
// ❌ Before
interface FormProps {
  onSubmit: (data: FormData) => void;
  title: string;
  id: string;
  description?: string;
  isLoading: boolean;
  onCancel: () => void;
}

// ✅ After
interface FormProps {
  id: string;
  description?: string;
  isLoading: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (data: FormData) => void;
}
```

### Complex Component with All Options

```jsx
// ❌ Before
function UserCard({
  onEdit,
  avatar,
  id,
  email,
  name,
  isOnline,
  onClick,
  ...rest
}) {
  return <div {...rest}>...</div>;
}

// ✅ After (with default settings)
function UserCard({
  id,
  avatar,
  email,
  isOnline,
  name,
  onEdit,
  onClick,
  ...rest
}) {
  return <div {...rest}>...</div>;
}
```

## Why Use This Plugin?

### Consistency

Maintains consistent prop ordering across your entire codebase, making it easier for team members to read and understand component interfaces.

### Readability

Places the most important props (like `id` and `key`) first, and groups related functionality together.

### Maintenance

Reduces cognitive load when working with components by establishing predictable patterns.

### Code Reviews

Eliminates discussions about prop ordering during code reviews, allowing teams to focus on logic and functionality.

## Integration with Existing Tools

This plugin works seamlessly with:

- **Prettier**: Handles formatting while this plugin handles ordering
- **TypeScript**: Full support for TypeScript interfaces and type literals
- **React**: Detects React components automatically
- **ESLint**: Standard ESLint plugin architecture with auto-fix support

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related

- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) - React specific linting rules
- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort) - Import statement sorting
- [@typescript-eslint](https://typescript-eslint.io/) - TypeScript ESLint rules
