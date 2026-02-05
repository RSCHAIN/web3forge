// types/contracts.ts
export interface BackendReadResponse<T> {
  value: T;
}

export interface BackendWritePrepareResponse {
  method: string;
  args: readonly string[];
}

export interface EthereumProvider {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
}
