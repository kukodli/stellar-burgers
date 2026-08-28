import { expect, test } from '@playwright/test';
import path from 'path';

const harsDir = path.join(__dirname, 'hars');

const bunName = 'Краторная булка N-200i';
const mainName = 'Биокотлета из марсианской Магнолии';
const orderNumber = '12345';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const removeOverlay = () => {
        document.getElementById('webpack-dev-server-client-overlay')?.remove();
      };
      const observer = new MutationObserver(removeOverlay);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      removeOverlay();
    });

    await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
      url: '**/api/ingredients',
      update: false
    });
    await page.routeFromHAR(path.join(harsDir, 'user.har'), {
      url: '**/api/auth/**',
      update: false
    });
    await page.routeFromHAR(path.join(harsDir, 'orders.har'), {
      url: '**/api/orders',
      update: false
    });
  });

  test('добавляет булку и начинку из списка в конструктор', async ({
    page
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('ingredient-bun-1')).toBeVisible();

    const constructor = page.getByTestId('burger-constructor');
    await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await page
      .getByTestId('ingredient-bun-1')
      .getByRole('button', { name: 'Добавить' })
      .click({ force: true });
    await expect(constructor.getByText(`${bunName} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${bunName} (низ)`)).toBeVisible();

    await page
      .getByTestId('ingredient-main-1')
      .getByRole('button', { name: 'Добавить' })
      .click({ force: true });
    await expect(constructor.getByText(mainName)).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toHaveCount(0);
  });

  test.describe('Модальное окно с описанием ингредиента', () => {
    test('открывается и показывает данные выбранного ингредиента', async ({
      page
    }) => {
      await page.goto('/');
      await page
        .getByTestId('ingredient-bun-1')
        .getByRole('link')
        .click({ force: true });

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();
      await expect(modal.getByText(bunName)).toBeVisible();
      await expect(modal.getByText('420')).toBeVisible();
      await expect(modal.getByText('80')).toBeVisible();
      await expect(modal.getByText(mainName)).toHaveCount(0);
    });

    test('показывает данные другого ингредиента, если клик был по нему', async ({
      page
    }) => {
      await page.goto('/');
      await page
        .getByTestId('ingredient-main-1')
        .getByRole('link')
        .click({ force: true });

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();
      await expect(modal.getByText(mainName)).toBeVisible();
      await expect(modal.getByText('4242')).toBeVisible();
      await expect(modal.getByText(bunName)).toHaveCount(0);
    });

    test('закрывается по клику на крестик', async ({ page }) => {
      await page.goto('/');
      await page
        .getByTestId('ingredient-bun-1')
        .getByRole('link')
        .click({ force: true });
      await expect(page.getByTestId('modal')).toBeVisible();

      await page.getByTestId('modal-close').click({ force: true });
      await expect(page.getByTestId('modal')).toHaveCount(0);
    });

    test('закрывается по клику на оверлей', async ({ page }) => {
      await page.goto('/');
      await page
        .getByTestId('ingredient-bun-1')
        .getByRole('link')
        .click({ force: true });
      await expect(page.getByTestId('modal')).toBeVisible();

      await page
        .getByTestId('modal-overlay')
        .click({ position: { x: 2, y: 2 }, force: true });
      await expect(page.getByTestId('modal')).toHaveCount(0);
    });
  });

  test.describe('Оформление заказа', () => {
    test('создаёт заказ, показывает верный номер и очищает конструктор', async ({
      page,
      context
    }) => {
      await context.addCookies([
        {
          name: 'accessToken',
          value: 'Bearer test-access-token',
          url: 'http://localhost:4000'
        }
      ]);
      await page.addInitScript(() => {
        window.localStorage.setItem('refreshToken', 'test-refresh-token');
      });

      await page.goto('/');
      await page
        .getByTestId('ingredient-bun-1')
        .getByRole('button', { name: 'Добавить' })
        .click({ force: true });
      await page
        .getByTestId('ingredient-main-1')
        .getByRole('button', { name: 'Добавить' })
        .click({ force: true });
      await page
        .getByRole('button', { name: 'Оформить заказ' })
        .click({ force: true });

      await expect(page.getByTestId('modal')).toBeVisible();
      await expect(page.getByTestId('order-number')).toHaveText(orderNumber);

      const constructor = page.getByTestId('burger-constructor');
      await expect(
        constructor.getByText('Выберите булки').first()
      ).toBeVisible();
      await expect(constructor.getByText('Выберите начинку')).toBeVisible();

      await page.getByTestId('modal-close').click({ force: true });
      await expect(page.getByTestId('modal')).toHaveCount(0);
    });
  });
});
