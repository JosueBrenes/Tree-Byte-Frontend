# End-to-End Tests for TreeByte Token Purchase Flow

This project includes comprehensive end-to-end tests for the TreeByte application's token purchase flow using Playwright.

## Test Coverage

### 1. Project Listing Display (`project-listing.spec.ts`)
- ✅ Projects page header display
- ✅ Grid of project cards with correct count (9 projects)
- ✅ Project card information (title, location, status, price)
- ✅ Different project statuses (Available vs Coming soon)
- ✅ Project modal functionality
- ✅ Modal content validation
- ✅ Modal close functionality
- ✅ Hover effects on project cards
- ✅ Image display validation

### 2. Token Purchase Flow (`token-purchase-flow.spec.ts`)
- ✅ Adopt Tree button display in project modal
- ✅ Navigation to adopt flow page
- ✅ Adoption flow steps display
- ✅ Step progression functionality
- ✅ Wallet connection handling
- ✅ Tree adoption step
- ✅ Loading states during purchase
- ✅ Successful token purchase handling
- ✅ Error handling for failed purchases
- ✅ Token amount validation
- ✅ User authentication requirements

### 3. Dashboard Token Updates (`dashboard-token-updates.spec.ts`)
- ✅ Dashboard header with user greeting
- ✅ Tokens section display
- ✅ Existing token collection display
- ✅ Token icons rendering
- ✅ Token updates after successful purchase
- ✅ Dashboard component layout (active projects, footprint, achievements, coupons)
- ✅ Responsive layout maintenance
- ✅ Token count updates after multiple purchases
- ✅ Token loading states

### 4. Loading, Success, and Error States (`loading-success-error-states.spec.ts`)
#### Loading States:
- ✅ Loading state in adopt tree modal
- ✅ Project data fetch loading
- ✅ Purchase button disabled during validation
- ✅ Dashboard data loading spinner

#### Success States:
- ✅ Success toast after token purchase
- ✅ Modal close after successful purchase
- ✅ Adoption flow completion success
- ✅ Form submission confirmation

#### Error States:
- ✅ Error toast for failed purchases
- ✅ Network error handling
- ✅ Authentication failure messages
- ✅ Project loading errors
- ✅ Form validation errors
- ✅ Request timeout handling

#### State Transitions:
- ✅ Loading to success state transition
- ✅ Loading to error state transition
- ✅ State reset when modal reopened

## Test Structure

### Files Organization
```
e2e/
├── project-listing.spec.ts           # Project listing and modal tests
├── token-purchase-flow.spec.ts       # End-to-end purchase flow tests
├── dashboard-token-updates.spec.ts   # Dashboard and token display tests
├── loading-success-error-states.spec.ts  # State management tests
└── test-helpers.ts                   # Reusable test utilities
```

### Test Helpers
The `test-helpers.ts` file provides:
- `ProjectHelpers`: Methods for interacting with project components
- `DashboardHelpers`: Methods for dashboard interactions
- `NavigationHelpers`: Page navigation utilities
- `setupAPIRoutes`: API mocking utilities for different scenarios

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install`

### Available Commands
```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# List all tests
npx playwright test --list
```

### Test Configuration
Tests are configured in `playwright.config.ts` with:
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 retries in CI, 0 locally
- **Trace**: On first retry
- **Web Server**: Automatically starts Next.js dev server

## Test Features

### Cross-Browser Testing
Tests run on three browsers:
- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

### API Mocking
Tests use route interception to mock:
- Successful token purchases
- Failed purchases with various error types
- Network errors
- Slow responses for timeout testing
- Loading states

### Responsive Testing
Tests verify:
- Grid layouts on different screen sizes
- Mobile-friendly interactions
- Responsive component behavior

### State Management Testing
Comprehensive testing of:
- Loading states during async operations
- Success feedback and UI updates
- Error handling and user feedback
- State transitions between different UI states

## Best Practices Implemented

1. **Kebab-case naming**: All test files use kebab-case naming convention
2. **No default imports**: Tests avoid default alias imports and relative paths
3. **Alias paths**: Uses `@/` prefix for component imports where applicable
4. **Reusable components**: Test helpers promote code reuse
5. **Comprehensive coverage**: Tests cover all major user flows
6. **Clear test structure**: Descriptive test names and organized test suites
7. **Cross-browser compatibility**: Ensures tests work across all major browsers
8. **Proper waits**: Uses appropriate waiting strategies for async operations

## Test Maintenance

### Adding New Tests
1. Create test files in the `e2e/` directory
2. Use descriptive test names following the pattern: "should [expected behavior]"
3. Utilize test helpers for common operations
4. Add API mocking for external dependencies

### Updating Tests
When UI changes occur:
1. Update selectors in test files
2. Modify test helpers if component interfaces change
3. Update expected text content or element counts
4. Verify cross-browser compatibility

### Debugging Tests
1. Use `npm run test:e2e:debug` for step-by-step debugging
2. Use `npm run test:e2e:headed` to see browser interactions
3. Check trace files in `test-results/` for failed tests
4. Use `page.pause()` to add breakpoints in tests

## Total Test Count
**156 tests** across 4 test files covering all major functionality of the TreeByte token purchase flow.