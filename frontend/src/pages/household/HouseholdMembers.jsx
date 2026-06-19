import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as householdApi from "../../api/householdApi";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import Avatar from "../../components/Avatar";
import { Trash2 } from "lucide-react";

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
      <div className="bg-white p-6 rounded-xl border border-white/80 shadow-sm">
        <h2 className="text-lg font-semibold text-[#154535] mb-4">
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
            className="w-full sm:flex-1 px-3 py-2 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
            required
          />
          <button
            type="submit"
            disabled={addMemberMutation.isPending}
            className="w-full sm:w-auto bg-[#154535] text-white px-4 py-2 rounded-lg hover:bg-[#1b5c48] disabled:opacity-50 transition-colors shadow-sm"
          >
            {addMemberMutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {owner && (
        <div className="bg-white rounded-xl border border-white/80 shadow-sm">
          <div className="p-4 border-b border-[#E1EEE8]">
            <h2 className="text-sm font-semibold text-[#4A6B5D] uppercase tracking-wide">
              Owner
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={owner.name} size="md" className="bg-[#154535] text-white" />
              <div>
                <p className="font-medium text-[#154535]">{owner.name}</p>
                <p className="text-xs text-[#4A6B5D]">{owner.email}</p>
              </div>
            </div>
            <span className="text-xs bg-[#E1EEE8] text-[#154535] px-3 py-1 rounded-full font-medium">
              owner
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-white/80 shadow-sm">
        <div className="p-4 border-b border-[#E1EEE8]">
          <h2 className="text-sm font-semibold text-[#4A6B5D] uppercase tracking-wide">
            Members ({others.length})
          </h2>
        </div>
        {others.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#4A6B5D]">
            No other members.
          </div>
        ) : (
          <div className="divide-y divide-[#E1EEE8]">
            {others.map((m) => (
              <div
                key={m.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="md" className="bg-[#E1EEE8] text-[#154535]" />
                  <div>
                    <p className="font-medium text-[#154535]">{m.name}</p>
                    <p className="text-xs text-[#4A6B5D]">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#E1EEE8] text-[#154535] px-3 py-1 rounded-full font-medium">
                    {m.role}
                  </span>
                  {household.owner_id === user.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmRemove({ id: m.id, name: m.name })
                      }
                      className="text-[#4A6B5D] hover:text-[#D94A4A] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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