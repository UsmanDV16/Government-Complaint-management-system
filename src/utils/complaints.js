export const statusLabelMap = {
  unresolved: "Unresolved",
  department_resolving: "Department Resolving",
  citizen_verifying: "Awaiting Citizen's Verification",
  accepted: "Accepted",
  declined: "Declined",
  admin_reviewing: "Under Admin Review",
  reassigned: "Reassigned"
};

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  // Show both date and time for clarity
  return date.toLocaleString();
}
