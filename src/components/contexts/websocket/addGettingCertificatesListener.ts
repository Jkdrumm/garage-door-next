import { QueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks';
import { ClientSocket } from 'types';

export function addGettingCertificatesListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('GETTING_CERTIFICATES', () => {
    queryClient.setQueryData<DnsInfo>([DNS_INFO_QUERY_KEY], prev =>
      prev
        ? {
            ...prev,
            isGettingCertificates: true,
          }
        : undefined,
    );
  });
}
