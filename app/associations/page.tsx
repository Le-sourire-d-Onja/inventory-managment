"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import AssociationModal, { Permission } from "./association-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { Plus } from "lucide-react";

enum Modals {
  ASSOCIATION,
  REMOVE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<AssociationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Associations
        </h1>
        <Button onClick={() => onCreate()}>
          <span className="hidden md:flex"> Créer une association </span>
          <Plus />
        </Button>
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
        columns={columns(onView, onEdit, onRemove)}
        isLoading={isLoading}
      />
    </div>
  );
}
