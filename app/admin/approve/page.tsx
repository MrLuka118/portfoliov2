import { ApproveLogin } from "@/components/admin/approve-login";

// Stran je pod /admin, zato jo middleware zaščiti: telefon mora biti prijavljen.
export const dynamic = "force-dynamic";

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg">
            <span className="font-medium">Luka</span>{" "}
            <span className="font-serif italic text-accent">Photography</span>
          </p>
          <p className="mt-2 text-xs uppercase tracking-label text-muted-foreground">
            Potrditev prijave
          </p>
        </div>
        <ApproveLogin token={token ?? null} />
      </div>
    </div>
  );
}
