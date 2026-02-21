import { usePeerStore } from '@/store/peerStore';
import { useStreamStore } from '@/store/streamStore';
import { useUserStore } from '@/store/userStore';

export function usePeer() {
  const getConnections = usePeerStore((state) => state.getConnections);
  const closeAndDeleteCall = usePeerStore((state) => state.closeAndDeleteCall);
  const closeCallsOutput = usePeerStore((state) => state.closeCallsOutput);
  const sendMessague = usePeerStore((state) => state.sendMessague);
  const call = usePeerStore((state) => state.call);

  const user = useUserStore((state) => state.user);

  const setLocalStream = useStreamStore((state) => state.setLocalStream);
  const getLocalStream = useStreamStore((state) => state.getLocalStream);
  const getRemoteStream = useStreamStore((state) => state.getRemoteStream);
  const clearRemoteStream = useStreamStore((state) => state.clearRemoteStream);

  //to improve
  const startStream = async () => {
    try {
      if (
        !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
      ) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser',
          },
          audio: {
            suppressLocalAudioPlayback: false,
          },
          preferCurrentTab: false,
          selfBrowserSurface: 'exclude',
          systemAudio: 'include',
          surfaceSwitching: 'include',
          monitorTypeSurfaces: 'include',
        } as any);

        if (stream) {
          setLocalStream(stream);
        }

        stream.getTracks().forEach((track) => {
          track.onended = () => {
            closeAllCallConnectionsOutput();
            console.log(
              'La pista ha terminado (el usuario dejó de transmitir)'
            );
          };
        });

        sendMessague(getConnections(), 'addAvailableStreamPeer', {
          username: user.username,
        });

        return { message: true };
      } else {
        window.toast({
          title: 'La transmision solo esta disponible en PC',
          message: '',
          location: 'top-right',
          dismissable: false,
          theme: 'butterupcustom',
          type: 'error',
          icon: true,
        });
      }
    } catch (error) {
      console.log('Error al obtener acceso a la pantalla:', error);
    }
  };

  const stopStreaming = () => {
    try {
      getLocalStream()
        .getTracks()
        .forEach((track) => {
          track.stop();
          closeAllCallConnectionsOutput();
        });
    } catch (err) {
      console.log(err);
    }
  };

  const viewStream = (idPeer) => {
    let dataFind = getConnections().find(
      (connection) => connection.idPeer == idPeer
    );
    if (dataFind) {
      call(dataFind.conn);
    }
    // dataFind &&
    //   dataFind.conn.send({ cmd: 'viewStream', data: { peer: idPeer } });
  };

  const closeAllCallConnectionsOutput = () => {
    sendMessague(getConnections(), 'removeAvailableStreamPeer', {
      username: user.username,
    });

    closeCallsOutput();
  };

  const closeActiveStreamig = () => {
    let dataCaptScreen = getRemoteStream();
    if (dataCaptScreen) {
      let { peerId, callId } = dataCaptScreen;
      closeAndDeleteCall(peerId, callId);
      clearRemoteStream();
      // setNullActiveStreamingUserCaptScreen();
    }
  };

  return {
    startStream,
    viewStream,
    stopStreaming,
    closeActiveStreamig,
  };
}
