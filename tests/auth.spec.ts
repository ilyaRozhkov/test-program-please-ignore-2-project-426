import { test, expect } from '@playwright/test';
import { register, login } from './helpers';

test('регистрация и автоматический вход', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;
  await register(page, email);
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('nav-account')).toBeVisible();
});

test('вход с правильными данными', async ({ page }) => {
  const email = `login-${Date.now()}@example.com`;
  await register(page, email);
  await page.getByTestId('nav-signout').click();
  await login(page, email);
  await expect(page.getByTestId('nav-account')).toBeVisible();
});

test('выход из системы', async ({ page }) => {
  const email = `logout-${Date.now()}@example.com`;
  await register(page, email);
  await page.getByTestId('nav-signout').click();
  await expect(page.getByTestId('nav-signin')).toBeVisible();
});

test('защищённая страница недоступна без авторизации', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL('/login');
});

test('регистрация с занятым email отклоняется', async ({ page }) => {
  const email = `duplicate-${Date.now()}@example.com`;
  await register(page, email);
  await page.getByTestId('nav-signout').click();
  await page.goto('/register');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill('test123');
  await page.getByTestId('auth-submit').click();
  await expect(page.getByTestId('auth-error')).toBeVisible();
});

test('вход с неверным паролем отклоняется', async ({ page }) => {
  const email = `wrongpass-${Date.now()}@example.com`;
  await register(page, email);
  await page.getByTestId('nav-signout').click();
  await page.goto('/login');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill('wrong');
  await page.getByTestId('auth-submit').click();
  await expect(page.getByTestId('auth-error')).toBeVisible();
});