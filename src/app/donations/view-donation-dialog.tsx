// app/donations/view-donation-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DonationWithArticles } from "./donations-client";
import { DonationArticles } from "@/components/donation-articles";

interface ViewDonationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    donation: DonationWithArticles | null;
}

export function ViewDonationDialog({ open, onOpenChange, donation }: ViewDonationDialogProps) {
    if (!donation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Détails de la donation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium">Informations</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nom</p>
                                    <p>{donation.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p>{donation.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p>{donation.phone || "Non renseigné"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p>{new Date(donation.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {donation.description && (
                        <div>
                            <h3 className="font-medium">Description</h3>
                            <p className="mt-2 text-muted-foreground">{donation.description}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="font-medium">Articles</h3>
                        <div className="mt-2">
                            <DonationArticles donation={donation} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}