export const generateDueDate = (dueDay: number, months: number): Date => {
  const now = new Date();
  const skipThisMonth = now.getUTCDate() < dueDay ? 0 : 1;
  const dueMonth = now.getUTCMonth() + skipThisMonth + months;
  const dueYear = now.getUTCFullYear();

  const dueDate = new Date(dueYear, dueMonth, 0);

  if (dueDay < dueDate.getUTCDate()) {
    dueDate.setDate(dueDay);
  }

  return dueDate;
};
