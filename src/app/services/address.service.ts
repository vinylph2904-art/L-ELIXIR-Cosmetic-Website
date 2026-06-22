import { Injectable } from '@angular/core';
import { Address } from '../data/address.model';
const ADDRESSES_KEY = 'addresses';
const INITIAL_ADDRESSES: Address[] = [
  {
    addressId: 'A1718000000000',
    userId: 'U1718000000000',
    fullAddress: '123 Đường Luxury, Quận 2, TP. HCM',
    isDefault: true
  }
];

@Injectable({ providedIn: 'root' })
export class AddressService {

  private getAll(): Address[] {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    if (raw) {
      return JSON.parse(raw) as Address[];
    }

    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(INITIAL_ADDRESSES));
    return [...INITIAL_ADDRESSES];
  }

  private saveAll(addresses: Address[]): void {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  }

  async getByUserId(userId: string): Promise<Address[]> {
    return this.getAll().filter(a => a.userId === userId);
  }

  async getDefault(userId: string): Promise<Address | null> {
    const list = await this.getByUserId(userId);
    return list.find(a => a.isDefault) || list[0] || null;
  }

  /** Tạo mới hoặc cập nhật địa chỉ mặc định của user (giữ đơn giản: mỗi user 1 địa chỉ mặc định) */
  async upsertDefault(userId: string, fullAddress: string): Promise<Address> {
    const addresses = this.getAll();
    const idx = addresses.findIndex(a => a.userId === userId && a.isDefault);

    if (idx > -1) {
      addresses[idx] = { ...addresses[idx], fullAddress };
      await this.saveAll(addresses);
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
