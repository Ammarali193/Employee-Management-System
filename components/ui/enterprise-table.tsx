"use client";

import type { ReactNode } from "react";

type EnterpriseColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
};

type EnterpriseTableProps<Row> = {
  rows: Row[];
  columns: EnterpriseColumn<Row>[];
  rowKey: (row: Row, index: number) => string | number;
  emptyLabel?: string;
};

export function EnterpriseTable<Row>({ rows, columns, rowKey, emptyLabel = "No records found" }: EnterpriseTableProps<Row>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={Math.max(columns.length, 1)}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-t border-slate-200 align-top text-slate-800">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
