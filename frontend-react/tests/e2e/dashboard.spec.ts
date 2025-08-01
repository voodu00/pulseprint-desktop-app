import { test, expect } from '@playwright/test';
import { setupNetworkMocking } from './test-helpers';

test.describe('PulsePrint Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocking(page);
  });
  test('should load the dashboard', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/PulsePrint/);

    // Wait for the dashboard to fully load - the loading state might be too fast to catch
    // So we'll wait for the main content instead
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Check that we can see the main dashboard elements
    await expect(
      page.locator('text=Monitor and control your 3D printers')
    ).toBeVisible();
  });

  test('should display the main navigation elements', async ({ page }) => {
    await page.goto('/?e2e-test=true');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the main dashboard content to be visible
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Check for the main heading
    await expect(
      page.locator('h1:has-text("PulsePrint Desktop")')
    ).toBeVisible();

    // Check for the subtitle
    await expect(
      page.locator('text=Monitor and control your 3D printers')
    ).toBeVisible();

    // Check for main action buttons - be more specific to avoid conflicts
    await expect(page.locator('button:has-text("Add Printer")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
    // Use more specific selectors to avoid conflicts between multiple Import buttons
    await expect(
      page.locator('button:has-text("Import")').first()
    ).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test('should be able to navigate to settings', async ({ page }) => {
    await page.goto('/?e2e-test=true');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the dashboard to be fully loaded
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Click the settings button - force click to bypass overlay issues
    await page.click('button:has-text("Settings")', { force: true });

    // Wait for settings page to load - use more specific selector
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(
      page.locator('text=Configure your PulsePrint desktop preferences')
    ).toBeVisible();

    // Check for settings sections - use more specific selectors
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Notifications")')
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Display")')
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Data Management")')
    ).toBeVisible();

    // Navigate back to dashboard
    await page.click('button:has-text("Back to Dashboard")', { force: true });
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible();
  });

  test('should display statistics overview', async ({ page }) => {
    await page.goto('/?e2e-test=true&with-default-printers');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the dashboard to be fully loaded
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Check for statistics cards - use more specific selectors to avoid conflicts
    await expect(page.locator('text=Total Printers')).toBeVisible();
    await expect(page.locator('text=Online')).toBeVisible();
    // Use first() to avoid strict mode violation with multiple "Printing" elements
    await expect(page.locator('text=Printing').first()).toBeVisible();
    await expect(page.locator('text=Idle').first()).toBeVisible();
    await expect(page.locator('text=Errors')).toBeVisible();
  });
});

test.describe('PulsePrint Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocking(page);
  });
  test('should load settings page', async ({ page }) => {
    await page.goto('/?e2e-test=true');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the dashboard to be fully loaded
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Navigate to settings
    await page.click('button:has-text("Settings")', { force: true });

    // Wait for settings page to load - use more specific selector
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Check for all main settings sections - use more specific selectors
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Notifications")')
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Display")')
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Data Management")')
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="card-title"]:has-text("Connection")')
    ).toBeVisible();

    // Check for specific settings
    await expect(page.locator('text=Idle Printer Alerts')).toBeVisible();
    await expect(page.locator('text=Show Temperatures')).toBeVisible();
    await expect(page.locator('text=Dark Mode')).toBeVisible();
  });

  test('should be able to interact with settings', async ({ page }) => {
    await page.goto('/?e2e-test=true');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the dashboard to be fully loaded
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible({
      timeout: 30000,
    });

    // Navigate to settings
    await page.click('button:has-text("Settings")', { force: true });

    // Wait for settings page to load - use more specific selector
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Find and verify the Show Temperatures setting is present
    const temperatureContainer = page
      .locator('.flex.items-center.justify-between')
      .filter({ hasText: 'Show Temperatures' });

    await expect(temperatureContainer).toBeVisible();

    // Find the switch component
    const temperatureToggle = temperatureContainer.locator(
      '[data-slot="switch"]'
    );

    // Verify the switch is present and clickable
    await expect(temperatureToggle).toBeVisible();

    // Click the toggle to test interaction
    await temperatureToggle.click({ force: true });

    // Verify we can navigate back to dashboard
    await page.click('button:has-text("Back to Dashboard")', { force: true });
    await expect(page.locator('text=PulsePrint Desktop')).toBeVisible();
  });
});

// Add more test suites as features are developed:
// - Printer management tests
// - Import/Export functionality tests
// - Real-time updates tests (if applicable in E2E context)
