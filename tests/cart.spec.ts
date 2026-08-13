import { test, expect } from '@playwright/test';
import { openCatalog, addAvailableProductToCart, openCart, parseAmount } from './helpers';

test('страница товара открывается из каталога', async ({ page }) => {
  await openCatalog(page);
  await page.getByTestId('catalog-item-name').first().click();
  await expect(page.getByTestId('product-name')).not.toBeEmpty();
  await expect(page.getByTestId('product-price')).not.toBeEmpty();
  await expect(page.getByTestId('product-description')).toBeVisible();
});

test('добавление товара в корзину', async ({ page }) => {
  const price = await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  expect(parseAmount((await page.getByTestId('cart-total').textContent()) ?? '')).toBe(price);
});

test('изменение количества пересчитывает итог', async ({ page }) => {
  const price = await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-item-qty').first().fill('3');
  await expect.poll(async () => {
    const total = parseAmount((await page.getByTestId('cart-total').textContent()) ?? '');
    return total === price * 3;
  }).toBe(true);
});

test('удаление позиции из корзины', async ({ page }) => {
  await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await page.getByTestId('cart-item-remove').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('cart-item')).toHaveCount(0);
});

test('корзина сохраняется после перезагрузки', async ({ page }) => {
  await addAvailableProductToCart(page);
  await page.getByTestId('nav-cart').click();
  const total = await page.getByTestId('cart-total').textContent();
  await page.reload();
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  expect(await page.getByTestId('cart-total').textContent()).toBe(total);
});

test('недоступный товар нельзя добавить в корзину', async ({ page }) => {
  await openCatalog(page);
  const index = await page
    .getByTestId('catalog-item-availability')
    .evaluateAll((nodes) =>
      nodes.findIndex((node) => node.getAttribute('data-available') === 'false')
    );
  expect(index, 'в каталоге должен быть недоступный товар').toBeGreaterThanOrEqual(0);
  await page.getByTestId('catalog-item-name').nth(index).click();
  await expect(page.getByTestId('product-name')).toBeVisible();
  const addBtn = page.getByTestId('product-add-to-cart');
  if ((await addBtn.count()) > 0) {
    await expect(addBtn).toBeDisabled();
  }
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('пустая корзина показывает состояние и не даёт оформить заказ', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  const checkout = page.getByTestId('cart-checkout');
  if ((await checkout.count()) > 0) {
    await expect(checkout).toBeDisabled();
  }
});