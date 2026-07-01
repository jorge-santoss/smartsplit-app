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
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
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
            className="w-full sm:flex-1 px-3 py-2 border border-white/10 bg-white/5 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
            required
          />
          <button
            type="submit"
            disabled={addMemberMutation.isPending}
            className="w-full sm:w-auto bg-[#FCEA3C] text-[#121212] px-4 py-2 rounded-lg hover:brightness-105 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
          >
            {addMemberMutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {owner && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Owner
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={owner.name} size="md" className="bg-[#FCEA3C] text-[#121212]" />
              <div>
                <p className="font-medium text-white">{owner.name}</p>
                <p className="text-xs text-gray-400">{owner.email}</p>
              </div>
            </div>
            <span className="text-xs bg-white/10 text-[#FCEA3C] px-3 py-1 rounded-full font-medium border border-white/10">
              owner
            </span>
          </div>
        </div>
      )}

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Members ({others.length})
          </h2>
        </div>
        {others.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No other members.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {others.map((m) => (
              <div
                key={m.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="md" className="bg-white/10 text-[#FCEA3C]" />
                  <div>
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/10 text-[#FCEA3C] px-3 py-1 rounded-full font-medium border border-white/10">
                    {m.role}
                  </span>
                  {household.owner_id === user.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmRemove({ id: m.id, name: m.name })
                      }
                      className="text-gray-400 hover:text-[#FF6B6B] transition-colors"
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