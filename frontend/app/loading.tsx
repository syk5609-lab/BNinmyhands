import { RankingsSkeleton } from "@/components/dashboard/rankings-table";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1600px] p-4">
      <RankingsSkeleton />
    </main>
  );
}
