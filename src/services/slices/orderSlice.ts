import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi, getOrdersApi } from '@api';
import { TOrder } from '@utils-types';

type TOrderState = {
  orders: TOrder[];
  currentOrder: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null
};

export const getUserOrders = createAsyncThunk('order/getOrders', getOrdersApi);

export const getOrderByNumber = createAsyncThunk(
  'order/getOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    if (!response.orders.length) {
      throw new Error('Заказ не найден');
    }
    return response.orders[0];
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказы';
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? 'Не удалось загрузить заказ по номеру';
        state.currentOrder = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      });
  }
});

type TRootState = { order: TOrderState };

export const selectUserOrders = (state: TRootState) => state.order.orders;
export const selectCurrentOrder = (state: TRootState) =>
  state.order.currentOrder;
export const selectIsLoading = (state: TRootState) => state.order.isLoading;
export const selectOrderError = (state: TRootState) => state.order.error;

export const { clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;
