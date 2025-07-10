"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import ArticleTypeModal, { Permission } from "./article-types-modal";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/confirm-modal";
import { ArticleType } from "@/lib/generated/prisma";
import { Plus } from "lucide-react";

enum Modals {
  ARTICLE_TYPES,
  REMOVE,
  NONE,
}

export default function Page() {
  const [data, setData] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opennedModal, setOpennedModal] = useState<Modals>(Modals.NONE);
  const [selectedData, setSelectedData] = useState<ArticleType | null>(null);
  const [modalPermission, setModalPermission] = useState<Permission>(
    Permission.READ
  );

  async function retrieveArticleTypes() {
    setIsLoading(true);
    fetch("/api/article-types")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function deleteArticleType(id: string) {
    fetch(`/api/article-types?id=${id}`, {
      method: "DELETE",
    }).then(() => {
      setData((prev) => prev.filter((articleType) => articleType.id !== id));
    });
  }

  useEffect(() => {
    retrieveArticleTypes();
  }, []);

  function openModal(modal: Modals, id?: string) {
    const foundSelected =
      data.find((articleType) => articleType.id === id) ?? null;
    setSelectedData(foundSelected);
    setOpennedModal(modal);
  }

  function closeModal(open: boolean) {
    if (open) return;
    if (modalPermission === Permission.WRITE) retrieveArticleTypes();
    setModalPermission(Permission.READ);
    setOpennedModal(Modals.NONE);
    setSelectedData(null);
  }

  function onView(id: string) {
    setModalPermission(Permission.READ);
    openModal(Modals.ARTICLE_TYPES, id);
  }

  function onEdit(id: string) {
    setModalPermission(Permission.WRITE);
    openModal(Modals.ARTICLE_TYPES, id);
  }

  function onCreate() {
    setModalPermission(Permission.WRITE);
    openModal(Modals.ARTICLE_TYPES);
  }

  function onRemove(id: string) {
    openModal(Modals.REMOVE, id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Type d'article
        </h1>
        <Button onClick={() => onCreate()}>
          <span className="hidden md:flex"> Créer un type d'article </span>
          <Plus />
        </Button>
      </div>

      <ArticleTypeModal
        data={selectedData}
        open={opennedModal === Modals.ARTICLE_TYPES}
        onOpenChange={closeModal}
        permission={modalPermission}
      />

      <ConfirmModal
        open={opennedModal === Modals.REMOVE}
        onOpenChange={closeModal}
        onConfirm={() => selectedData && deleteArticleType(selectedData.id)}
        onCancel={() => closeModal(false)}
      >
        Vous êtes sur le point de supprimer le type d'article{" "}
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
