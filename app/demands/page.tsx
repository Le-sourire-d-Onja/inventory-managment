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
import ScanModal from "./scan-modal";
import { Camera, Plus } from "lucide-react";
import { useDevices } from "@yudiel/react-qr-scanner";
import { StockEntity } from "../api/stocks/entity/stock.entity";

enum Modals {
  SCAN,
  DEMAND,
  REMOVE,
  VALIDATE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<DemandEntity[]>([]);
  const [stocks, setStocks] = useState<StockEntity[]>([]);
  const [associations, setAssociations] = useState<AssociationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedData, setSelectedData] = useState<DemandEntity | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );
  const devices = useDevices();

  async function retrieveDemands() {
    setIsLoading(true);
    fetch("/api/demands")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => DemandEntity.parse(obj)))
      .then((data) => setData(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveAssociations() {
    setIsLoading(true);
    fetch("/api/associations")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => AssociationEntity.parse(obj)))
      .then((res) => setAssociations(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveStocks() {
    setIsLoading(true);
    fetch("/api/stocks")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => StockEntity.parse(obj)))
      .then((res) => setStocks(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveData() {
    retrieveDemands();
    retrieveAssociations();
    retrieveStocks();
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
      containers: demand.containers.map((container) => ({
        ...container,
        contents: container.contents.map((content) => ({
          ...content,
          typeID: content.type.id,
        })),
      })),
      status: DemandStatus.VALIDATED,
      associationID: association.id,
    } as CreateDemandEntity;
    const response = await fetch(`/api/demands`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      retrieveData();
    } else {
      toast("Une erreur à s'est produite.", {
        description: response.status,
      });
    }
  }

  useEffect(() => {
    retrieveData();
  }, []);

  function openModal(modal: Modals, id?: string) {
    const foundSelected = data.find((demand) => demand.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) {
      retrieveData();
    }
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

  function onScan() {
    openModal(Modals.SCAN);
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
        <div className="flex gap-2">
          {devices.length !== 0 && (
            <Button onClick={() => onScan()}>
              <span className="hidden md:flex"> Scanner une demande </span>
              <Camera />
            </Button>
          )}

          <Button onClick={() => onCreate()}>
            <span className="hidden md:flex"> Créer une demande </span>
            <Plus />
          </Button>
        </div>
      </div>

      <DemandModal
        data={selectedData}
        stocks={stocks}
        associations={associations}
        open={opennedModal === Modals.DEMAND}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ScanModal
        open={opennedModal === Modals.SCAN}
        onOpenChange={closeModal}
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
        columns={columns(stocks, onView, onEdit, onRemove, onValidate)}
        isLoading={isLoading}
      />
    </div>
  );
}
