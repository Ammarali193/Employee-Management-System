import { ModulePage } from "@/components/layout/module-page";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;

  return <ModulePage pageId="employees.detail" employeeId={id} />;
}
