# SEPTA Fare Calculator

A modern, accessible React component for calculating SEPTA Regional Rail fares.

## Features

- Live fare data fetching from JSON
- Support for all SEPTA zones and fare types
- Special handling for 10-trip "Anytime" tickets
- Responsive design for mobile and desktop
- ARIA-compliant accessibility features
- Comprehensive test coverage

## Installation

```bash
npm install
```

### Note on Assets

The SEPTA logo is implemented using a WebP format for optimal performance, as the SVG asset was not provided. The WebP format was chosen because:

- Excellent compression while maintaining quality
- Wide browser support
- Good performance characteristics for both mobile and desktop

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface

## Project Structure

```
src/
├── components/
│   └── FairForm.tsx      # Main fare calculator component
├── hooks/
│   └── useFairs.tsx      # Data fetching hook
├── utils/
│   └── calcFare.ts       # Fare calculation logic
└── tests/
    ├── SeptaForm.spec.tsx
    └── useFairs.spec.tsx
```

## Design Decisions

- **Component Architecture**: Single responsibility components with clear separation of concerns
- **Data Fetching**: Custom hook for reusability and separation from UI
- **Accessibility**: ARIA attributes, keyboard navigation, and screen reader support
- **Validation**: Client-side validation for "Anytime" tickets with clear error messaging
- **Responsive Design**: Mobile-first approach with fluid layouts

## Accessibility Features

- Proper ARIA attributes for form controls
- Clear error messaging with `aria-invalid` and `aria-describedby`
- Keyboard navigation support
- Screen reader friendly helper text
- High contrast color scheme
- Responsive text sizing

## Testing

Tests cover:

- Component rendering
- User interactions
- Data fetching
- Error handling
- Accessibility requirements
- Responsive behavior

## Browser Support

Tested and working in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Time

This project was completed in approximately 4 hours, focusing on:

- Core functionality: 2 hours
- Styling and responsive design: 1 hours
- Testing and documentation: 1 hours
