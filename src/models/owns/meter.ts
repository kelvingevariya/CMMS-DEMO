import { Audit } from './audit';
import { AssetMiniDTO } from './asset';
import { LocationMiniDTO } from './location';
import { UserMiniDTO } from '../user';
import File from './file';

export default interface Meter extends Audit {
  name: string;
  id: number;
  unit: string;
  updateFrequency: number;
  category: string;
  image: File | null;
  users: UserMiniDTO[];
  location?: LocationMiniDTO;
  asset: AssetMiniDTO;
  nextReading: string;
  lastReading: string;
}
export interface MeterMiniDTO {
  name: string;
  id: number;
}
