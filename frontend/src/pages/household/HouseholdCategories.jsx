import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryApi from "../../api/categoryApi";
import { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Utensils, ShoppingCart, Home, Zap, Car, Clapperboard, ShoppingBag, Pill, Plane, Tag } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 border border-[#2C2C2E] bg-[#121214] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all";

const categoryIcons = {
  Food: <Utensils className="w-4 h-4 inline text-[#2DD4BF]" />,
  Groceries: <ShoppingCart className="w-4 h-4 inline text-[#2DD4BF]" />,
  Rent: <Home className="w-4 h-4 inline text-[#2DD4BF]" />,
  Utilities: <Zap className="w-4 h-4 inline text-[#2DD4BF]" />,
  Transport: <Car className="w-4 h-4 inline text-[#2DD4BF]" />,
  Entertainment: <Clapperboard className="w-4 h-4 inline text-[#2DD4BF]" />,
  Shopping: <ShoppingBag className="w-4 h-4 inline text-[#2DD4BF]" />,
  Health: <Pill className="w-4 h-4 inline text-[#2DD4BF]" />,
  Travel: <Plane className="w-4 h-4 inline text-[#2DD4BF]" />,
};
const getCategoryIcon = (name) => categoryIcons[name] || <Tag className="w-4 h-4 inline text-[#2DD4BF]" />;

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
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Categories</h2>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] mb-3">No categories yet.</p>
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
                      className="bg-[#2DD4BF] text-[#121214] text-xs px-2 rounded-lg disabled:opacity-50 hover:brightness-110 transition-all shadow-lg shadow-teal-400/25">
                      {updateCategoryMutation.isPending ? "..." : <Check className="w-4 h-4" />}
                    </button>
                      <button type="button" onClick={() => setEditingCategory(null)}
                         className="bg-[#1C1C1E] border border-[#2C2C2E] text-[#9CA3AF] text-xs px-2 rounded-lg hover:bg-[#2C2C2E] hover:text-white transition-all"><X className="w-4 h-4" /></button>
                    </form>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-[#121214] border border-[#2C2C2E] rounded-lg hover:bg-[#2C2C2E] transition-colors">
                    <span className="text-sm text-white">
                      {getCategoryIcon(c.name)} {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingCategory({ id: c.id, name: c.name })}
                        className="text-[#6B7280] hover:text-[#2DD4BF] transition-colors"><Pencil className="w-4 h-4" /></button>
                      {isOwner && (
                        <button onClick={() => deleteCategoryMutation.mutate(c.id)}
                          className="text-[#6B7280] hover:text-[#FB7185] transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <p className="text-xs font-medium text-[#6B7280] mb-2">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((name) => (
                <button
                  key={name}
                  onClick={() => createCategoryMutation.mutate(name)}
                  disabled={createCategoryMutation.isPending}
                  className="text-xs px-3 py-1.5 bg-[#121214] border border-[#2C2C2E] rounded-full text-[#9CA3AF] hover:border-[#2DD4BF] hover:text-[#2DD4BF] hover:bg-[#2C2C2E] transition-all disabled:opacity-50 shadow-sm"
                >
                  {getCategoryIcon(name)} +{name}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoryError && (
          <p className="text-sm text-[#FB7185] mb-2 bg-[#FB7185]/10 rounded-lg px-3 py-1.5 border border-[#FB7185]/30">
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
            className="bg-[#2DD4BF] hover:brightness-110 text-[#121214] text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 transition-all flex-shrink-0 shadow-lg shadow-teal-400/25">
            {createCategoryMutation.isPending ? "..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}