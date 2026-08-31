import { Page, expect } from '@playwright/test';

export const openCatalog = async (page: Page) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('nav-catalog').click();
  await expect(page.getByTestId('catalog-list')).toBeVisible();
};

export const openCart = async (page: Page) => {
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-total')).toBeVisible();
};

export const register = async (page: Page, email: string, password: string = 'test123') => {
  await page.goto('/register');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();
  await expect(page).toHaveURL('/');
};

export const login = async (page: Page, email: string, password: string = 'test123') => {
await page.goto("/", { waitUntil: "domcontentloaded" });
await page.getByTestId("nav-signin").click();
await page.getByTestId("auth-email").fill(email);
await page.getByTestId("auth-password").fill(password);
await page.getByTestId("auth-submit").click();
};

export const addAvailableProductToCart = async (page: Page, quantity: number = 1) => {
  await openCatalog(page);
  await page.getByTestId('filter-available').check();
  await expect(page.getByTestId('catalog-item').first()).toBeVisible({ timeout: 10000 });
  const priceText = await page.getByTestId('catalog-item-price').first().textContent();
  const price = parseAmount(priceText ?? '0');
  await page.getByTestId('catalog-item-name').first().click();
  await page.getByTestId('product-add-to-cart').click();
  return price * quantity;
};

export const fillCheckout = async (page: Page, method: 'delivery' | 'pickup') => {
  await page.getByTestId('checkout-method').selectOption(method);
  await page.getByTestId('checkout-name').fill('Иван Петров');
  await page.getByTestId('checkout-phone').fill('+79990001122');
  if (method === 'delivery') {
    await page.getByTestId('checkout-address').fill('ул. Ленина, д. 1');
  }
};

export const parseAmount = (text: string): number => {
  const digits = text.replace(/[^\d]/g, '');
  return Number(digits) || 0;
};
