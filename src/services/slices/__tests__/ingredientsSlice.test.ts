import { TIngredient } from '@utils-types';
import ingredientsReducer, { getIngredients } from '../ingredientsSlice';

const mockIngredients: TIngredient[] = [
  {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun.png',
    image_large: 'bun-large.png',
    image_mobile: 'bun-mobile.png'
  },
  {
    _id: 'main-1',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'main.png',
    image_large: 'main-large.png',
    image_mobile: 'main-mobile.png'
  }
];

const initialState = {
  items: [],
  isLoading: false,
  error: null
};

describe('ingredients reducer', () => {
  test('возвращает начальное состояние для неизвестного экшена', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('обрабатывает getIngredients.pending', () => {
    const state = ingredientsReducer(initialState, {
      type: getIngredients.pending.type
    });

    expect(state).toEqual({
      items: [],
      isLoading: true,
      error: null
    });
  });

  test('сбрасывает ошибку при повторном pending', () => {
    const state = ingredientsReducer(
      { items: [], isLoading: false, error: 'Старая ошибка' },
      { type: getIngredients.pending.type }
    );

    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  test('обрабатывает getIngredients.fulfilled', () => {
    const state = ingredientsReducer(
      { items: [], isLoading: true, error: null },
      {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      }
    );

    expect(state).toEqual({
      items: mockIngredients,
      isLoading: false,
      error: null
    });
  });

  test('обрабатывает getIngredients.rejected с сообщением ошибки', () => {
    const state = ingredientsReducer(
      { items: [], isLoading: true, error: null },
      {
        type: getIngredients.rejected.type,
        error: { message: 'Network Error' }
      }
    );

    expect(state).toEqual({
      items: [],
      isLoading: false,
      error: 'Network Error'
    });
  });

  test('обрабатывает getIngredients.rejected без сообщения ошибки', () => {
    const state = ingredientsReducer(
      { items: mockIngredients, isLoading: true, error: null },
      {
        type: getIngredients.rejected.type,
        error: {}
      }
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Не удалось загрузить ингредиенты');
    expect(state.items).toEqual(mockIngredients);
  });
});
