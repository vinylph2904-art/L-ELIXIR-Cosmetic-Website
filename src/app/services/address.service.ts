// address.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Address } from '../data/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  // In-memory store with mock data
  private addresses: Address[] = [
    {
      addressId: 'A1718000000000',
      userId: 'U1718000000000',
      receiverName: 'Nguyễn Văn A',
      receiverPhone: '0901234567',
      addressDetails: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      isDefault: true
    },
    {
      addressId: 'A1718000000001',
      userId: 'U1718000000000',
      receiverName: 'Nguyễn Văn A',
      receiverPhone: '0901234567',
      addressDetails: '456 Đường Lê Lợi, Quận 3, TP. Hồ Chí Minh',
      isDefault: false
    },
    {
      addressId: 'A1781977136020',
      userId: 'U1781977136020',
      receiverName: 'Ây bi xi',
      receiverPhone: '1234567989',
      addressDetails: '789 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, TP. Hà Nội',
      isDefault: true
    }
  ];

  constructor() {
    console.log('[AddressService] initialized with addresses:', this.addresses);
  }

  getUserAddresses(userId: string): Observable<Address[]> {
    const userAddresses = this.addresses.filter(addr => addr.userId === userId);
    console.log(`[AddressService] getUserAddresses for ${userId}:`, userAddresses);
    return of(userAddresses);
  }

  getDefault(userId: string): Promise<Address | undefined> {
    const defaultAddr = this.addresses.find(addr => addr.userId === userId && addr.isDefault);
    console.log(`[AddressService] getDefault for ${userId}:`, defaultAddr);
    return Promise.resolve(defaultAddr);
  }

  upsertDefault(userId: string, addressDetails: string): Promise<Address> {
    let addr = this.addresses.find(a => a.userId === userId && a.isDefault);
    
    if (addr) {
      addr.addressDetails = addressDetails;
    } else {
      addr = {
        addressId: 'A' + Date.now().toString(),
        userId,
        receiverName: '',
        receiverPhone: '',
        addressDetails,
        isDefault: true
      };
      this.addresses.push(addr);
    }
    
    console.log('[AddressService] upsertDefault:', addr);
    return Promise.resolve(addr);
  }

  createAddress(address: Omit<Address, 'addressId'>): Observable<Address> {
    const newAddress: Address = {
      ...address,
      addressId: 'A' + Date.now().toString()
    };
    this.addresses.push(newAddress);
    console.log('[AddressService] createAddress:', newAddress);
    return of(newAddress);
  }

  updateAddress(addressId: string, address: Partial<Address>): Observable<Address> {
    const idx = this.addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      this.addresses[idx] = { ...this.addresses[idx], ...address };
      console.log('[AddressService] updateAddress:', this.addresses[idx]);
      return of(this.addresses[idx]);
    }
    return of({} as Address);
  }

  deleteAddress(addressId: string): Observable<void> {
    const idx = this.addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      this.addresses.splice(idx, 1);
      console.log('[AddressService] deleteAddress:', addressId);
    }
    return of();
  }

  setDefaultAddress(addressId: string, userId: string): Observable<void> {
    this.addresses.forEach(addr => {
      if (addr.userId === userId) {
        addr.isDefault = addr.addressId === addressId;
      }
    });
    console.log('[AddressService] setDefaultAddress:', addressId);
    return of();
  }
}