import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryApi from "../../api/categoryApi";
import { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Utensils, ShoppingCart, Home, Zap, Car, Clapperboard, ShoppingBag, Pill, Plane, Tag } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]";

const categoryIcons = {
  Food: <Utensils className="w-4 h-4 inline text-[#154535]" />,
  Groceries: <ShoppingCart className="w-4 h-4 inline text-[#154535]" />,
  Rent: <Home className="w-4 h-4 inline text-[#154535]" />,
  Utilities: <Zap className="w-4 h-4 inline text-[#154535]" />,
  Transport: <Car className="w-4 h-4 inline text-[#154535]" />,
  Entertainment: <Clapperboard className="w-4 h-4 inline text-[#154535]" />,
  Shopping: <ShoppingBag className="w-4 h-4 inline text-[#154535]" />,
  Health: <Pill className="w-4 h-4 inline text-[#154535]" />,
  Travel: <Plane className="w-4 h-4 inline text-[#154535]" />,
};
const getCategoryIcon = (name) => categoryIcons[name] || <Tag className="w-4 h-4 inline text-[#154535]" />;

const SUGGESTED = ["Groceries", "Rent", "Utilities", "Transport", "Entertainment", "Shopping", "Health", "Travel", "Food", "Education"];

export default function HouseholdCategories({ household, householdId, user }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  const isOwner = user?.id === household.owner_id;

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", householdId],
    queryFn: () => categoryApi.listByHousehold(householdId).then((r) => r.data),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name) => categoryApi.create(householdId, name),
    onSuccess: () => {
      toast("Category added!", "success");
      queryClient.invalidateQueries({ queryKey: ["categories", householdId] });
      setNewCategory("");
      setCategoryError("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to add category", "error");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }) => categoryApi.update(id, name),
    onSuccess: () => {
      toast("Category updated!", "success");
      queryClient.invalidateQueries({ queryKey: ["categories", householdId] });
      setEditingCategory(null);
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to update category", "error");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => {
      toast("Category deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["categories", householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to delete category", "error");
    },
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      createCategoryMutation.mutate(newCategory.trim());
    }
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    if (editingCategory?.name.trim()) {
      updateCategoryMutation.mutate({ id: editingCategory.id, name: editingCategory.name.trim() });
    }
  };

  const existingNames = new Set(categories?.map((c) => c.name.toLowerCase()) || []);
  const suggested = SUGGESTED.filter((s) => !existingNames.has(s.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-white/80 shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#154535] mb-4">Categories</h2>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="text-sm text-[#4A6B5D] mb-3">No categories yet.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-3">
            {categories.map((c) => (
              <div key={c.id}>
                {editingCategory?.id === c.id ? (
                  <form onSubmit={handleUpdateCategory} className="flex gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory((ec) => ({ ...ec, name: e.target.value }))
                      }
                      autoFocus required
                    />
                    <button type="submit" disabled={updateCategoryMutation.isPending}
                      className="bg-[#154535] text-white text-xs px-2 rounded-lg disabled:opacity-50 hover:bg-[#1b5c48] transition-colors shadow-sm">
                      {updateCategoryMutation.isPending ? "..." : <Check className="w-4 h-4" />}
                    </button>
                      <button type="button" onClick={() => setEditingCategory(null)}
                         className="bg-white/60 border border-[#E1EEE8] text-[#4A6B5D] text-xs px-2 rounded-lg hover:bg-[#E1EEE8] transition-colors"><X className="w-4 h-4" /></button>
                    </form>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-[#F8FCFA] border border-[#E1EEE8] rounded-lg">
                    <span className="text-sm text-[#154535]">
                      {getCategoryIcon(c.name)} {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingCategory({ id: c.id, name: c.name })}
                        className="text-[#4A6B5D] hover:text-[#154535] transition-colors"><Pencil className="w-4 h-4" /></button>
                      {isOwner && (
                        <button onClick={() => deleteCategoryMutation.mutate(c.id)}
                          className="text-[#4A6B5D] hover:text-[#D94A4A] transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Suggested categories */}
        {suggested.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#4A6B5D] mb-2">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((name) => (
                <button
                  key={name}
                  onClick={() => createCategoryMutation.mutate(name)}
                  disabled={createCategoryMutation.isPending}
                  className="text-xs px-3 py-1.5 bg-[#F8FCFA] border border-[#E1EEE8] rounded-full text-[#4A6B5D] hover:border-[#154535] hover:text-[#154535] hover:bg-white transition-colors disabled:opacity-50 shadow-sm"
                >
                  {getCategoryIcon(name)} +{name}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoryError && (
          <p className="text-sm text-[#D94A4A] mb-2 bg-red-50/80 rounded-lg px-3 py-1.5 border border-red-100/50">
            {categoryError}
          </p>
        )}

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            className={`${inputCls} flex-1`}
            type="text"
            placeholder="e.g. Groceries"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
          />
          <button type="submit" disabled={createCategoryMutation.isPending}
            className="bg-[#154535] hover:bg-[#1b5c48] text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0 shadow-sm">
            {createCategoryMutation.isPending ? "..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}