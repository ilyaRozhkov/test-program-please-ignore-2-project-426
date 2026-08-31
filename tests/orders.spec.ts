import { test, expect, Page } from '@playwright/test';
import { register, login, addAvailableProductToCart, fillCheckout, parseAmount, openCatalog } from './helpers';

const uniqueEmail = (prefix: string) => `${prefix}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

test('неавторизованный не может оформить заказ', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL('/login');
});

test('авторизованный пользователь оформляет заказ и видит страницу успеха', async ({ page }) => {
  await register(page, uniqueEmail('success'));
  const expected = await addAvailableProductToCart(page, 2);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'delivery');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeVisible();
  expect(parseAmount((await page.getByTestId('order-total').textContent()) ?? '')).toBe(expected);
});

test('пустую корзину оформить нельзя', async ({ page }) => {
  await register(page, uniqueEmail('empty'));
  await page.goto('/checkout');
  await expect(page).toHaveURL('/cart'); 
  await expect(page.getByTestId('cart-empty')).toBeVisible();
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
  await expect(page.getByTestId('catalog-list')).toBeVisible();

  // Находим карточку с недоступным товаром
  const unavailableCard = page
    .getByTestId('catalog-item')
    .filter({ has: page.locator('[data-available="false"]') })
    .first();

  const productId = await unavailableCard.getAttribute('data-product-id');
  expect(productId).not.toBeNull();
  const numericId = Number(productId);

  // Добавляем недоступный товар в localStorage
  await page.evaluate((productId) => {
    for (let i = 0; i < window.localStorage.length; i += 1) {
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
      } catch {
        // не JSON — не корзина
      }
    }
  }, numericId);

  // Переходим в корзину
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-total')).toBeVisible();

  // Переходим на страницу оформления
  await page.getByTestId('cart-checkout').click();
  await expect(page.getByTestId('checkout-form')).toBeVisible();

  // Заполняем форму и отправляем
  await fillCheckout(page, 'pickup');
  await page.getByTestId('checkout-submit').click();

  // Проверяем, что заказ отклонён
  await expect(page.getByTestId('order-error')).toBeVisible();
  await expect(page.getByTestId('order-success')).toBeHidden();
});

test('в личном кабинете видны заказы пользователя с деталями', async ({ page }) => {
  await register(page, uniqueEmail('account'));
  const expected = await addAvailableProductToCart(page, 2);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await fillCheckout(page, 'delivery');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-success')).toBeVisible();

  await page.getByTestId('nav-account').click();
  await expect(page.getByTestId('account-orders')).toBeVisible();
  await expect(page.getByTestId('account-order-item')).toHaveCount(1);

  const order = page.getByTestId('account-order-item').first();
  await expect(order.getByTestId('order-status')).toHaveAttribute('data-status', 'paid');
  expect(parseAmount((await order.getByTestId('order-total').textContent()) ?? '')).toBe(expected);

  const detailsButton = order.getByRole('button', { name: /Показать детали/i });
  if (await detailsButton.isVisible()) {
    await detailsButton.click();
  }

  const orderItems = order.getByTestId('order-item');
  await expect(orderItems).toHaveCount(1);

  const firstItem = orderItems.first();
  const itemText = await firstItem.textContent() ?? '';
  expect(itemText).toContain('× 2 =');
  // Извлекаем сумму после знака "="
  const sumText = itemText.split('=')[1]?.trim() || '';
  expect(parseAmount(sumText)).toBe(expected);
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