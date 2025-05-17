# Coding Standards

## General Guidelines

- Write clean, self-documenting code
- Follow the principles of SOLID design
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Maintain consistent formatting and style

## TypeScript

- Enable strict type checking and use it consistently
- Prefer interfaces over type aliases for object definitions
- Use union types to represent values with multiple possible types
- Avoid using `any` type when possible
- Use type guards for runtime type checking
- Add return types to all functions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function getUserById(id: string): User | undefined {
  // implementation
}

// Avoid
function processData(data: any): any {
  // implementation
}
```

## React Components

- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Extract reusable logic into custom hooks
- Use React.memo for performance optimization when needed
- Use TypeScript for props validation instead of PropTypes

```tsx
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false,
  variant = 'primary'  
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

## File Structure

- One component per file
- Name files according to the component they contain
- Group related files in feature-based directories
- Keep index files for clean exports

## CSS / Styling

- Use Tailwind CSS for styling
- Follow utility-first approach
- Extract common patterns to components
- Use CSS variables for theming

## State Management

- Use local state for UI-specific state
- Use React Context for shared state that doesn't change often
- Use Redux for complex application state with frequent updates
- Keep Redux slices modular and focused

## Testing

- Write unit tests for all components and utilities
- Use React Testing Library for component tests
- Focus on testing behavior, not implementation details
- Keep tests readable and maintainable
- Aim for high test coverage, especially for critical paths

## Imports and Exports

- Use named exports for most cases
- Use default exports for components
- Group and sort imports by type (React, third-party, project)
- Use absolute imports with path aliases when possible

## Comments and Documentation

- Add JSDoc comments for public functions and components
- Document complex logic and business rules
- Use inline comments sparingly, only for non-obvious code
- Keep comments up to date with code changes

## Commits and Pull Requests

- Write meaningful commit messages
- Keep commits focused on a single change
- Create small, reviewable pull requests
- Reference issues in commit messages

## Error Handling

- Handle errors at the appropriate level
- Use try/catch blocks for async operations
- Provide meaningful error messages
- Log errors for debugging
