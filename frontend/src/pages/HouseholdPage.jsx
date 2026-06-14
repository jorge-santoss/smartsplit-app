import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import * as householdApi from "../api/householdApi";
import { SkeletonCard } from "../components/Skeleton";
import { useAuth } from "../hooks/useAuth";
import HouseholdExpenses from "./household/HouseholdExpenses";
import HouseholdBalances from "./household/HouseholdBalances";
import HouseholdMembers from "./household/HouseholdMembers";
import HouseholdSettlements from "./household/HouseholdSettlements";

const TABS = ["Expenses", "Balances", "Members", "Settlements"];

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = parseInt(id, 10);
  const [searchParams] = useSearchParams();
const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Expenses");

  const { data: household, isLoading } = useQuery({
    queryKey: ["household", householdId],
    queryFn: () => householdApi.getById(householdId).then((r) => r.data),
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

  return (
    <AppLayout>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
      >
        &larr; Dashboard
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{household.name}</h1>
          {household.description && (
            <p className="text-gray-500 mt-1">{household.description}</p>
          )}
        </div>
      </div>

                <div className="sticky top-16 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 flex justify-center">
        <nav className="bg-white/80 backdrop-blur-md border border-[#c3c6d7] rounded-3xl shadow-sm p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-none ${
                activeTab === tab
                  ? 'bg-[#004ac6] text-white shadow-md'
                  : 'text-[#434655] hover:bg-[#eff4ff]'
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
    </AppLayout>
  );
}