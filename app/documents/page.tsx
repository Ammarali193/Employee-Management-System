"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import advancedService from "../../services/advancedService";
import { EnterpriseFormSection } from "../../components/ui/enterprise-form-section";
import { EnterpriseTable } from "../../components/ui/enterprise-table";
import { EnterpriseModal } from "../../components/ui/enterprise-modal";

type DocumentRecord = {
  id?: number;
  employee_id?: string;
  employee_name?: string;
  document_name?: string;
  expiry_date?: string;
  is_expiring_soon?: boolean;
  file_url?: string;
  file?: string;
  file_path?: string;
};

const documentUrl = (doc: DocumentRecord) => {
  return doc.file_url || doc.file || doc.file_path || "";
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const payload = await advancedService.getDocuments();
      const rows = Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).data)
          ? ((payload as Record<string, unknown>).data as DocumentRecord[])
          : [];
      setDocuments(rows);
    } catch (error) {
      console.error("[documents] load failed", error);
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async () => {
    if (!employeeId || !documentName || !file) {
      toast.error("Employee ID, document name, and file are required");
      return;
    }

    const formData = new FormData();
    formData.append("employee_id", employeeId);
    formData.append("document_name", documentName);
    formData.append("expiry_date", expiryDate);
    formData.append("file", file);

    setSubmitting(true);
    try {
      await advancedService.createDocument(formData);
      toast.success("Document uploaded");
      setEmployeeId("");
      setDocumentName("");
      setExpiryDate("");
      setFile(null);
      await load();
    } catch (error) {
      console.error("[documents] upload failed", error);
      toast.error("Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const expiringCount = useMemo(
    () => documents.filter((doc) => doc.is_expiring_soon).length,
    [documents],
  );

  return (
    <div className="space-y-6">
      <EnterpriseFormSection
        title="Document Module"
        description="Upload employee documents and track expiry alerts"
        actions={
          <button
            type="button"
            onClick={() => void upload()}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Document name"
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="date"
            title="Expiry date"
            placeholder="Expiry date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="file"
            title="Document file"
            placeholder="Choose a file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </div>
      </EnterpriseFormSection>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Total Documents: <span className="font-semibold text-slate-900">{documents.length}</span>
          {" | "}
          Expiry Alerts: <span className="font-semibold text-red-600">{expiringCount}</span>
        </p>
      </section>

      <EnterpriseTable
        rows={documents}
        emptyLabel="No documents found"
        rowKey={(row: DocumentRecord, index: number) => row.id ?? `document-${index}`}
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row: DocumentRecord) => row.employee_name || row.employee_id || "-",
          },
          {
            key: "document",
            header: "Document",
            render: (row: DocumentRecord) => row.document_name || "-",
          },
          {
            key: "expiry",
            header: "Expiry",
            render: (row: DocumentRecord) => (row.expiry_date ? new Date(row.expiry_date).toLocaleDateString() : "-"),
          },
          {
            key: "alert",
            header: "Alert",
            render: (row: DocumentRecord) => (
              <span
                className={
                  row.is_expiring_soon
                    ? "rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
                    : "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                }
              >
                {row.is_expiring_soon ? "Expiring Soon" : "OK"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row: DocumentRecord) => (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(row)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                >
                  Preview
                </button>
                <a
                  href={documentUrl(row) || "#"}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Download
                </a>
              </div>
            ),
          },
        ]}
      />

      <EnterpriseModal
        open={Boolean(selectedDoc)}
        title="Document Preview"
        onClose={() => setSelectedDoc(null)}
      >
        {selectedDoc ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-slate-900">Employee:</span>{" "}
              {selectedDoc.employee_name || selectedDoc.employee_id || "-"}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Document:</span>{" "}
              {selectedDoc.document_name || "-"}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Expiry:</span>{" "}
              {selectedDoc.expiry_date || "-"}
            </p>
            {documentUrl(selectedDoc) ? (
              <a
                href={documentUrl(selectedDoc)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
              >
                Open File
              </a>
            ) : (
              <p className="text-slate-500">No preview URL available for this document.</p>
            )}
          </div>
        ) : null}
      </EnterpriseModal>
    </div>
  );
}
