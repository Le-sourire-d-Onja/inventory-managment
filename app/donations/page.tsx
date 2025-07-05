"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DonationEntity } from "../api/donations/entity/donation.entity";
import DonationModal, { Permission } from "./donation-modal";

export default function Page() {
  const [data, setData] = useState<DonationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
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

  useEffect(() => {
    retrieveDonations();
  }, []);

  async function openModal(id: string) {
    const foundSelected = data.find((donation) => donation.id === id);
    if (!foundSelected) return;
    setSelectedData(foundSelected);
  }

  async function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveDonations();
    setModalPermission(Permission.READ);
    setSelectedData(null);
  }

  async function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(id);
  }

  async function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(id);
  }

  async function onRemove(id: string) {
    console.log("Remove");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
        Donations
      </h1>

      <DonationModal
        data={selectedData}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove)}
        isLoading={isLoading}
      />
    </div>
  );
}
