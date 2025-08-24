import { useMutation } from '@tanstack/react-query';

export const useMutationHooks = (mutationFn) => {
  return useMutation({
    mutationFn, 
  });
};
