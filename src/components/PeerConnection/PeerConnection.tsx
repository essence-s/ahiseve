import { createPeerNetwork } from '@/lib/createPeerNetwork';
import { modalStore } from '@/store/modalStore';
import { usePeerStore } from '@/store/peerStore';
import { usePlayerStore } from '@/store/playerStore';
import { useStreamStore } from '@/store/streamStore';
import { useEffect } from 'react';
import { PAGE_MESSAGE_TYPES } from '../types.d';

export function PeerConnection() {
  const setIdPeer = usePeerStore((state) => state.setIdPeer);
  const sendMessague = usePeerStore((state) => state.sendMessague);
  const setElementAction = usePeerStore((state) => state.setElementAction);
  const pushConnections = usePeerStore((state) => state.pushConnections);
  const setConnect = usePeerStore((state) => state.setConnect);
  const addCall = usePeerStore((state) => state.addCall);
  const deleteConnection = usePeerStore((state) => state.deleteConnection);

  let {
    getStreamL,
    getInfoStream,
    addStreamingUsers,
    deleteStreamingUser,
    addActiveStreamingUserCaptScreen,
    getActiveStreamig,
  } = useStreamStore((state) => ({
    getStreamL: state.getStreamL,
    getInfoStream: state.getInfoStream,
    addStreamingUsers: state.addStreamingUsers,
    deleteStreamingUser: state.deleteStreamingUser,
    addActiveStreamingUserCaptScreen: state.addActiveStreamingUserCaptScreen,
    getActiveStreamig: state.getActiveStreamig,
  }));

  let { setIsOpenModalVideoPlayer } = modalStore((state) => ({
    setIsOpenModalVideoPlayer: state.setIsOpenModalVideoPlayer,
  }));

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
        sendMessague([{ conn }], 'addStreamingUsers', getInfoStream());
      }
    });
    peerNetwork.on('data', processIncomingData);
    peerNetwork.on('close', (conn) => {
      deleteConnection(conn.peer);
      deleteStreamingUser(conn.peer);
    });
    peerNetwork.on('callSend', (call) => {
      addCall(call, false, 'out');
    });
    peerNetwork.on('callRecived', (call) => {
      addCall(call, true, 'in');
    });
    peerNetwork.on('closeCall', () => {
      setIsOpenModalVideoPlayer(false);
    });
    peerNetwork.on('streamCall', (stream, call) => {
      setPlayerInfo(call.metadata.playerInfo);
      addActiveStreamingUserCaptScreen(stream, call.peer, call.connectionId);
      setIsOpenModalVideoPlayer(true);
    });
    peerNetwork.init();
    setConnect(peerNetwork.connect);
    // setCall(peerNetwork.callF);
  };

  const processIncomingData = (cmd, data, conn) => {
    if (cmd == PAGE_MESSAGE_TYPES.ELEMENT_ACTION) {
      if (getActiveStreamig().captScreen) {
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
    } else if (cmd == 'viewStream') {
      console.log('el  id ' + conn.peer + ' pidio el stream');

      window.addEventListener(
        'message',
        function (event) {
          let { cmd, data } = event.data;
          if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
            peerNetwork.callF(conn, getStreamL(), { playerInfo: data });
          }
        },
        false
      );

      window.postMessage(
        {
          cmd: PAGE_MESSAGE_TYPES.GET_VIDEO_INFO,
          data: '',
        },
        '*'
      );
    } else if (cmd == 'addStreamingUsers') {
      console.log('info de StreamingUsers');
      addStreamingUsers(conn.peer, { ...data });
    }
  };

  useEffect(() => {
    createServer();
  }, []);

  return null;
}
