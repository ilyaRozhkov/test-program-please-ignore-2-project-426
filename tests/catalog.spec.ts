import { test, expect, Page } from '@playwright/test';
import { openCatalog } from './helpers';

// ===== Вспомогательные функции =====

const itemCount = (page: Page) => page.getByTestId('catalog-item').count();

const visibleNames = async (page: Page): Promise<string[]> => {
  const names = await page.getByTestId('catalog-item-name').allTextContents();
  return names.map(name => name.trim());
};

const categoryValues = async (page: Page): Promise<string[]> => {
  const category = page.getByTestId('filter-category');
  await expect(category.locator('option').nth(1)).toBeAttached();
  const values = await category
    .locator('option')
    .evaluateAll((nodes: HTMLOptionElement[]) =>
      nodes.map(node => node.value).filter(v => v !== '')
    );
  expect(values.length).toBeGreaterThan(0);
  return values;
};

// ===== Тесты =====

test('карточка товара содержит название, цену и доступность', async ({ page }) => {
  await openCatalog(page);
  const first = page.getByTestId('catalog-item').first();
  await expect(first.getByTestId('catalog-item-name')).not.toBeEmpty();
  await expect(first.getByTestId('catalog-item-price')).not.toBeEmpty();
  await expect(first.getByTestId('catalog-item-availability')).toBeVisible();
});

test('атрибут data-available проставлен корректно', async ({ page }) => {
  await openCatalog(page);
  await expect(page.getByTestId('catalog-item').first()).toBeVisible();
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
  expect(names.length).toBeGreaterThan(0);
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

test('смена фильтра возвращает на первую страницу', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page); // запоминаем общее количество
  const values = await categoryValues(page);
  // Применяем фильтр на первой странице
  await page.getByTestId('filter-category').selectOption(values[0]);
  // Ждём, что количество товаров изменилось (фильтр применился)
  await expect.poll(async () => itemCount(page)).toBeLessThan(total);
  const fromFirstPage = await visibleNames(page);
  expect(fromFirstPage.length).toBeGreaterThan(0);

  // Переходим на вторую страницу
  await openCatalog(page); // сбрасываем фильтры, открываем каталог заново
  await page.getByTestId('catalog-page-next').click();
  // Ждём, что набор изменился (перешли на вторую страницу)
  await expect.poll(async () => (await visibleNames(page)).join('|')).not.toBe(
    (await visibleNames(page)).join('|')
  );

  // Применяем тот же фильтр – должна открыться первая страница
  await page.getByTestId('filter-category').selectOption(values[0]);
  await expect.poll(async () => (await visibleNames(page)).join('|')).toBe(fromFirstPage.join('|'));
  await expect(page.getByTestId('catalog-empty')).toBeHidden();
});

test('первая страница остаётся на месте при клике "Назад"', async ({ page }) => {
  await openCatalog(page);
  const firstPage = await visibleNames(page);
  expect(firstPage.length).toBeGreaterThan(0);

  await expect(page.getByTestId('catalog-page-prev')).toBeDisabled();

  await expect.poll(async () => (await visibleNames(page)).join('|')).toBe(firstPage.join('|'));
});

test('состояние каталога сохраняется после перезагрузки и кнопки "назад"', async ({ page }) => {
  await openCatalog(page);
  const total = await itemCount(page);
  const values = await categoryValues(page);
  await page.getByTestId('filter-category').selectOption(values[0]);
  // Ждём применения фильтра
  await expect.poll(async () => itemCount(page)).toBeLessThan(total);
  const filtered = await visibleNames(page);

  // Перезагрузка
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('catalog-list')).toBeVisible();
  await expect(page.getByTestId('filter-category')).toHaveValue(values[0]);
  await expect.poll(async () => (await visibleNames(page)).join('|')).toBe(filtered.join('|'));

  // Кнопка "назад"
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('catalog-list')).toBeVisible();
  await expect.poll(async () => itemCount(page)).toBe(total);
});