import { HeaderSkeleton, ListSkeleton, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading clients">
      <HeaderSkeleton />
      <Skeleton className="mb-5 h-10 w-full max-w-sm rounded-lg" />
      <ListSkeleton rows={6} />
    </div>
  );
}
