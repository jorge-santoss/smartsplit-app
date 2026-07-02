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
        <div className="min-h-screen bg-[#121214] p-4 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#121214] p-4 sm:p-6 lg:p-8">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-xl p-6">
            <p className="text-[#9CA3AF]">Household not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwner = household.owner_id === user?.id;

  return (
    <AppLayout>
      {/* Minimalist Dark Flat Design Layout referencing the image aesthetic */}
      <div className="min-h-screen bg-[#121214] p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {household.name}
            </h1>
            {household.description && (
              <p className="text-[#9CA3AF] mt-1 font-medium">
                {household.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportButton householdId={householdId} />
            {isOwner && (
              <button
                onClick={() => setShowDeleteHousehold(true)}
                className="text-sm text-[#FB7185] border border-[#FB7185]/30 rounded-lg px-3 py-2 hover:bg-[#FB7185]/10 transition-colors"
              >
                Delete household
              </button>
            )}
          </div>
        </div>

        {/* Solid Dark Card Tab Navigation */}
        <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 flex justify-center">
          <nav className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-lg shadow-black/50 rounded-full p-1.5 flex gap-1 overflow-x-auto w-full sm:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                  activeTab === tab
                    ? "bg-[#2DD4BF] text-[#121214] shadow-lg shadow-teal-400/25"
                    : "text-[#9CA3AF] hover:bg-[#2C2C2E] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Area */}
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
      </div>
    </AppLayout>
  );
}