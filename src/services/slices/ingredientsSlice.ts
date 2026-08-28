import {
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

type TIngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null
};

export const getIngredients = createAsyncThunk(
  'ingredients/get',
  getIngredientsApi
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? 'Не удалось загрузить ингредиенты';
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      });
  }
});

type TRootState = { ingredients: TIngredientsState };

export const selectIngredients = (state: TRootState) => state.ingredients.items;
export const selectIngredientsLoading = (state: TRootState) =>
  state.ingredients.isLoading;
export const selectIngredientsError = (state: TRootState) =>
  state.ingredients.error;
export const selectBuns = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'bun')
);
export const selectMains = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'main')
);
export const selectSauces = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'sauce')
);

export default ingredientsSlice.reducer;
