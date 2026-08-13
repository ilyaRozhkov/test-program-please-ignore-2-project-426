import { test, expect } from '@playwright/test';
import { openCatalog } from './helpers';

const itemCount = (page: any) => page.getByTestId('catalog-item').count();
const visibleNames = async (page: any) => {
  const names = await page.getByTestId('catalog-item-name').allTextContents();
  return names.map((n: string) => n.trim());
};
const categoryValues = async (page: any) => {
  const category = page.getByTestId('filter-category');
  await expect(category.locator('option').nth(1)).toBeAttached();
  const values = await category
    .locator('option')
    .evaluateAll((nodes: HTMLOptionElement[]) =>
      nodes.map((node) => node.value).filter((v) => v !== '')
    );
  expect(values.length).toBeGreaterThan(0);
  return values;
};

test('карточка товара содержит название, цену и доступность', async ({ page }) => {
  await openCatalog(page);
  const first = page.getByTestId('catalog-item').first();
  await expect(first.getByTestId('catalog-item-name')).not.toBeEmpty();
  await expect(first.getByTestId('catalog-item-price')).not.toBeEmpty();
  await expect(first.getByTestId('catalog-item-availability')).toBeVisible();
});

test('атрибут data-available проставлен корректно', async ({ page }) => {
  await openCatalog(page);
  const flags = await page
    .getByTestId('catalog-item-availability')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-available')));
  expect(flags.length).toBeGreaterThan(0);
  for (const flag of flags) {
    expect(['true', 'false']).toContain(flag);
  }
});

test('фильтр по категории сужает список', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page);
  const values = await categoryValues(page);
  await page.getByTestId('filter-category').selectOption(values[0]);
  await expect.poll(async () => itemCount(page)).toBeLessThan(total);
  expect(await itemCount(page)).toBeGreaterThan(0);
});

test('поиск по названию оставляет подходящие товары', async ({ page }) => {
  await openCatalog(page);
  const names = await visibleNames(page);
  const fragment = names[0].split(' ')[0];
  await page.getByTestId('filter-search').fill(fragment);
  await expect.poll(async () => {
    const shown = await visibleNames(page);
    return shown.length > 0 && shown.every((name) => name.toLowerCase().includes(fragment.toLowerCase()));
  }).toBe(true);
});

test('фильтр по цене меняет выдачу', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page);
  await page.getByTestId('filter-price-max').fill('20000');
  await expect.poll(async () => itemCount(page)).toBeLessThan(total);
});

test('фильтр "только в наличии" скрывает недоступные', async ({ page }) => {
  await openCatalog(page);
  await page.getByTestId('filter-available').check();
  await expect.poll(async () => {
    const flags = await page
      .getByTestId('catalog-item-availability')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-available')));
    return flags.every((f) => f === 'true');
  }).toBe(true);
});

test('сброс фильтров возвращает полный список', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page);
  await page.getByTestId('filter-search').fill('несуществующий');
  await expect(page.getByTestId('catalog-empty')).toBeVisible();
  await page.getByTestId('filter-reset').click();
  await expect.poll(async () => itemCount(page)).toBe(total);
});

test('пустое состояние показывается, если ничего не найдено', async ({ page }) => {
  await openCatalog(page);
  await page.getByTestId('filter-search').fill('несуществующий');
  await expect(page.getByTestId('catalog-empty')).toBeVisible();
  expect(await itemCount(page)).toBe(0);
});

test('переключение страниц меняет набор карточек', async ({ page }) => {
  await openCatalog(page);
  await expect(page.getByTestId('catalog-pagination')).toBeVisible();
  const firstPage = await visibleNames(page);
  await page.getByTestId('catalog-page-next').click();
  await expect.poll(async () => (await visibleNames(page)).join('|')).not.toBe(firstPage.join('|'));
  const secondPage = await visibleNames(page);
  expect(secondPage.length).toBeGreaterThan(0);
  expect(secondPage.filter((name) => firstPage.includes(name))).toEqual([]);
  await page.getByTestId('catalog-page-prev').click();
  await expect.poll(async () => (await visibleNames(page)).join('|')).toBe(firstPage.join('|'));
});

test('состояние фильтров сохраняется после перезагрузки и кнопки "назад"', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page);
  const values = await categoryValues(page);
  await page.getByTestId('filter-category').selectOption(values[0]);
  await expect.poll(async () => itemCount(page)).toBeLessThan(total);
  const filtered = await visibleNames(page);

  await page.reload();
  await expect(page.getByTestId('catalog-list')).toBeVisible();
  await expect(page.getByTestId('filter-category')).toHaveValue(values[0]);
  await expect.poll(async () => (await visibleNames(page)).join('|')).toBe(filtered.join('|'));

  await page.goBack();
  await expect(page.getByTestId('catalog-list')).toBeVisible();
  await expect.poll(async () => itemCount(page)).toBe(total);
});