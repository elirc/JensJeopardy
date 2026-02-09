import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/games");

  return (
    <div className="flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Create Account
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
