import { QueryClient } from '@tanstack/react-query';
import { DNS_INFO_QUERY_KEY, DnsInfo } from 'hooks';
import { ClientSocket } from 'types';

export function addDnsLoginCompleteListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('DNS_LOGIN_COMPLETE', isLoggedIn => {
    queryClient.setQueryData<DnsInfo>([DNS_INFO_QUERY_KEY], prev =>
      prev
        ? {
            ...prev,
            isLoggingIn: false,
            isLoggedIn,
          }
        : undefined,
    );
  });
}
