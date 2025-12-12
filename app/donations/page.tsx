"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DonationDto } from "../api/donations/dto/donation.dto";
import DonationModal, { Permission } from "./donation-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { Download, Plus } from "lucide-react";

enum Modals {
  DONATION,
  REMOVE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<DonationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedData, setSelectedData] = useState<DonationDto | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );

  async function retrieveDonations() {
    setIsLoading(true);
    fetch("/api/donations")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => DonationDto.parse(obj)))
      .then((data) => setData(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function deleteDonation(id: string) {
    fetch(`/api/donations?id=${id}`, {
      method: "DELETE",
    }).then(() => {
      setData((prev) => prev.filter((donation) => donation.id !== id));
    });
  }

  useEffect(() => {
    retrieveDonations();
  }, []);

  function openModal(modal: Modals, id?: string) {
    const foundSelected = data.find((donation) => donation.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveDonations();
    setModalPermission(Permission.READ);
    setOpennedModal(Modals.NONE);
    setSelectedData(null);
  }

  async function onExport() {
    setIsLoading(true);
    fetch("/api/donations/export")
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


  function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(Modals.DONATION, id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(Modals.DONATION, id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal(Modals.DONATION);
  }

  function onRemove(id: string) {
    openModal(Modals.REMOVE, id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Donations
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => onExport()}>
            <span className="hidden md:flex"> Exporter les donations </span>
            <Download />
          </Button>
          <Button onClick={() => onCreate()}>
            <span className="hidden md:flex"> Créer une donation </span>
            <Plus />
          </Button>
        </div>

      </div>

      <DonationModal
        data={selectedData}
        open={opennedModal === Modals.DONATION}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ConfirmModal
        open={opennedModal === Modals.REMOVE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && deleteDonation(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de supprimer une donation. Êtes-vous sûr de vouloir continuer ?
      </ConfirmModal>

      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove)}
        isLoading={isLoading}
      />
    </div>
  );
}
