import { Logo } from "@/components/landing/Logo";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <AuthBackground />
      <div className="relative z-[1] mb-8">
        <Logo />
      </div>
      <div className="relative z-[1] w-full max-w-[420px]">{children}</div>
    </div>
  );
}
