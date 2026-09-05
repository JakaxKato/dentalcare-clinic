// Pure, DB-free helpers for appointment status transitions. Kept separate from
// the controller so the rules are unit-testable without touching Mongoose.

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const canTransition = (from, to) => {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
};

// Maps an appointment status + requester role/identity to the allowed actors.
// Returns an object describing which transitions the requester may perform and
// whether clinical notes can be edited. `appt` must expose patientId and
// dentistId as ObjectIds (or strings).
const getTransitionPermissions = ({ role, appt, currentUserId }) => {
  const isAdmin = role === "admin";
  const isAssignedDentist =
    role === "dentist" && String(appt.dentistId) === String(currentUserId);
  const isOwningPatient =
    role === "patient" && String(appt.patientId) === String(currentUserId);

  return {
    isAdmin,
    isAssignedDentist,
    isOwningPatient,
    canConfirm: isAdmin || isAssignedDentist,
    canComplete: isAdmin || isAssignedDentist,
    canCancel: isAdmin || isAssignedDentist || isOwningPatient,
    canEditClinicalNotes: isAdmin || isAssignedDentist,
  };
};

module.exports = { ALLOWED_TRANSITIONS, canTransition, getTransitionPermissions };
