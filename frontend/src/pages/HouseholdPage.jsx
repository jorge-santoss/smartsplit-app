import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import * as householdApi from "../api/householdApi";
import Skeleton, { SkeletonCard } from "../components/Skeleton";
import { useAuth } from "../hooks/useAuth";
import HouseholdOverview from "./household/HouseholdOverview";
import HouseholdExpenses from "./household/HouseholdExpenses";
import HouseholdBalances from "./household/HouseholdBalances";
import HouseholdMembers from "./household/HouseholdMembers";
import HouseholdSettlements from "./household/HouseholdSettlements";

const TABS = ["Overview", "Expenses", "Balances", "Members", "Settlements"];

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const householdId = parseInt(id, 10);
  const [activeTab, setActiveTab] = useState("Overview");

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

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Overview" && (
        <HouseholdOverview
          household={household}
          householdId={householdId}
          onTabChange={setActiveTab}
        />
      )}
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