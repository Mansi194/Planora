export function budgetTotals(allocation: number[], budget: number) {
  const spent = allocation.reduce((sum, cost) => sum + cost, 0);
  return { spent, remaining: budget - spent };
}

export function toggleTask<T extends { id: number; done: boolean }>(tasks: T[], id: number): T[] {
  return tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
}