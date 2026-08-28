import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';
import constructorReducer, {
  addIngredientToConstructor,
  clearConstructor,
  closeOrderModal,
  createOrder,
  deleteIngredient,
  moveIngredient
} from '../constructorSlice';

const bun: TIngredient = {
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
};

const filling: TIngredient = {
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
};

const sauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'sauce.png',
  image_large: 'sauce-large.png',
  image_mobile: 'sauce-mobile.png'
};

const bunInConstructor: TConstructorIngredient = { ...bun, id: 'uuid-bun' };
const fillingInConstructor: TConstructorIngredient = {
  ...filling,
  id: 'uuid-main'
};
const sauceInConstructor: TConstructorIngredient = {
  ...sauce,
  id: 'uuid-sauce'
};

const mockOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Space burger',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  number: 12345,
  ingredients: ['bun-1', 'main-1', 'bun-1']
};

const initialState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null,
  orderError: null
};

describe('burgerConstructor reducer', () => {
  test('возвращает начальное состояние для неизвестного экшена', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('добавляет булку в конструктор', () => {
    const state = constructorReducer(initialState, {
      type: addIngredientToConstructor.type,
      payload: bunInConstructor
    });

    expect(state.bun).toEqual(bunInConstructor);
    expect(state.ingredients).toEqual([]);
  });

  test('заменяет булку при повторном добавлении', () => {
    const anotherBun = { ...bunInConstructor, id: 'uuid-bun-2', name: 'Флюоресцентная булка' };
    const state = constructorReducer(
      { ...initialState, bun: bunInConstructor },
      {
        type: addIngredientToConstructor.type,
        payload: anotherBun
      }
    );

    expect(state.bun).toEqual(anotherBun);
    expect(state.ingredients).toEqual([]);
  });

  test('добавляет начинку в конструктор', () => {
    const state = constructorReducer(initialState, {
      type: addIngredientToConstructor.type,
      payload: fillingInConstructor
    });

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([fillingInConstructor]);
  });

  test('удаляет начинку по id', () => {
    const state = constructorReducer(
      {
        ...initialState,
        bun: bunInConstructor,
        ingredients: [fillingInConstructor, sauceInConstructor]
      },
      deleteIngredient(fillingInConstructor.id)
    );

    expect(state.bun).toEqual(bunInConstructor);
    expect(state.ingredients).toEqual([sauceInConstructor]);
  });

  test('переставляет начинки местами', () => {
    const state = constructorReducer(
      {
        ...initialState,
        ingredients: [fillingInConstructor, sauceInConstructor]
      },
      moveIngredient({ from: 0, to: 1 })
    );

    expect(state.ingredients).toEqual([
      sauceInConstructor,
      fillingInConstructor
    ]);
  });

  test('не перемещает начинку за границы массива', () => {
    const current = {
      ...initialState,
      ingredients: [fillingInConstructor, sauceInConstructor]
    };
    const state = constructorReducer(
      current,
      moveIngredient({ from: 0, to: 5 })
    );

    expect(state.ingredients).toEqual(current.ingredients);
  });

  test('очищает конструктор', () => {
    const state = constructorReducer(
      {
        ...initialState,
        bun: bunInConstructor,
        ingredients: [fillingInConstructor]
      },
      clearConstructor()
    );

    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('закрывает модалку заказа', () => {
    const state = constructorReducer(
      {
        ...initialState,
        orderModalData: mockOrder,
        orderRequest: true
      },
      closeOrderModal()
    );

    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
  });

  test('обрабатывает createOrder.pending', () => {
    const state = constructorReducer(
      { ...initialState, orderError: 'Старая ошибка' },
      { type: createOrder.pending.type }
    );

    expect(state.orderRequest).toBe(true);
    expect(state.orderError).toBeNull();
  });

  test('обрабатывает createOrder.rejected с payload', () => {
    const state = constructorReducer(
      { ...initialState, orderRequest: true },
      {
        type: createOrder.rejected.type,
        payload: 'Не удалось оформить заказ',
        error: { message: 'Rejected' }
      }
    );

    expect(state.orderRequest).toBe(false);
    expect(state.orderError).toBe('Не удалось оформить заказ');
  });

  test('обрабатывает createOrder.rejected без payload', () => {
    const state = constructorReducer(
      { ...initialState, orderRequest: true },
      {
        type: createOrder.rejected.type,
        error: { message: 'Network Error' }
      }
    );

    expect(state.orderRequest).toBe(false);
    expect(state.orderError).toBe('Network Error');
  });

  test('обрабатывает createOrder.fulfilled', () => {
    const state = constructorReducer(
      {
        bun: bunInConstructor,
        ingredients: [fillingInConstructor],
        orderRequest: true,
        orderModalData: null,
        orderError: 'ошибка'
      },
      {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      }
    );

    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      orderModalData: mockOrder,
      orderError: null
    });
  });
});
