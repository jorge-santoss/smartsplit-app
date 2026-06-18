import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryApi from "../../api/categoryApi";
import { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const categoryIcons = {
  Food: "🍽️", Groceries: "🛒", Rent: "🏠", Utilities: "⚡",
  Transport: "🚗", Entertainment: "🎬", Shopping: "🛍️", Health: "💊",
  Travel: "✈️",
};
const getCategoryIcon = (name) => categoryIcons[name] || "🏷️";

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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Categories</h2>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No categories yet.</p>
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
                      className="bg-blue-500 text-white text-xs px-2 rounded-lg disabled:opacity-50">
                      {updateCategoryMutation.isPending ? "..." : "✓"}
                    </button>
                    <button type="button" onClick={() => setEditingCategory(null)}
                      className="bg-gray-100 text-gray-600 text-xs px-2 rounded-lg">✕</button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {getCategoryIcon(c.name)} {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingCategory({ id: c.id, name: c.name })}
                        className="text-xs text-blue-400 hover:text-blue-600 transition-colors">Edit</button>
                      {isOwner && (
                        <button onClick={() => deleteCategoryMutation.mutate(c.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
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
            <p className="text-xs font-medium text-gray-400 mb-2">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((name) => (
                <button
                  key={name}
                  onClick={() => createCategoryMutation.mutate(name)}
                  disabled={createCategoryMutation.isPending}
                  className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  {getCategoryIcon(name)} +{name}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoryError && (
          <p className="text-sm text-red-500 mb-2">{categoryError}</p>
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
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0">
            {createCategoryMutation.isPending ? "..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}