"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DemandDto } from "../api/demands/dto/demand.dto";
import DemandModal, { Permission } from "./demand-modal";
import { Button } from "@/components/ui/button";
import { AssociationDto } from "../api/associations/dto/association.dto";
import { DemandStatus } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { CreateDemandDto } from "../api/demands/dto/create-demand.dto";
import ConfirmModal from "@/components/confirm-modal";
import ScanModal from "./scan-modal";
import { Camera, Plus } from "lucide-react";
import { useDevices } from "@yudiel/react-qr-scanner";
import { StockEntity } from "../api/stocks/entity/stock.entity";
import { useStateParam } from "@/lib/utils";
import { generatePdf } from "@/lib/pdf";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { UpdateDemandDto } from "../api/demands/dto/update-demand.entity";

enum Modals {
  SCAN,
  DEMAND,
  REMOVE,
  VALIDATE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<DemandDto[]>([]);
  const [stocks, setStocks] = useState<StockEntity[]>([]);
  const [associations, setAssociations] = useState<AssociationDto[]>([]);
  const [containers, setContainers] = useState<ContainerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedDataID, setSelectedDataID] = useStateParam("selected-data-id");
  const selectedData =
    data.find((demand) => demand.id === selectedDataID) ?? null;
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );
  const devices = useDevices();

  useEffect(() => {
    retrieveData();
  }, []);

  useEffect(() => {
    if (!selectedDataID || opennedModal !== Modals.NONE) return;
    openModal(Modals.DEMAND, selectedDataID);
  }, [selectedDataID]);

  async function retrieveDemands() {
    setIsLoading(true);
    fetch("/api/demands")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => DemandDto.parse(obj)))
      .then((data) => setData(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

    async function retrieveContainers() {
    setIsLoading(true);
    fetch("/api/containers")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => ContainerDto.parse(obj)))
      .then((data) => setContainers(data))
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
      .then((res) => res.map((obj: any) => AssociationDto.parse(obj)))
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
    retrieveContainers();
  }

  async function deleteDemand(id: string) {
    fetch(`/api/demands?id=${id}`, {
      method: "DELETE",
    }).then(() => {
      setData((prev) => prev.filter((demand) => demand.id !== id));
    }).then(() => {
      retrieveStocks();
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
      status: DemandStatus.VALIDATED,
      containers: demand.containers.map((container) => ({
        ...container,
        contents: container.contents.map((content) => ({
          ...content,
          type_id: content.type.id
        }))
      })),
      association_id: association.id,
    } as UpdateDemandDto;
    
    const response = await fetch(`/api/demands`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      retrieveData();
    } else {
      toast("Une erreur s'est produite.", {
        description: response.status,
      });
    }
  }

  async function downloadDemand(id: string) {
    const demand = data.find((demand) => demand.id === id);
    if (!demand) {
      throw new Error("Demand not found");
    }
    const labelInfos = DemandDto.toLabelInfos(demand);
    const pdfBase64 = await generatePdf(labelInfos);
    var link = document.createElement("a"); //Create <a>
    link.href = "data:application/pdf;base64," + pdfBase64; //Image Base64 Goes here
    link.download = "etiquette.pdf"; //File name Here
    link.click();
  }

  function openModal(modal: Modals, id?: string) {
    setSelectedDataID(id ?? null);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) {
      retrieveData();
    }
    setModalPermission(Permission.READ);
    setOpennedModal(Modals.NONE);
    setSelectedDataID(null);
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
        containers={containers}
        open={opennedModal === Modals.DEMAND}
        onOpenChange={closeModal}
        permission={modalPermission}
        refetch={retrieveDemands}
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
        columns={columns(
          stocks,
          onView,
          onEdit,
          onRemove,
          onValidate,
          downloadDemand
        )}
        isLoading={isLoading}
      />
    </div>
  );
}
