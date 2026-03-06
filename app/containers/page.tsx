"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import ContainerModal, { Permission } from "./container-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { Download, Plus } from "lucide-react";
import { StockDto } from "../api/stocks/dto/stock.dto";
import { useStateParam } from "@/lib/utils";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { DemandStatus } from "../../lib/generated/prisma";
import { DemandDto } from "../api/demands/dto/demand.dto";

enum Modals {
  CONTAINER,
  REMOVE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<ContainerDto[]>([]);
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedDataID, setSelectedDataID] = useStateParam("selected-data-id");
  const selectedData = data.find((container) => container.id === selectedDataID) ?? null;
  const [modalPermission, setModalPermission] = useState<Permission>(Permission.READ);

  useEffect(() => {
    retrieveData();
  }, []);

  useEffect(() => {
    if (!selectedDataID || opennedModal !== Modals.NONE) return;
    openModal(Modals.CONTAINER, selectedDataID);
  }, [selectedDataID]);

  async function retrieveContainers() {
    setIsLoading(true);
    fetch("/api/containers")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => ContainerDto.parse(obj)))
      .then((data) => setData(data))
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
      .then((res) => res.map((obj: any) => StockDto.parse(obj)))
      .then((res) => setStocks(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveData() {
    retrieveContainers();
    retrieveStocks();
  }

  async function deleteContainer(id: string) {
    fetch(`/api/containers?id=${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setData((prev) => prev.filter((container) => container.id !== id));
      })
      .then(() => {
        retrieveStocks();
      });
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

  async function onExport() {
    setIsLoading(true);
    fetch("/api/containers/export")
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
    openModal(Modals.CONTAINER, id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(Modals.CONTAINER, id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal(Modals.CONTAINER);
  }

  function onRemove(id: string) {
    openModal(Modals.REMOVE, id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">Contenants</h1>
        <div className="flex gap-2">
          <Button onClick={() => onExport()}>
            <span className="hidden md:flex"> Exporter les contenants </span>
            <Download />
          </Button>

          <Button onClick={() => onCreate()}>
            <span className="hidden md:flex"> Créer un contenant </span>
            <Plus />
          </Button>
        </div>
      </div>

      <ContainerModal
        data={selectedData}
        stocks={stocks}
        open={opennedModal === Modals.CONTAINER}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ConfirmModal
        open={opennedModal === Modals.REMOVE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && deleteContainer(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de supprimer un contenant. Êtes-vous sûr de vouloir continuer ?
      </ConfirmModal>

      <DataTable data={data} columns={columns(onView, onEdit, onRemove)} searchColumnId="id" isLoading={isLoading} />
    </div>
  );
}
