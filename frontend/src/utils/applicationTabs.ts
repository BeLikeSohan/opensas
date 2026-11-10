import { HoldStatus } from '../types';

export type ApplicationTabKey = 'all' | 'held' | 'confirmed' | 'past';

export interface ApplicationTab {
  key: ApplicationTabKey;
  label: string;
  match: (status: HoldStatus) => boolean;
}

export const APPLICATION_TABS: ApplicationTab[] = [
  { key: 'all', label: 'সব', match: () => true },
  { key: 'held', label: 'সংরক্ষিত', match: (s) => s === HoldStatus.HELD },
  { key: 'confirmed', label: 'নিশ্চিত', match: (s) => s === HoldStatus.CONFIRMED },
  {
    key: 'past',
    label: 'মেয়াদোত্তীর্ণ ও বাতিল',
    match: (s) => s === HoldStatus.EXPIRED || s === HoldStatus.CANCELLED,
  },
];
