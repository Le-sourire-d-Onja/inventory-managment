"use client";

import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DonationEntity } from "../api/donations/entity/donation.entity";

export default function Page() {
  const [data, setData] = useState<DonationEntity[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations")
      .then((res) => res.json())
      .then((donations) =>
        donations.map((donation: any) => DonationEntity.parse(donation))
      )
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

  async function onView(id: string) {
    console.log("View");
  }

  async function onEdit(id: string) {
    console.log("Edit");
  }

  async function onRemove(id: string) {
    console.log("Remove");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
        Donations
      </h1>
      <DataTable
        data={data}
        columns={columns(onView, onEdit, onRemove)}
        isLoading={isLoading}
      />
    </div>
  );
}
