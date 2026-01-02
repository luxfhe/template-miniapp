"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Encryptable,
  Environment,
  FheTypes,
  Permit,
  PermitOptions,
  fhe,
  permitStore,
} from "@luxfhe/sdk/web";
import { Address } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useFHEStore } from "../store/fheStore";

interface FHEConfig {
  environment: Environment;
  coFheUrl?: string;
  verifierUrl?: string;
  thresholdNetworkUrl?: string;
  ignoreErrors?: boolean;
  generatePermit?: boolean;
}

export function useFHE(config?: Partial<FHEConfig>) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const {
    isInitialized: globalIsInitialized,
    setIsInitialized: setGlobalIsInitialized,
  } = useFHEStore();

  const chainId = publicClient?.chain.id;
  const accountAddress = walletClient?.account.address;

  const [isInitializing, setIsInitializing] = useState(false);
  const [isGeneratingPermit, setIsGeneratingPermit] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permit, setPermit] = useState<Permit | undefined>(undefined);

  // Add checks to ensure we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  // Reset initialization when chain changes
  useEffect(() => {
    setGlobalIsInitialized(false);
  }, [chainId, accountAddress, setGlobalIsInitialized]);

  // Initialize when wallet is connected
  useEffect(() => {
    // Skip initialization if not in browser or wallet not connected
    if (!isBrowser || !isConnected) return;

    const initialize = async () => {
      if (
        globalIsInitialized ||
        isInitializing ||
        !publicClient ||
        !walletClient
      )
        return;
      try {
        setIsInitializing(true);

        const defaultConfig = {
          verifierUrl: undefined,
          coFheUrl: undefined,
          thresholdNetworkUrl: undefined,
          ignoreErrors: false,
          generatePermit: false, // Changed to false for manual permit generation
        };

        // Merge default config with user-provided config
        const mergedConfig = { ...defaultConfig, ...config };
        const result = await fhe.initializeWithViem({
          viemClient: publicClient,
          viemWalletClient: walletClient,
          environment: "TESTNET",
          verifierUrl: mergedConfig.verifierUrl,
          coFheUrl: mergedConfig.coFheUrl,
          thresholdNetworkUrl: mergedConfig.thresholdNetworkUrl,
          ignoreErrors: mergedConfig.ignoreErrors,
          generatePermit: mergedConfig.generatePermit,
        });

        if (result.success) {
          console.log("FHE initialized successfully");
          setGlobalIsInitialized(true);
          setPermit(result.data);
          setError(null);
        } else {
          setError(new Error(result.error.message || String(result.error)));
        }
      } catch (err) {
        console.error("Failed to initialize FHE:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Unknown error initializing FHE")
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected,
    walletClient,
    publicClient,
    config,
    chainId,
    isInitializing,
    accountAddress,
    globalIsInitialized,
    setGlobalIsInitialized,
  ]);

  const createPermit = useCallback(
    async (permitOptions?: PermitOptions) => {
      if (!globalIsInitialized || !accountAddress) {
        return {
          success: false,
          error: "CoFHE not initialized or wallet not connected",
        };
      }

      try {
        setIsGeneratingPermit(true);
        setError(null);

        const result = await fhe.createPermit(permitOptions);

        if (result.success) {
          console.log("Permit generated successfully");
          setPermit(result.data);
          setError(null);
          return result;
        } else {
          setError(new Error(result.error.message || String(result.error)));
          return result;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error generating permit";
        const errorResult = {
          success: false as const,
          error: { message: errorMessage },
        };
        setError(new Error(errorMessage));
        return errorResult;
      } finally {
        setIsGeneratingPermit(false);
      }
    },
    [globalIsInitialized, accountAddress]
  );

  const { createPermit: _, ...fheWithoutCreatePermit } = fhe;

  return {
    isInitialized: globalIsInitialized,
    isInitializing,
    isGeneratingPermit,
    error,
    permit,
    createPermit,
    // Expose the original library functions directly (excluding createPermit to avoid override)
    ...fheWithoutCreatePermit,
    FheTypes,
    Encryptable,
  };
}

export const useFHEjsInitialized = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = fhe.store.subscribe((state) =>
      setInitialized(
        state.providerInitialized &&
          state.signerInitialized &&
          state.fheKeysInitialized
      )
    );

    // Initial state
    const initialState = fhe.store.getState();
    setInitialized(
      initialState.providerInitialized &&
        initialState.signerInitialized &&
        initialState.fheKeysInitialized
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return initialized;
};

export const useFHEjsAccount = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = fhe.store.subscribe((state) => {
      setAccount(state.account);
    });

    // Initial state
    setAccount(fhe.store.getState().account);

    return () => {
      unsubscribe();
    };
  }, []);

  return account;
};

export const useFHEjsActivePermitHashes = () => {
  const [activePermitHash, setActivePermitHash] = useState<
    Record<Address, string | undefined>
  >({});

  useEffect(() => {
    const unsubscribe = permitStore.store.subscribe((state) => {
      const hash = state.activePermitHash;
      setActivePermitHash(
        hash as unknown as Record<Address, string | undefined>
      );
    });

    setActivePermitHash(
      permitStore.store.getState().activePermitHash as unknown as Record<
        Address,
        string | undefined
      >
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return useMemo(() => activePermitHash, [activePermitHash]);
};

export const useFHEjsActivePermitHash = () => {
  const account = useFHEjsAccount();
  const activePermitHashes = useFHEjsActivePermitHashes();

  return useMemo(() => {
    if (!account) return undefined;
    return activePermitHashes[account as Address];
  }, [account, activePermitHashes]);
};

export const useFHEjsActivePermit = () => {
  const { chainId } = useAccount();
  const account = useFHEjsAccount();
  const initialized = useFHEjsInitialized();
  const activePermitHash = useFHEjsActivePermitHash();

  return useMemo(() => {
    if (!account || !initialized) return undefined;
    console.log("chainId", chainId?.toString());
    return permitStore.getPermit(
      chainId?.toString(),
      account,
      activePermitHash
    );
  }, [account, initialized, activePermitHash, chainId]);
};

export const useFHEjsAllPermits = () => {
  const account = useFHEjsAccount();
  const initialized = useFHEjsInitialized();
  const [allPermits, setAllPermits] = useState<Permit[] | undefined>(undefined);

  useEffect(() => {
    if (!account || !initialized) {
      setAllPermits(undefined);
      return;
    }

    const updatePermits = () => {
      // Use fhe.getAllPermits() here as it's the correct API
      const permitsFromStore = fhe.getAllPermits();
      setAllPermits(Object.values(permitsFromStore?.data ?? {}));
    };

    // Initial state
    updatePermits();

    // Subscribe to store changes
    // Assuming permitStore.store.subscribe will be triggered by permitStore.removePermit
    const unsubscribe = permitStore.store.subscribe(updatePermits);

    return () => {
      unsubscribe();
    };
  }, [account, initialized]); // Dependencies: re-run when account or initialized status changes.

  return allPermits;
};

// Export FheTypes directly for convenience
export { FheTypes } from "@luxfhe/sdk/web";
