import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Address } from '../data/address.model';
import seedAddresses from '../data/addresses.json';

const ADDRESSES_KEY = 'addresses';
const INITIAL_ADDRESSES = seedAddresses as Address[];

@Injectable({ providedIn: 'root' })
export class AddressService {
  constructor() {
    this.syncSeedAddresses();
  }

  private syncSeedAddresses(): Address[] {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    const storedAddresses = raw ? (JSON.parse(raw) as Address[]) : [];
    const mergedAddresses = [...storedAddresses];

    for (const seedAddress of INITIAL_ADDRESSES) {
      const exists = mergedAddresses.some(address => address.addressId === seedAddress.addressId);
      if (!exists) {
        mergedAddresses.push(seedAddress);
      }
    }

    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(mergedAddresses));
    return mergedAddresses;
  }

  private get addresses(): Address[] {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    if (raw) {
      return JSON.parse(raw) as Address[];
    }

    return this.syncSeedAddresses();
  }

  private saveAddresses(addresses: Address[]): void {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  }

  getUserAddresses(userId: string): Observable<Address[]> {
    const userAddresses = this.addresses.filter(addr => addr.userId === userId);
    return of(userAddresses);
  }

  getDefault(userId: string): Promise<Address | undefined> {
    const defaultAddr = this.addresses.find(addr => addr.userId === userId && addr.isDefault);
    return Promise.resolve(defaultAddr);
  }

  upsertDefault(userId: string, addressDetails: string): Promise<Address> {
    const addresses = this.addresses;
    let addr = addresses.find(a => a.userId === userId && a.isDefault);
    
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
      addresses.push(addr);
    }
    
    this.saveAddresses(addresses);
    return Promise.resolve(addr);
  }

  createAddress(address: Omit<Address, 'addressId'>): Observable<Address> {
    const addresses = this.addresses;
    const newAddress: Address = {
      ...address,
      addressId: 'A' + Date.now().toString()
    };
    addresses.push(newAddress);
    this.saveAddresses(addresses);
    return of(newAddress);
  }

  updateAddress(addressId: string, address: Partial<Address>): Observable<Address> {
    const addresses = this.addresses;
    const idx = addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      addresses[idx] = { ...addresses[idx], ...address };
      this.saveAddresses(addresses);
      return of(addresses[idx]);
    }
    return of({} as Address);
  }

  deleteAddress(addressId: string): Observable<void> {
    const addresses = this.addresses;
    const idx = addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      addresses.splice(idx, 1);
      this.saveAddresses(addresses);
    }
    return of();
  }

  setDefaultAddress(addressId: string, userId: string): Observable<void> {
    const addresses = this.addresses;
    addresses.forEach(addr => {
      if (addr.userId === userId) {
        addr.isDefault = addr.addressId === addressId;
      }
    });
    this.saveAddresses(addresses);
    return of();
  }
}