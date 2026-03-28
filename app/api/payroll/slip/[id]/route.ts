import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || '3';
  const year = searchParams.get('year') || '2026';

  // Mock payslip data
  const mockPayslip = {
    employee_name: `Employee ${id}`,
    salary: 50000,
    month,
    year: parseInt(year),
    deductions: 5000,
    net_salary: 45000
  };

  return NextResponse.json(mockPayslip);
}

