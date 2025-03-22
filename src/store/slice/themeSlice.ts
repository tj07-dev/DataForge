// themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  accent: string;
  headerOpen: boolean;
  accentClass: string;
  theme: string;
}

const initialState: ThemeState = {
  accent: '#10b981',
  headerOpen: false,
  accentClass: 'accent',
  theme: 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },

    setAccent: (state, action: PayloadAction<string>) => {
      state.accent = action.payload;
    },
    setAccentClass: (state, action: PayloadAction<string>) => {
      state.accentClass = action.payload;
    },
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.headerOpen = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setTheme, setOpen, toggleTheme, setAccent, setAccentClass } =
  themeSlice.actions;
export default themeSlice.reducer;
