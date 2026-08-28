import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { orderBurgerApi } from '@api';
import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderError: string | null;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null,
  orderError: null
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return fallback;
};

const mapToOrder = (
  order: {
    _id: string;
    status: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    number: number;
  },
  ingredients: string[]
): TOrder => ({
  _id: order._id,
  status: order.status,
  name: order.name,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  number: order.number,
  ingredients
});

export const createOrder = createAsyncThunk<
  TOrder,
  void,
  { rejectValue: string }
>('burgerConstructor/createOrder', async (_, { getState, rejectWithValue }) => {
  const { bun, ingredients } = (
    getState() as { burgerConstructor: TConstructorState }
  ).burgerConstructor;

  if (!bun) {
    return rejectWithValue('Выберите булку');
  }

  const ids = [
    bun._id,
    ...ingredients.map((ingredient) => ingredient._id),
    bun._id
  ];

  try {
    const response = await orderBurgerApi(ids);
    return mapToOrder(response.order, ids);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Не удалось оформить заказ'));
  }
});

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredientToConstructor: {
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: uuidv4() }
      }),
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ from: number; to: number }>
    ) => {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.ingredients.length) {
        return;
      }
      const [removed] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, removed);
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
    closeOrderModal: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderError = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.orderError =
          action.payload || action.error.message || 'Не удалось оформить заказ';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderError = null;
        state.orderModalData = action.payload;
        state.bun = null;
        state.ingredients = [];
      });
  }
});

type TRootState = { burgerConstructor: TConstructorState };

export const selectConstructorItems = createSelector(
  [
    (state: TRootState) => state.burgerConstructor.bun,
    (state: TRootState) => state.burgerConstructor.ingredients
  ],
  (bun, ingredients) => ({ bun, ingredients })
);
export const selectOrderRequest = (state: TRootState) =>
  state.burgerConstructor.orderRequest;
export const selectOrderModalData = (state: TRootState) =>
  state.burgerConstructor.orderModalData;
export const selectOrderError = (state: TRootState) =>
  state.burgerConstructor.orderError;

export const {
  addIngredientToConstructor,
  deleteIngredient,
  moveIngredient,
  clearConstructor,
  closeOrderModal
} = constructorSlice.actions;

export default constructorSlice.reducer;
