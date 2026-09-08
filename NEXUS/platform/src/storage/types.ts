export interface StorageProvider {
  readonly name: string;
}

export type BlobStorage = StorageProvider;
export type DocumentStorage = StorageProvider;
export type VectorStorage = StorageProvider;
export type CacheProvider = StorageProvider;
export type SecretProvider = StorageProvider;
export type ConfigurationProvider = StorageProvider;
