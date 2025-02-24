import ExamPage from "@/components/forms/ExamForm";
import { auth } from "@clerk/nextjs/server";

export default async function ExamsPage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return <ExamPage role={role} />;
}