'use server';

import { prisma } from "@/services/prisma";
import { FormValues } from "../donations/edit-donation-dialog";

export async function deleteDonation(id: string) {
  try {
    await prisma.donation.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression de la donation:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de la suppression de la donation'
    };
  }
}

export async function createDonation(data: FormValues) {
  try {
    const donation = await prisma.donation.create({
      data: {
        name: data.name,
        description: data.description || "",
        email: data.email,
        phone: data.phone || "",
        articles: {
          create: data.articles?.map(article => ({
            typeID: article.typeID,
            quantity: article.quantity,
            value: article.value
          })) || []
        }
      },
      include: {
        articles: true
      }
    });
    return { success: true, data: donation };
  } catch (error) {
    console.error("Error creating donation:", error);
    return { success: false, error: "Erreur lors de la création de la donation" };
  }
}

export async function updateDonation(id: string, data: FormValues) {
  try {
    // Récupérer les IDs des articles existants
    const existingArticles = await prisma.donationArticle.findMany({
      where: { donationID: id },
      select: { id: true }
    });

    const existingArticleIds = existingArticles.map(article => article.id);
    const updatedArticleIds = data.articles
      ?.filter(article => article.id) // Garder uniquement les articles avec un ID existant
      .map(article => article.id) || [];

    // Identifier les articles à supprimer
    const articlesToDelete = existingArticleIds.filter(
      id => !updatedArticleIds.includes(id)
    );

    // Supprimer les articles qui ne sont plus dans la mise à jour
    if (articlesToDelete.length > 0) {
      await prisma.donationArticle.deleteMany({
        where: {
          id: { in: articlesToDelete }
        }
      });
    }

    // Mettre à jour la donation
    const donation = await prisma.donation.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || "",
        email: data.email,
        phone: data.phone || "",
        articles: {
          upsert: data.articles?.map(article => ({
            where: { id: article.id || "" },
            update: {
              typeID: article.typeID,
              quantity: article.quantity,
              value: article.value
            },
            create: {
              typeID: article.typeID,
              quantity: article.quantity,
              value: article.value
            }
          })) || []
        }
      },
      include: {
        articles: true
      }
    });

    return { success: true, data: donation };
  } catch (error) {
    console.error("Error updating donation:", error);
    return { success: false, error: "Erreur lors de la mise à jour de la donation" };
  }
}
