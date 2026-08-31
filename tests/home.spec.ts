import { test, expect } from '@playwright/test';

test('главная страница загружается и показывает промо-блоки', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('home-promo')).toBeVisible();
  const promoItems = page.getByTestId('home-promo-item');
  await expect(promoItems).toHaveCount(2);
});

test('клик по промо-блоку открывает страницу товара', async ({ page }) => {
  await page.goto('/');
  const firstPromo = page.getByTestId('home-promo-item').first();
  const href = await firstPromo.getAttribute('href');
  expect(href).toContain('/product/');
  await firstPromo.click();
  await expect(page).toHaveURL(new RegExp(`^.*${href}$`));
  await expect(page.getByTestId('product-name')).toBeVisible();
});

test('из главной страницы можно перейти в каталог по ссылке в шапке', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('nav-catalog').click();
  await expect(page).toHaveURL('/catalog');
  await expect(page.getByTestId('catalog-list')).toBeVisible();
});