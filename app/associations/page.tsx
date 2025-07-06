"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import AssociationModal, { Permission } from "./association-modal";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [data, setData] = useState<AssociationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<AssociationEntity | null>(
    null
  );
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );

  async function retrieveAssociations() {
    fetch("/api/associations")
      .then((res) => res.json())
      .then((associations) =>
        associations.map((association: any) =>
          AssociationEntity.parse(association)
        )
      )
      .then((res) => {
        setData(res);
        setLoading(false);
      });
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

  function openModal(id?: string) {
    const foundSelected =
      data.find((association) => association.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(true);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveAssociations();
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
    deleteAssociation(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Associations
        </h1>
        <Button onClick={() => onCreate()}>Créer une association</Button>
      </div>

      <AssociationModal
        data={selectedData}
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
