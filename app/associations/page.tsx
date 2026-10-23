"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { AssociationDto } from "../api/associations/dto/association.dto";
import AssociationModal, { Permission } from "./association-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

enum Modals {
  ASSOCIATION,
  REMOVE,
  NONE,
}

/**
 * Reads the plain server-provided file name so the per-association export keeps
 * the `association-<nom>-<date>.xlsx` contract instead of a generic
 * "export.xlsx". The server only emits `filename="..."`.
 */
function filenameFromDisposition(
  disposition: string | null,
  fallback: string,
): string {
  if (!disposition) return fallback;
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : fallback;
}

export default function Page() {
  const [data, setData] = useState<AssociationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedData, setSelectedData] = useState<AssociationDto | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ,
  );

  async function retrieveAssociations() {
    setIsLoading(true);
    fetch("/api/associations")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => AssociationDto.parse(obj)))
      .then((data) => setData(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function deleteAssociation(id: string) {
    fetch(`/api/associations?id=${id}`, {
      method: "DELETE",
    }).then(() => {
      setData((prev) => prev.filter((association) => association.id !== id));
    });
  }

  useEffect(() => {
    retrieveAssociations();
  }, []);

  function openModal(modal: Modals, id?: string) {
    const foundSelected =
      data.find((association) => association.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveAssociations();
    setModalPermission(Permission.READ);
    setOpennedModal(Modals.NONE);
    setSelectedData(null);
  }

  async function onExport() {
    setIsLoading(true);
    fetch("/api/associations/export")
      .then((res) => {
        if (res.ok) return res.blob();
        throw res;
      })
      .then((res) => {
        const url = URL.createObjectURL(res);

        const a = document.createElement("a");
        a.href = url;
        a.download = "export.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function onExportAssociation(id: string) {
    setExportingId(id);
    try {
      const res = await fetch(
        `/api/associations/export?id=${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw res;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromDisposition(
        res.headers.get("Content-Disposition"),
        `association-${id}.xlsx`,
      );
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'exporter l'association.");
    } finally {
      setExportingId(null);
    }
  }

  function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(Modals.ASSOCIATION, id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(Modals.ASSOCIATION, id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal(Modals.ASSOCIATION);
  }

  function onRemove(id: string) {
    openModal(Modals.REMOVE, id);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Associations
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => onExport()}>
            <span className="hidden md:flex"> Exporter les associations </span>
            <Download />
          </Button>
          <Button onClick={() => onCreate()}>
            <span className="hidden md:flex"> Créer une association </span>
            <Plus />
          </Button>
        </div>
      </div>

      <AssociationModal
        data={selectedData}
        open={opennedModal === Modals.ASSOCIATION}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ConfirmModal
        open={opennedModal === Modals.REMOVE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && deleteAssociation(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de supprimer l'association{" "}
        {selectedData?.name ?? "Inconnue"}. Êtes-vous sûr de vouloir continuer ?
      </ConfirmModal>

      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove, onExportAssociation, exportingId)}
        searchColumnId="name"
        isLoading={isLoading}
      />
    </div>
  );
}
