"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Donation, ArticleType, DonationArticle } from "@/generated/prisma";
import { DeleteDonationDialog } from "./delete-donation-dialog";
import { EditDonationDialog, FormValues } from "./edit-donation-dialog";
import { ViewDonationDialog } from "./view-donation-dialog";
import { createDonation, deleteDonation, updateDonation } from "@/app/actions/donations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type DonationWithArticles = Donation & {
  articles: ({ type: ArticleType } & DonationArticle)[];
};

interface DonationsClientProps {
  donations: DonationWithArticles[];
  articleTypes: ArticleType[];
}

export function DonationsClient({
  donations,
  articleTypes,
}: DonationsClientProps) {
  const router = useRouter();

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour la visualisation et l'édition
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationWithArticles | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDonationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!donationToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteDonation(donationToDelete);

      if (result.success) {
        toast.success("La donation a été supprimée avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setDonationToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      let result;

      if (selectedDonation) {
        // Mise à jour d'une donation existante
        result = await updateDonation(selectedDonation.id, data);
      } else {
        // Création d'une nouvelle donation
        result = await createDonation(data);
      }

      if (result.success) {
        toast.success(
          selectedDonation
            ? "La donation a été mise à jour avec succès"
            : "La donation a été créée avec succès"
        );
        setEditDialogOpen(false);
        setViewDialogOpen(false);
        router.refresh();
      } else {
        toast.error(
          result.error ||
          (selectedDonation
            ? "Une erreur est survenue lors de la mise à jour"
            : "Une erreur est survenue lors de la création")
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewClick = (donation: DonationWithArticles) => {
    setSelectedDonation(donation);
    setViewDialogOpen(true);
  };

  const handleEditClick = (donation: DonationWithArticles) => {
    setSelectedDonation(donation);
    setEditDialogOpen(true);
  };

  const handleEditFromView = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const onCreateClick = () => {
    setSelectedDonation(null);
    setEditDialogOpen(true);
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Donations</h1>
        <Button onClick={onCreateClick}>Créer une donation</Button>
      </div>

      <DataTable
        columns={columns(handleViewClick, handleDeleteClick, handleEditClick)}
        data={donations}
      />

      <DeleteDonationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <ViewDonationDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        donation={selectedDonation}
      />

      <EditDonationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        donation={selectedDonation}
        articleTypes={articleTypes}
        onSave={handleEditSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
