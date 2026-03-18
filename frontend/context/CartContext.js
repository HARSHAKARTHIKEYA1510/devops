'use client';
import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color
              ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, 10) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload }] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color)
        ),
      };
    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => !(i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color)) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'SET':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const toast = useToast();

  // Persist
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try { dispatch({ type: 'SET', payload: JSON.parse(saved) }); } catch {}
    }
  }, []);

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items, initialized]);

  const addItem = (product, quantity = 1, size = '', color = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity, size, color } });
    toast.success(`${product.name} added to cart!`);
  };

  const removeItem = (id, size = '', color = '') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { _id: id, size, color } });
  };

  const updateQty = (id, quantity, size = '', color = '') => {
    dispatch({ type: 'UPDATE_QTY', payload: { _id: id, quantity, size, color } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR' });

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const shippingCost = subtotal >= 999 ? 0 : subtotal > 0 ? 99 : 0;
  const taxAmount = Math.round(subtotal * 0.18);
  const total = subtotal + shippingCost + taxAmount;

  return (
    <CartContext.Provider value={{
      items: state.items, addItem, removeItem, updateQty, clearCart,
      subtotal, itemCount, shippingCost, taxAmount, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
