import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateComplete } from 'hooks';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function UpdateOverlay() {
  const { data: isUpdateComplete } = useUpdateComplete();
  const router = useRouter();

  const [timer, setTimer] = useState<number>(10);
  const [timerStarted, setTimerStarted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isUpdateComplete) setTimerStarted(true);
  }, [isUpdateComplete]);

  useEffect(() => {
    if (!timerStarted) return;

    const intervalTimer = setInterval(() => {
      if (timer > 0) setTimer(time => time - 1);
      else {
        clearInterval(intervalTimer);
        queryClient.clear();
        router.reload();
      }
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [timer, timerStarted, router, queryClient]);

  return (
    <Modal isOpen={timerStarted} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent textAlign="center">
        <ModalHeader>Update Complete!</ModalHeader>
        <ModalBody>Restarting in {timer}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
