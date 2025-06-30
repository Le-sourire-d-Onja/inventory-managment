import { prisma } from "@/services/prisma";
import { DonationsClient } from "./donations-client";

export default async function DonationsServer() {
    const [donations, articleTypes] = await Promise.all([
        prisma.donation.findMany({
            include: {
                articles: {
                    include: {
                        type: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.articleType.findMany()
    ]);

    return <DonationsClient donations={donations} articleTypes={articleTypes} />;
}