import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import * as householdApi from "../api/householdApi";
import { SkeletonCard } from "../components/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import ExportButton from "../components/ExportButton";
import ConfirmDialog from "../components/ConfirmDialog";
import HouseholdExpenses from "./household/HouseholdExpenses";
import HouseholdBalances from "./household/HouseholdBalances";
import HouseholdMembers from "./household/HouseholdMembers";
import HouseholdSettlements from "./household/HouseholdSettlements";
import HouseholdCategories from "./household/HouseholdCategories";

const TABS = ["Expenses", "Balances", "Members", "Settlements", "Categories"];

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = parseInt(id, 10);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Expenses",
  );
  const [showDeleteHousehold, setShowDeleteHousehold] = useState(false);
  const toast = useToast();

  const { data: household, isLoading } = useQuery({
    queryKey: ["household", householdId],
    queryFn: () => householdApi.getById(householdId).then((r) => r.data),
  });

  const deleteHousehold = useMutation({
    mutationFn: () => householdApi.remove(householdId),
    onSuccess: () => {
      toast("Household deleted");
      navigate("/dashboard");
    },
    onError: () => toast("Failed to delete household", "error"),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <p className="text-gray-500">Household not found</p>
      </AppLayout>
    );
  }

  const isOwner = household.owner_id === user?.id;

  return (
    <AppLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{household.name}</h1>
          {household.description && (
            <p className="text-gray-500 mt-1">{household.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportButton householdId={householdId} />
          {isOwner && (
            <button
              onClick={() => setShowDeleteHousehold(true)}
              className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
            >
              Delete household
            </button>
          )}
        </div>
      </div>

      <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 flex justify-center">
        <nav className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-none ${
                activeTab === tab
                  ? "bg-teal-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-teal-50 hover:text-teal-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Expenses" && (
        <HouseholdExpenses household={household} householdId={householdId} />
      )}
      {activeTab === "Balances" && (
        <HouseholdBalances householdId={householdId} />
      )}
      {activeTab === "Members" && (
        <HouseholdMembers
          household={household}
          householdId={householdId}
          user={user}
        />
      )}
      {activeTab === "Settlements" && (
        <HouseholdSettlements household={household} householdId={householdId} />
      )}
      {activeTab === "Categories" && (
        <HouseholdCategories
          household={household}
          householdId={householdId}
          user={user}
        />
      )}

      <ConfirmDialog
        open={showDeleteHousehold}
        title="Delete household"
        message="Are you sure you want to delete this household? All expenses, settlements, and member data will be permanently removed."
        onConfirm={() => {
          deleteHousehold.mutate();
          setShowDeleteHousehold(false);
        }}
        onCancel={() => setShowDeleteHousehold(false)}
      />
    </AppLayout>
  );
}