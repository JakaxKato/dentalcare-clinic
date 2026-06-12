const DAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_WORKING_HOURS = { start: '09:00', end: '17:00' };
const DEFAULT_AVAILABLE_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const toMinutes = (time) => {
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const toDateKey = (input) => {
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const dateRangeUtc = (input) => {
  const key = toDateKey(input);
  if (!key) return null;
  return {
    key,
    start: new Date(`${key}T00:00:00.000Z`),
    end: new Date(`${key}T23:59:59.999Z`),
  };
};

const getDateKeyInTimeZone = (date = new Date(), timeZone = 'Asia/Jakarta') => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const getDayCode = (input) => {
  const key = toDateKey(input);
  if (!key) return '';
  return DAY_CODES[new Date(`${key}T00:00:00.000Z`).getUTCDay()];
};

const getSchedule = (profile = {}) => ({
  availableDays:
    Array.isArray(profile.availableDays) && profile.availableDays.length
      ? profile.availableDays
      : DEFAULT_AVAILABLE_DAYS,
  workingHours: {
    start: profile.workingHours?.start || DEFAULT_WORKING_HOURS.start,
    end: profile.workingHours?.end || DEFAULT_WORKING_HOURS.end,
  },
});

const isWorkingDay = (profile, date) => {
  const schedule = getSchedule(profile);
  return schedule.availableDays.includes(getDayCode(date));
};

const isWithinWorkingHours = (profile, time, duration = 30) => {
  const schedule = getSchedule(profile);
  const start = toMinutes(schedule.workingHours.start);
  const end = toMinutes(schedule.workingHours.end);
  const appointmentStart = toMinutes(time);
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    Number.isFinite(appointmentStart) &&
    appointmentStart >= start &&
    appointmentStart + Number(duration || 30) <= end
  );
};

const intervalsOverlap = (startA, durationA, startB, durationB) => {
  const a = toMinutes(startA);
  const b = toMinutes(startB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return a < b + Number(durationB || 30) && b < a + Number(durationA || 30);
};

const buildAvailableSlots = ({
  profile,
  date,
  duration = 30,
  appointments = [],
  step = 30,
}) => {
  if (!isWorkingDay(profile, date)) return [];
  const { workingHours } = getSchedule(profile);
  const start = toMinutes(workingHours.start);
  const end = toMinutes(workingHours.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];

  const slots = [];
  for (let cursor = start; cursor + duration <= end; cursor += step) {
    const time = toTime(cursor);
    const occupied = appointments.some((appt) =>
      intervalsOverlap(
        time,
        duration,
        appt.appointmentTime,
        appt.serviceId?.duration || appt.duration || 30
      )
    );
    if (!occupied) slots.push(time);
  }
  return slots;
};

module.exports = {
  DAY_CODES,
  toMinutes,
  toTime,
  toDateKey,
  dateRangeUtc,
  getDateKeyInTimeZone,
  getDayCode,
  getSchedule,
  isWorkingDay,
  isWithinWorkingHours,
  intervalsOverlap,
  buildAvailableSlots,
};
