import { CardSkeleton, HeaderSkeleton, ListSkeleton, StatsSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <HeaderSkeleton />
      <StatsSkeleton />
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <ListSkeleton rows={4} className="lg:col-span-3" />
        <CardSkeleton className="lg:col-span-2" />
      </div>
    </div>
  );
}
