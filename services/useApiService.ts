import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

export interface GetModelsRequestProps {
  key: string;
}

const useApiService = () => {
  const fetchService = useFetch();

  const getModels = useCallback(
      (params: GetModelsRequestProps, guestCode = '', signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(`/api/models`, {
        body: { key: params.key },
        headers: {
          'Content-Type': 'application/json',
          ...(guestCode && { Authorization: `Bearer ${guestCode}` }),
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    getModels,
  }
}

export default useApiService;
