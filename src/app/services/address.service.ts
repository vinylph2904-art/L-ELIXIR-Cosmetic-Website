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
    const mergedAddresses = Array.isArray(storedAddresses) ? [...storedAddresses] : [];

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
      try {
        const parsed = JSON.parse(raw) as Address[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // ignore malformed storage and resync from seed data
      }
    }

    return this.syncSeedAddresses();
  }

  private saveAddresses(addresses: Address[]): void {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  }

  private ensureSeedAddressesForUser(userId: string): Address[] {
    const allAddresses = this.syncSeedAddresses();
    const normalizedUserId = String(userId || '').trim();

    if (!normalizedUserId) {
      return allAddresses;
    }

    const hasUserAddress = allAddresses.some(address => String(address.userId || '').trim() === normalizedUserId);
    if (hasUserAddress) {
      return allAddresses;
    }

    const userSeedAddresses = INITIAL_ADDRESSES.filter(address => String(address.userId || '').trim() === normalizedUserId);
    if (userSeedAddresses.length > 0) {
      const mergedAddresses = [...allAddresses, ...userSeedAddresses];
      this.saveAddresses(mergedAddresses);
      return mergedAddresses;
    }

    return allAddresses;
  }

  getUserAddresses(userId: string): Observable<Address[]> {
    const normalizedUserId = String(userId || '').trim();
    const userAddresses = this.ensureSeedAddressesForUser(userId).filter(addr => String(addr.userId || '').trim() === normalizedUserId);
    return of(userAddresses);
  }

  getDefault(userId: string): Promise<Address | undefined> {
    const normalizedUserId = String(userId || '').trim();
    const allAddresses = this.ensureSeedAddressesForUser(userId);
    const userAddresses = allAddresses.filter(addr => String(addr.userId || '').trim() === normalizedUserId);
    const defaultAddr = userAddresses.find(addr => addr.isDefault) || userAddresses[0];

    if (defaultAddr && !defaultAddr.isDefault) {
      allAddresses.forEach(addr => {
        if (String(addr.userId || '').trim() === normalizedUserId) {
          addr.isDefault = addr.addressId === defaultAddr.addressId;
        }
      });
      this.saveAddresses(allAddresses);
    }

    return Promise.resolve(defaultAddr);
  }

  upsertDefault(userId: string, addressDetails: string): Promise<Address> {
    const normalizedUserId = String(userId || '').trim();
    const addresses = this.ensureSeedAddressesForUser(userId);
    let addr = addresses.find(a => String(a.userId || '').trim() === normalizedUserId && a.isDefault) || addresses.find(a => String(a.userId || '').trim() === normalizedUserId);
    
    if (addr) {
      addr.addressDetails = addressDetails;
      addr.isDefault = true;
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

    addresses.forEach(existing => {
      if (String(existing.userId || '').trim() === normalizedUserId && existing.addressId !== addr!.addressId) {
        existing.isDefault = false;
      }
    });
    
    this.saveAddresses(addresses);
    return Promise.resolve(addr);
  }

  createAddress(address: Omit<Address, 'addressId'>): Observable<Address> {
    const normalizedUserId = String(address.userId || '').trim();
    const addresses = this.ensureSeedAddressesForUser(address.userId);
    const newAddress: Address = {
      ...address,
      addressId: 'A' + Date.now().toString()
    };

    if (newAddress.isDefault) {
      addresses.forEach(existing => {
        if (String(existing.userId || '').trim() === normalizedUserId) {
          existing.isDefault = false;
        }
      });
    }

    addresses.push(newAddress);
    this.saveAddresses(addresses);
    return of(newAddress);
  }

  updateAddress(addressId: string, address: Partial<Address>): Observable<Address> {
    const addresses = this.syncSeedAddresses();
    const idx = addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      addresses[idx] = { ...addresses[idx], ...address };
      this.saveAddresses(addresses);
      return of(addresses[idx]);
    }
    return of({} as Address);
  }

  deleteAddress(addressId: string): Observable<void> {
    const addresses = this.syncSeedAddresses();
    const idx = addresses.findIndex(a => a.addressId === addressId);
    if (idx >= 0) {
      addresses.splice(idx, 1);
      this.saveAddresses(addresses);
    }
    return of();
  }

  setDefaultAddress(addressId: string, userId: string): Observable<void> {
    const normalizedUserId = String(userId || '').trim();
    const addresses = this.ensureSeedAddressesForUser(userId);
    addresses.forEach(addr => {
      if (String(addr.userId || '').trim() === normalizedUserId) {
        addr.isDefault = addr.addressId === addressId;
      }
    });
    this.saveAddresses(addresses);
    return of();
  }
}