import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { friendlyCategoryDeleteError } from '../lib/validation';
import type { Category, TransactionType } from '../types';

interface CategoryInput {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

interface MutationResult {
  error: string | null;
}

interface CategoryRow {
  id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_hidden: boolean;
}

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    isDefault: row.is_default,
    isHidden: row.is_hidden,
  };
}

const SELECT_COLUMNS = 'id, name, type, icon, color, is_default, is_hidden';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  addCategory: (input: CategoryInput) => Promise<MutationResult>;
  updateCategory: (id: string, input: CategoryInput) => Promise<MutationResult>;
  deleteCategory: (id: string) => Promise<MutationResult>;
  setHidden: (id: string, isHidden: boolean) => Promise<MutationResult>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });

    // RLS scopes this to the signed-in user, so no explicit user_id filter.
    const { data, error } = await supabase
      .from('categories')
      .select(SELECT_COLUMNS)
      .order('type', { ascending: false })
      .order('name');

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }
    set({ categories: (data ?? []).map(mapRow), isLoading: false });
  },

  addCategory: async (input) => {
    set({ isMutating: true });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userError || !userId) {
      set({ isMutating: false });
      return { error: 'You must be signed in to add a category.' };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        type: input.type,
        icon: input.icon,
        color: input.color,
      })
      .select(SELECT_COLUMNS)
      .single();

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({ categories: [...state.categories, mapRow(data)] }));
    return { error: null };
  },

  updateCategory: async (id, input) => {
    set({ isMutating: true });

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: input.name.trim(),
        type: input.type,
        icon: input.icon,
        color: input.color,
      })
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single();

    set({ isMutating: false });
    if (error) return { error: error.message };

    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? mapRow(data) : c)),
    }));
    return { error: null };
  },

  deleteCategory: async (id) => {
    set({ isMutating: true });

    // The 0004 trigger blocks deleting is_default rows (check_violation), and
    // the FK on transactions.category_id blocks deleting an in-use category
    // (foreign_key_violation) — friendlyCategoryDeleteError turns both into
    // messages a user can act on.
    const { error } = await supabase.from('categories').delete().eq('id', id);

    set({ isMutating: false });
    if (error) return { error: friendlyCategoryDeleteError(error) };

    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
    return { error: null };
  },

  setHidden: async (id, isHidden) => {
    const previous = get().categories;
    // Optimistic update: toggling visibility should feel instant.
    set({
      categories: previous.map((c) => (c.id === id ? { ...c, isHidden } : c)),
    });

    const { error } = await supabase
      .from('categories')
      .update({ is_hidden: isHidden })
      .eq('id', id);

    if (error) {
      set({ categories: previous });
      return { error: error.message };
    }
    return { error: null };
  },
}));
