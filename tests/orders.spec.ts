import { test, expect } from '@playwright/test';
import {
  register,
  addAvailableProductToCart,
  fillCheckout,
  parseAmount,
  openCatalog,
} from './helpers';

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}@example.com`;

test('неавторизованный не может оформить заказ', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL('/login');
});


test('при доставке адрес обязателен', async ({ page }) => {
  await register(page, uniqueEmail('address'));
  await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await page.getByTestId('checkout-method').selectOption('delivery');
  await page.getByTestId('checkout-name').fill('Иван');
  await page.getByTestId('checkout-phone').fill('+79990001122');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeHidden();
  await expect(page.getByTestId('checkout-form')).toBeVisible();
});

test('при самовывозе адрес не требуется', async ({ page }) => {
  await register(page, uniqueEmail('pickup'));
  const expected = await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'pickup');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeVisible();
  expect(parseAmount((await page.getByTestId('order-total').textContent()) ?? '')).toBe(expected);
});

test('корзина очищается после оформления', async ({ page }) => {
  await register(page, uniqueEmail('clear'));
  await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'pickup');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeVisible();
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('заказ с недоступным товаром отклоняется', async ({ page }) => {
  await register(page, uniqueEmail('unavailable'));

  await addAvailableProductToCart(page);

  await openCatalog(page);
  const index = await page
    .getByTestId('catalog-item-availability')
    .evaluateAll((nodes) =>
      nodes.findIndex((node) => node.getAttribute('data-available') === 'false')
    );
  expect(index, 'в каталоге должен быть недоступный товар').toBeGreaterThanOrEqual(0);
  await page.getByTestId('catalog-item-name').nth(index).click();
  const unavailableId = new URL(page.url()).pathname.split('/').filter(Boolean).pop() ?? '';
  expect(unavailableId).not.toBe('');

  await page.evaluate((productId) => {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && 'productId' in parsed[0]) {
          parsed.push({ productId, quantity: 1 });
          window.localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {}
    }
  }, unavailableId);

  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-total')).toBeVisible();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'pickup');
  await page.getByTestId('checkout-submit').click();

  await expect(page.getByTestId('order-error')).toBeVisible();
  await expect(page.getByTestId('order-success')).toBeHidden();
});


test('пользователь видит только свои заказы', async ({ page }) => {
  await register(page, uniqueEmail('owner'));
  await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'pickup');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeVisible();

  await page.getByTestId('nav-signout').click();

  await register(page, uniqueEmail('stranger'));
  await page.getByTestId('nav-account').click();
  await expect(page.getByTestId('account-orders-empty')).toBeVisible();
  await expect(page.getByTestId('account-order-item')).toHaveCount(0);
});