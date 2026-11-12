import { CardSkeleton, HeaderSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading account">
      <HeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
        <div />
        <CardSkeleton lines={4} className="max-w-2xl" />
      </div>
    </div>
  );
}
