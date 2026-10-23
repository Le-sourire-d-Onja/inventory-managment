"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import ContainerModal, { Permission } from "./container-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { Download, Plus } from "lucide-react";
import { StockDto } from "../api/stocks/dto/stock.dto";
import { localeDateOptions, useStateParam } from "@/lib/utils";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { articleTypeFilterOptions } from "./filters";
import { toast } from "sonner";

enum Modals {
  CONTAINER,
  REMOVE,
  TRANSITION,
  NONE,
}

type TransitionAction = "containerize" | "distribute" | "uncontainerize" | "undistribute";

const TRANSITION_SUCCESS: Record<TransitionAction, (id: string) => string> = {
  containerize: (id) => `Contenant N°${id} empoté.`,
  distribute: (id) => `Contenant N°${id} distribué.`,
  uncontainerize: (id) => `Empotage du contenant N°${id} annulé.`,
  undistribute: (id) => `Distribution du contenant N°${id} annulée.`,
};

function formatActDate(value: Date | string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    ...localeDateOptions,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Copy of the confirmation window: identifier, current → target, consequence. */
function transitionExplanation(action: TransitionAction, container: ContainerDto) {
  const id = `N°${container.id}`;
  switch (action) {
    case "containerize":
      return (
        <>
          <p>
            Contenant <strong>{id}</strong> : <strong>Attribué → Empoté</strong>.
          </p>
          <p>
            La date d'empotage sera posée par le serveur. Les Contenus, les agrégats et le
            Stock ne changent pas.
          </p>
          <p>La Demande passera Empotée dès que tous ses contenants seront empotés.</p>
        </>
      );
    case "distribute":
      return (
        <>
          <p>
            Contenant <strong>{id}</strong> : <strong>Empoté → Distribué</strong>.
          </p>
          <p>
            La date de distribution sera posée par le serveur. Les Contenus, les agrégats et
            le Stock ne changent pas.
          </p>
          <p>La Demande passera Distribuée dès que tous ses contenants seront distribués.</p>
        </>
      );
    case "uncontainerize":
      return (
        <>
          <p>
            Contenant <strong>{id}</strong> : <strong>Empoté → Attribué</strong>.
          </p>
          <p>
            La date d'empotage du{" "}
            <strong>{formatActDate(container.containerized_at)}</strong> sera effacée
            définitivement : aucun historique n'est conservé.
          </p>
          <p>
            Le rattachement, les Contenus, les agrégats et le Stock sont conservés. La
            Demande repassera En attente si aucun autre contenant n'est empoté.
          </p>
        </>
      );
    case "undistribute":
      return (
        <>
          <p>
            Contenant <strong>{id}</strong> : <strong>Distribué → Empoté</strong>.
          </p>
          <p>
            La date de distribution du{" "}
            <strong>{formatActDate(container.distributed_at)}</strong> sera effacée
            définitivement : aucun historique n'est conservé.
          </p>
          <p>
            Le rattachement, les Contenus, les agrégats et le Stock sont conservés. La
            Demande repassera Empotée si aucun autre contenant n'est distribué.
          </p>
        </>
      );
  }
}

export default function Page() {
  const [data, setData] = useState<ContainerDto[]>([]);
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [transitionAction, setTransitionAction] = useState<TransitionAction | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    fetch("/api/containers?scope=all")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
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

  async function confirmTransition() {
    if (!selectedData || !transitionAction) return;
    const containerId = selectedData.id;
    setIsTransitioning(true);
    try {
      const response = await fetch("/api/containers", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: containerId, action: transitionAction }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error("Action refusée", {
          description:
            body?.message ??
            "L'état du contenant a changé entre l'affichage et votre clic. Rechargez la page.",
        });
        return;
      }
      const updated = body as ContainerDto;
      setData((prev) => prev.map((container) => (container.id === updated.id ? updated : container)));
      toast.success(TRANSITION_SUCCESS[transitionAction](containerId));
    } catch {
      toast.error("Une erreur s'est produite.", {
        description: "L'action n'a pas pu être enregistrée.",
      });
    } finally {
      setIsTransitioning(false);
      closeTransitionModal();
    }
  }

  function openTransitionModal(id: string, action: TransitionAction) {
    setTransitionAction(action);
    openModal(Modals.TRANSITION, id);
  }

  function closeTransitionModal() {
    setTransitionAction(null);
    setOpennedModal(Modals.NONE);
    setSelectedDataID(null);
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

      <ConfirmModal
        open={opennedModal === Modals.TRANSITION && !!selectedData && !!transitionAction}
        onOpenChange={(open) => !open && !isTransitioning && closeTransitionModal()}
        onConfirm={confirmTransition}
        onCancel={closeTransitionModal}
        pending={isTransitioning}
        closeOnConfirm={false}
      >
        {selectedData && transitionAction && transitionExplanation(transitionAction, selectedData)}
      </ConfirmModal>

      <DataTable
        data={data}
        columns={columns(
          onView,
          onEdit,
          onRemove,
          (id) => openTransitionModal(id, "containerize"),
          (id) => openTransitionModal(id, "distribute"),
          (id) => openTransitionModal(id, "uncontainerize"),
          (id) => openTransitionModal(id, "undistribute"),
        )}
        filters={[
          {
            columnId: "association",
            label: "Association",
            options: data.reduce(
              (prev, curr) => {
                if (curr.association && !prev.map((el) => el.value).includes(curr.association.name))
                  return [...prev, { label: curr.association.name, value: curr.association.name }];
                return prev;
              },
              [] as { label: string; value: string }[],
            ),
          },
          {
            columnId: "content",
            label: "Type d'article",
            multiple: true,
            options: articleTypeFilterOptions(data),
          },
        ]}
        searchColumnId="id"
        isLoading={isLoading}
      />
    </div>
  );
}
