import { createPeerNetwork } from '@/lib/createPeerNetwork';
import { modalStore } from '@/store/modalStore';
import { usePeerStore } from '@/store/peerStore';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { useEffect, useState } from 'react';
import { PAGE_MESSAGE_TYPES } from '../types.d';
import { useUserStore } from '@/store/userStore';
import { generateName } from '@/utils/functsGene';

export function PeerConnection() {
  const setIdPeer = usePeerStore((state) => state.setIdPeer);
  const sendMessague = usePeerStore((state) => state.sendMessague);
  const setElementAction = usePeerStore((state) => state.setElementAction);
  const pushConnections = usePeerStore((state) => state.pushConnections);
  const setConnect = usePeerStore((state) => state.setConnect);
  const setCall = usePeerStore((state) => state.setCall);
  const addCall = usePeerStore((state) => state.addCall);
  const deleteConnection = usePeerStore((state) => state.deleteConnection);
  const sendMessagueAll = usePeerStore((state) => state.sendMessagueAll);
  const closeAndDeleteCall = usePeerStore((state) => state.closeAndDeleteCall);

  const getLocalStream = useStreamStore((state) => state.getLocalStream);
  const setRemoteStream = useStreamStore((state) => state.setRemoteStream);
  const getRemoteStream = useStreamStore((state) => state.getRemoteStream);
  const clearRemoteStream = useStreamStore((state) => state.clearRemoteStream);
  const showNotification = useStreamStore((state) => state.showNotification);
  const addAvailableStreamPeer = useStreamStore(
    (state) => state.addAvailableStreamPeer
  );
  const removeAvailableStreamPeer = useStreamStore(
    (state) => state.removeAvailableStreamPeer
  );

  let { setIsOpenModalVideoPlayer } = modalStore((state) => ({
    setIsOpenModalVideoPlayer: state.setIsOpenModalVideoPlayer,
  }));

  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const { setPlayerInfo } = usePlayerStore();
  const peerNetwork = createPeerNetwork();

  const createServer = async () => {
    peerNetwork.on('open', (peerId) => {
      // console.log('peerId open', peerId);
      setIdPeer(peerId);
    });
    peerNetwork.on('openRecived', (conn, status) => {
      pushConnections(conn);
      if (status == 'sent') {
      } else {
        if (getLocalStream())
          sendMessague([{ conn }], 'addAvailableStreamPeer', {
            username: user.username,
          });
      }
    });
    peerNetwork.on('data', processIncomingData);
    peerNetwork.on('close', (conn) => {
      deleteConnection(conn.peer);
      removeAvailableStreamPeer(conn.peer);
      // deleteStreamingUser(conn.peer);
    });
    peerNetwork.on('callSend', (call) => {
      addCall(call, false, 'out');
    });
    peerNetwork.on('callRecived', (call) => {
      // console.log('call', call);
      call.answer(getLocalStream());
      addCall(call, true, 'in');
    });
    peerNetwork.on('closeCall', (call) => {
      setIsOpenModalVideoPlayer(false);
      // removeAvailableStreamPeer(call.peer);
      clearRemoteStream();
    });
    peerNetwork.on('streamCall', (stream, call) => {
      const existing = getRemoteStream();

      // Si ya hay uno y es de otro call cerramos la call
      if (existing && existing.callId !== call.connectionId) {
        closeAndDeleteCall(existing.peerId, existing.callId);
      }

      // Solo registrar si no existe o es otro call
      if (!existing || existing.callId !== call.connectionId) {
        setRemoteStream({
          peerId: call.peer,
          callId: call.connectionId,
          stream: stream,
        });
        setIsOpenModalVideoPlayer(true);
      }
    });
    peerNetwork.init();
    setConnect(peerNetwork.connect);
    setCall(peerNetwork.callF);
  };

  const processIncomingData = (cmd, data, conn) => {
    if (cmd == PAGE_MESSAGE_TYPES.ELEMENT_ACTION) {
      if (getRemoteStream()) {
        setElementAction({ ...data });
      } else {
        window.postMessage(
          {
            cmd: cmd,
            data: {
              ...data,
              status: 'received',
            },
          },
          '*'
        );
      }
    } else if (cmd == 'addAvailableStreamPeer') {
      console.log('info addAvailableStreamPeer');
      showNotification({ username: data.username });
      addAvailableStreamPeer(conn.peer, data);
    } else if (cmd == 'removeAvailableStreamPeer') {
      console.log('info removeAvailableStreamPeer');
      removeAvailableStreamPeer(conn.peer);
    } else if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
      setPlayerInfo(data);
    } else if (cmd == PAGE_MESSAGE_TYPES.GET_VIDEO_INFO) {
      window.postMessage({ cmd: PAGE_MESSAGE_TYPES.GET_VIDEO_INFO }, '*');
    }
    //  else if (cmd == 'viewStream') {
    //   console.log('el  id ' + conn.peer + ' pidio el stream');

    //   window.addEventListener(
    //     'message',
    //     function (event) {
    //       let { cmd, data } = event.data;
    //       if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
    //         peerNetwork.callF(conn, getStreamL(), { playerInfo: data });
    //       }
    //     },
    //     false
    //   );

    //   window.postMessage(
    //     {
    //       cmd: PAGE_MESSAGE_TYPES.GET_VIDEO_INFO,
    //       data: '',
    //     },
    //     '*'
    //   );
    // }
  };

  useEffect(() => {
    const username = localStorage.getItem('username') || generateName();
    setUser({ username });
    createServer();
    window.addEventListener(
      'message',
      function (event) {
        let { cmd, data } = event.data;
        if (cmd == PAGE_MESSAGE_TYPES.ELEMENT_ACTION) {
          if (data.status == 'sending') {
            sendMessagueAll(cmd, data);
          }
        } else if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
          sendMessagueAll(cmd, data);
        }
      },
      false
    );
  }, []);

  return null;
}
