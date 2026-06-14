import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as householdApi from "../../api/householdApi";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function HouseholdMembers({ household, householdId, user }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [addEmail, setAddEmail] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const addMemberMutation = useMutation({
    mutationFn: (email) => householdApi.addMember(householdId, email),
    onSuccess: () => {
      toast("Member added!", "success");
      queryClient.invalidateQueries({ queryKey: ["household", householdId] });
      setAddEmail("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to add member", "error");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => householdApi.removeMember(householdId, memberId),
    onSuccess: () => {
      toast("Member removed", "success");
      queryClient.invalidateQueries({ queryKey: ["household", householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to remove member", "error");
    },
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (addEmail.trim()) {
      addMemberMutation.mutate(addEmail.trim());
    }
  };

  const owner = household.members?.find((m) => m.role === "owner");
  const others = household.members?.filter((m) => m.role !== "owner") || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Member
        </h2>
        <form
          onSubmit={handleAddMember}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            placeholder="Email to invite"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={addMemberMutation.isPending}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addMemberMutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {owner && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Owner
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                {owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{owner.name}</p>
                <p className="text-xs text-gray-500">{owner.email}</p>
              </div>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              owner
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Members ({others.length})
          </h2>
        </div>
        {others.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No other members.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {others.map((m) => (
              <div
                key={m.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {m.role}
                  </span>
                  {household.owner_id === user.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmRemove({ id: m.id, name: m.name })
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Member"
        message={`Remove ${confirmRemove?.name} from the household?`}
        onConfirm={() => {
          if (confirmRemove) removeMemberMutation.mutate(confirmRemove.id);
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}