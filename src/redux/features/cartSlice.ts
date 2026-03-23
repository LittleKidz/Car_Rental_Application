import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types";

interface CartState {
  cartItems: CartItem[];
}

const initialState: CartState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // max 3 for normal users
      state.cartItems.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cartItems.splice(action.payload, 1);
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ index: number; item: CartItem }>
    ) => {
      state.cartItems[action.payload.index] = action.payload.item;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateCartItem } =
  cartSlice.actions;
export default cartSlice.reducer;
