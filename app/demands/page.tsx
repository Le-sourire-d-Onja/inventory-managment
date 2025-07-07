"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import DemandModal, { Permission } from "./demand-modal";
import { Button } from "@/components/ui/button";
import { AssociationEntity } from "../api/associations/entity/association.entity";

export default function Page() {
  const [data, setData] = useState<DemandEntity[]>([]);
  const [associations, setAssociations] = useState<AssociationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<DemandEntity | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );

  async function retrieveDemands() {
    fetch("/api/demands")
      .then((res) => res.json())
      .then((demands) =>
        demands.map((demand: any) => DemandEntity.parse(demand))
      )
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }

  async function retrieveAssociations() {
    fetch("/api/associations")
      .then((res) => res.json())
      .then((associations) =>
        associations.map((association: any) =>
          AssociationEntity.parse(association)
        )
      )
      .then((res) => setAssociations(res));
  }

  async function deleteDemand(id: string) {
    fetch(`/api/demands?id=${id}`, {
      method: "DELETE",
    }).then(() => {
      setData((prev) => prev.filter((demand) => demand.id !== id));
    });
  }

  useEffect(() => {
    retrieveDemands();
    retrieveAssociations();
  }, []);

  function openModal(id?: string) {
    const foundSelected = data.find((demand) => demand.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(true);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveDemands();
    setModalPermission(Permission.READ);
    setOpennedModal(false);
    setSelectedData(null);
  }

  function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal();
  }

  function onRemove(id: string) {
    deleteDemand(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Demandes
        </h1>
        <Button onClick={() => onCreate()}>Créer une demande</Button>
      </div>

      <DemandModal
        data={selectedData}
        associations={associations}
        open={opennedModal}
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
