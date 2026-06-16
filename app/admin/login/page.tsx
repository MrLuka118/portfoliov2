import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg">
            <span className="font-medium">Luka</span>{" "}
            <span className="font-serif italic text-accent">Photography</span>
          </p>
          <p className="mt-2 text-xs uppercase tracking-label text-muted-foreground">
            Admin panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
