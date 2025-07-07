"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DonationEntity } from "../api/donations/entity/donation.entity";
import DonationModal, { Permission } from "./donation-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";

enum Modals {
  DONATION,
  REMOVE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<DonationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedData, setSelectedData] = useState<DonationEntity | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );

  async function retrieveDonations() {
    fetch("/api/donations")
      .then((res) => res.json())
      .then((donations) =>
        donations.map((donation: any) => DonationEntity.parse(donation))
      )
      .then((res) => {
        setData(res);
        setLoading(false);
      });
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
        <Button onClick={() => onCreate()}>Créer une donation</Button>
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
        Vous êtes sur le point de supprimer la demande de{" "}
        {selectedData?.name ?? "Inconnu"}. Êtes-vous sûr de vouloir continuer ?
      </ConfirmModal>

      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove)}
        isLoading={isLoading}
      />
    </div>
  );
}
