import { OperationsShell } from "@/components/OperationsShell";

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperationsShell>{children}</OperationsShell>;
}
