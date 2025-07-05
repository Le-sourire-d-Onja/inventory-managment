

export class DonationEntity {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, name: string, createdAt: Date, updatedAt: Date, description: string | null, email: string | null, phone: string | null) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.email = email;
    this.phone = phone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}