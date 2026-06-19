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
        <div className="min-h-screen bg-[#E1EEE8] p-4 sm:p-6 lg:p-8">
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
        <div className="min-h-screen bg-[#E1EEE8] p-4 sm:p-6 lg:p-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm p-6">
            <p className="text-[#4A6B5D]">Household not found</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwner = household.owner_id === user?.id;

  return (
    <AppLayout>
      {/* Mint Green Page Wrapper */}
      <div className="min-h-screen bg-[#E1EEE8] p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#154535] tracking-tight">
              {household.name}
            </h1>
            {household.description && (
              <p className="text-[#4A6B5D] mt-1 font-medium">
                {household.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportButton householdId={householdId} />
            {isOwner && (
              <button
                onClick={() => setShowDeleteHousehold(true)}
                className="text-sm text-[#D94A4A] border border-[#D94A4A]/30 rounded-lg px-3 py-2 hover:bg-[#D94A4A]/10 transition-colors"
              >
                Delete household
              </button>
            )}
          </div>
        </div>

 {/* Glassmorphism Tab Navigation */}
        <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 flex justify-center">
          <nav className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-full shadow-[0_8px_30px_-6px_rgba(21,69,53,0.08)] p-1.5 flex gap-1 overflow-x-auto w-full sm:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                  activeTab === tab
                    ? "bg-[#154535] text-white shadow-sm"
                    : "text-[#4A6B5D] hover:bg-white/60 hover:text-[#154535]"
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