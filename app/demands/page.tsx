"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import DemandModal, { Permission } from "./demand-modal";
import { Button } from "@/components/ui/button";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import { DemandStatus } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { CreateDemandEntity } from "../api/demands/entity/create-demand.entity";
import ConfirmModal from "@/components/confirm-modal";

enum Modals {
  DEMAND,
  REMOVE,
  VALIDATE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<DemandEntity[]>([]);
  const [associations, setAssociations] = useState<AssociationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
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

  async function validateDemand(id: string) {
    const foundSelected = data.find((demand) => demand.id === id);
    if (!foundSelected) {
      return;
    }
    const { association, ...demand } = foundSelected;
    const body = {
      ...demand,
      status: DemandStatus.DONE,
      associationID: association.id,
    } as CreateDemandEntity;
    const response = await fetch(`/api/demands`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      retrieveDemands();
    } else {
      toast("Une erreur à s'est produite.", {
        description: response.status,
      });
    }
  }

  useEffect(() => {
    retrieveDemands();
    retrieveAssociations();
  }, []);

  function openModal(modal: Modals, id?: string) {
    const foundSelected = data.find((demand) => demand.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveDemands();
    setModalPermission(Permission.READ);
    setOpennedModal(Modals.NONE);
    setSelectedData(null);
  }

  function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(Modals.DEMAND, id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(Modals.DEMAND, id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal(Modals.DEMAND);
  }

  function onValidate(id: string) {
    openModal(Modals.VALIDATE, id);
  }

  function onRemove(id: string) {
    openModal(Modals.REMOVE, id);
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
        open={opennedModal === Modals.DEMAND}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ConfirmModal
        open={opennedModal === Modals.REMOVE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && deleteDemand(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de supprimer la demande pour l'association{" "}
        {selectedData?.association.name ?? "Inconnue"}. Êtes-vous sûr de vouloir
        continuer ?
      </ConfirmModal>

      <ConfirmModal
        open={opennedModal === Modals.VALIDATE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && validateDemand(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de valider la demande pour l'association{" "}
        {selectedData?.association.name ?? "Inconnue"}. Êtes-vous sûr de vouloir
        continuer ?
      </ConfirmModal>

      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove, onValidate)}
        isLoading={isLoading}
      />
    </div>
  );
}
