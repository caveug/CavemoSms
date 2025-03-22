export function twMerge(...classLists: string[]): string {
  // This is a simplified version of tailwind-merge
  // In a real app, you would use the actual tailwind-merge package
  return classLists.filter(Boolean).join(" ");
}
