import { usePeerStore } from '@/store/peerStore';
import { useStreamStore } from '@/store/streamStore';
import { generateName } from '@/utils/functsGene';
import { useState } from 'react';

export function usePeer() {
  const getConnections = usePeerStore((state) => state.getConnections);
  const closeAndDeleteCall = usePeerStore((state) => state.closeAndDeleteCall);
  const closeCallsOutput = usePeerStore((state) => state.closeCallsOutput);
  const sendMessague = usePeerStore((state) => state.sendMessague);

  const {
    setInfoStream,
    getActiveStreamig,
    setNullActiveStreamingUserCaptScreen,
    startStreamStore,
    stopStreamingStore,
  } = useStreamStore((state) => ({
    setInfoStream: state.setInfoStream,
    getActiveStreamig: state.getActiveStreamig,
    setNullActiveStreamingUserCaptScreen:
      state.setNullActiveStreamingUserCaptScreen,
    startStreamStore: state.startStreamStore,
    stopStreamingStore: state.stopStreamingStore,
  }));

  let [nameUser, setNameUser] = useState(generateName());

  //to improve
  const startStream = async () => {
    try {
      let stream = await startStreamStore();
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          closeAllCallConnectionsOutput();
          console.log('La pista ha terminado (el usuario dejó de transmitir)');
        };
      });

      setInfoStream((state) => {
        let dataInfoStream = {
          isStream: true,
          userStreaming: nameUser,
        };

        sendMessague(getConnections(), 'addStreamingUsers', dataInfoStream);

        return {
          ...state,
          ...dataInfoStream,
        };
      });
      return { message: true };
    } catch (err) {
      console.log('Error al obtener acceso a la pantalla:', err);
    }
  };

  const stopStreaming = () => {
    stopStreamingStore()
      .then((_) => {
        closeAllCallConnectionsOutput();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const viewStream = (idPeer) => {
    let dataFind = getConnections().find(
      (connection) => connection.idPeer == idPeer
    );
    dataFind &&
      dataFind.conn.send({ cmd: 'viewStream', data: { peer: idPeer } });
  };

  const closeAllCallConnectionsOutput = () => {
    setInfoStream((state) => {
      let dataInfoStream = {
        isStream: false,
        userStreaming: nameUser,
      };

      sendMessague(getConnections(), 'addStreamingUsers', dataInfoStream);

      return {
        ...state,
        ...dataInfoStream,
      };
    });

    closeCallsOutput();
  };

  const closeActiveStreamig = () => {
    let dataCaptScreen = getActiveStreamig().captScreen;
    if (dataCaptScreen) {
      let { idPeer, idCall } = dataCaptScreen;
      closeAndDeleteCall(idPeer, idCall);
      setNullActiveStreamingUserCaptScreen();
    }
  };

  return {
    startStream,
    viewStream,
    stopStreaming,
    closeActiveStreamig,
  };
}
