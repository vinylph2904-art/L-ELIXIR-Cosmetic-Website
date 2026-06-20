import { Injectable } from '@angular/core';
import { Address } from '../data/address.model';

const API_BASE = 'http://localhost:3001/api';

@Injectable({ providedIn: 'root' })
export class AddressService {

  private async getAll(): Promise<Address[]> {
    const response = await fetch(`${API_BASE}/addresses`);
    if (!response.ok) {
      throw new Error('Không thể đọc dữ liệu addresses.');
    }
    return response.json();
  }

  private async saveAll(addresses: Address[]): Promise<void> {
    const response = await fetch(`${API_BASE}/addresses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addresses)
    });

    if (!response.ok) {
      throw new Error('Không thể lưu dữ liệu addresses.');
    }
  }

  async getByUserId(userId: string): Promise<Address[]> {
    return (await this.getAll()).filter(a => a.userId === userId);
  }

  async getDefault(userId: string): Promise<Address | null> {
    const list = await this.getByUserId(userId);
    return list.find(a => a.isDefault) || list[0] || null;
  }

  /** Tạo mới hoặc cập nhật địa chỉ mặc định của user (giữ đơn giản: mỗi user 1 địa chỉ mặc định) */
  async upsertDefault(userId: string, fullAddress: string): Promise<Address> {
    const addresses = await this.getAll();
    const idx = addresses.findIndex(a => a.userId === userId && a.isDefault);

    if (idx > -1) {
      addresses[idx] = { ...addresses[idx], fullAddress };
      this.saveAll(addresses);
      return addresses[idx];
    }

    const newAddress: Address = {
      addressId: 'A' + Date.now().toString(),
      userId,
      fullAddress,
      isDefault: true
    };
    addresses.push(newAddress);
    await this.saveAll(addresses);
    return newAddress;
  }
}
