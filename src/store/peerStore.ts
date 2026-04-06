import { create } from 'zustand';
import { createPeerNetwork } from '@/lib/createPeerNetwork';
import { PAGE_MESSAGE_TYPES } from '@/components/types.d';
import { modalStore } from './modalStore';
import { usePlayerStore } from './playerStore';
import { useStreamStore } from './streamStore';
import { useUserStore } from './userStore';
import { generateName } from '@/utils/functsGene';

export const usePeerStore = create<PeerStore>((set, get) => ({
  idPeer: '',
  setIdPeer: (idPeer) => set({ idPeer }),

  peer: null,
  setPeer: (npeer) => set({ peer: npeer }),
  getPeer: () => get().peer,

  elementAction: {
    action: '',
    mediaCurrentTime: 0,
  },
  setElementAction: (state) => set({ elementAction: state }),

  sessionMode: 'idle',
  getSessionMode: () => get().sessionMode,
  setSessionMode: (mode: SessionMode) => {
    console.log('mode', mode);
    set({ sessionMode: mode });
  },

  connect: null,
  setConnect: (fn) => set({ connect: fn }),
  call: null,
  setCall: (fn) => set({ call: fn }),

  sendMessagueAll: (cmd, messague) => {
    let conectionsG = get().getConnections();

    conectionsG.forEach((connection) => {
      connection.conn.send({
        cmd: cmd,
        data: {
          // ...getInfoStream(),
          ...messague,
        },
      });
    });
  },

  sendMessague: (arrayConnections, cmd, messague) => {
    // console.log(arrayConnections)
    arrayConnections.forEach((connection) => {
      connection.conn.send({
        cmd: cmd,
        data: messague,
      });
    });
  },

  sendMessageById: (peersId, cmd, message) => {
    peersId.forEach((id) => {
      get()
        .connections.find((connection) => connection.idPeer == id)
        .conn.send({
          cmd: cmd,
          data: message,
        });
    });
  },

  connections: [],
  getConnections: () => get().connections,
  pushConnections: (connection) => {
    if (get().connections.find((con) => con.idPeer === connection.peer)) return;
    set((state) => ({
      connections: [
        ...state.connections,
        {
          idPeer: connection.peer,
          conn: connection,
          calls: [],
        },
      ],
    }));
    // console.log(get().peer)
  },
  deleteConnection: (idPeer) => {
    set((state) => ({
      connections: state.connections.filter((conn) => conn.idPeer != idPeer),
    }));
  },

  getCall: (idPeer, idCall) => {
    return get()
      .connections.find((connection) => connection.idPeer == idPeer)
      .calls.find((call) => call.idCall == idCall);
  },

  addCall: (call, stream, inOrOut) => {
    set((state) => ({
      connections: state.connections.map((connection) => {
        if (connection.idPeer == call.peer) {
          return {
            ...connection,
            calls: connection.calls
              ? [
                  ...connection.calls,
                  {
                    idCall: call.connectionId,
                    stream,
                    inOrOut,
                    call,
                  },
                ]
              : [{ idCall: call.connectionId, stream, inOrOut, call }],
          };
        }
        return connection;
      }),
    }));
    // console.log(get().peer)
  },

  closeAndDeleteCall: (idPeer, idCall) => {
    set((state) => ({
      connections: state.connections.map((connection) => {
        //to improve
        if (connection.idPeer == idPeer) {
          return {
            ...connection,
            calls: connection.calls.filter((call) => {
              if (call.call.connectionId == idCall) {
                call.call.close();
                return false;
              }
              return true;
            }),
          };
        }
        return connection;
      }),
    }));
    // console.log(get().connections)
  },
  closeCallsOutput: () => {
    // console.log(get().connections)
    set((state) => ({
      connections: state.connections.map((connection) => {
        return {
          ...connection,
          calls: connection.calls.filter((call) => {
            if (call.inOrOut == 'in') {
              // if (call.inOrOut == 'out') {
              call.call.close();
              return false;
            }
            return true;
          }),
        };
      }),
    }));
  },

  exitPeerNetwork: () => {
    console.log('cerrando toda la network');
    get()
      .getConnections()
      .forEach((connection) => {
        // improve
        connection.conn.close();
        if (connection.calls) {
          connection.calls.forEach((callObject) => {
            callObject.call.close();
          });
        }
      });
  },

  destroyPeer: () => {
    const peer = get().peer;
    console.log('peer', peer);
    if (peer) {
      get().exitPeerNetwork();
      peer.destroy();
    }
    set({
      peer: null,
      idPeer: '',
      connections: [],
    });
  },

  initPeerNetwork: () => {
    const peerStore = get();
    const streamStore = useStreamStore.getState();
    const userStore = useUserStore.getState();
    const playerStore = usePlayerStore.getState();
    const modal = modalStore.getState();

    const {
      getLocalStream,
      setRemoteStream,
      getRemoteStream,
      clearRemoteStream,
      showNotification,
      addAvailableStreamPeer,
      removeAvailableStreamPeer,
    } = streamStore;
    const { getUser, setUser } = userStore;
    const { setPlayerInfo } = playerStore;
    const { setIsOpenModalVideoPlayer } = modal;

    const username = localStorage.getItem('username') || generateName();
    setUser({ username });

    const peerNetwork = createPeerNetwork();

    const processIncomingData = (cmd: string, data: any, conn: any) => {
      if (cmd == PAGE_MESSAGE_TYPES.ELEMENT_ACTION) {
        if (
          getRemoteStream() ||
          peerStore.getSessionMode() == 'uploadedVideo'
        ) {
          peerStore.setElementAction({ ...data });
        } else {
          window.postMessage(
            { cmd: cmd, data: { ...data, status: 'received' } },
            '*'
          );
        }
      } else if (cmd == 'addAvailableStreamPeer') {
        showNotification({ username: data.username });
        addAvailableStreamPeer(conn.peer, data);
      } else if (cmd == 'removeAvailableStreamPeer') {
        removeAvailableStreamPeer(conn.peer);
      } else if (cmd == PAGE_MESSAGE_TYPES.RESULT_VIDEO_INFO) {
        setPlayerInfo(data);
      } else if (cmd == PAGE_MESSAGE_TYPES.GET_VIDEO_INFO) {
        window.postMessage({ cmd: PAGE_MESSAGE_TYPES.GET_VIDEO_INFO }, '*');
      }
    };

    peerNetwork.on('open', (peerId: string, peer: any) => {
      // console.log('peerNetwork.peer', peer);
      peerStore.setPeer(peer);
      peerStore.setIdPeer(peerId);
    });
    peerNetwork.on('openRecived', (conn: any, status: string) => {
      peerStore.pushConnections(conn);
      if (status == 'sent') {
      } else {
        if (getLocalStream()) {
          peerStore.sendMessague([{ conn }], 'addAvailableStreamPeer', {
            username: getUser().username,
          });
        }
      }
    });
    peerNetwork.on('data', processIncomingData);
    peerNetwork.on('close', (conn: any) => {
      peerStore.deleteConnection(conn.peer);
      removeAvailableStreamPeer(conn.peer);
    });
    peerNetwork.on('callSend', (call: any) => {
      peerStore.addCall(call, false, 'out');
    });
    peerNetwork.on('callRecived', (call: any) => {
      call.answer(getLocalStream());
      peerStore.addCall(call, true, 'in');
    });
    peerNetwork.on('closeCall', () => {
      setIsOpenModalVideoPlayer(false);
      clearRemoteStream();
    });
    peerNetwork.on('streamCall', (stream: any, call: any) => {
      const existing = getRemoteStream();
      if (existing && existing.callId !== call.connectionId) {
        peerStore.closeAndDeleteCall(existing.peerId, existing.callId);
      }
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

    peerStore.setPeer(peerNetwork.peer);
    peerStore.setConnect(peerNetwork.connect);
    peerStore.setCall(peerNetwork.callF);
  },
}));

type PeerType = any;
type ConnType = {
  peer: string;
  send: (data: any) => void;
  close: () => void;
};
type CallObjType = {
  connectionId: string;
  peer: string;
  close: () => void;
};
type StreamType = any;
type InOrOut = 'in' | 'out';

type Connection = {
  idPeer: string;
  conn: ConnType;
  calls: Call[];
};

type Call = {
  idCall: string;
  stream: StreamType;
  inOrOut: InOrOut;
  call: CallObjType;
};

type ElementAction = {
  action: string;
  mediaCurrentTime: number;
};

type SessionMode = 'idle' | 'stream' | 'uploadedVideo' | 'extension';

type PeerStore = {
  idPeer: string;
  setIdPeer: (idPeer: string) => void;

  peer: PeerType | null;
  setPeer: (npeer: PeerType) => void;
  getPeer: () => PeerType | null;

  elementAction: ElementAction;
  setElementAction: (state: ElementAction) => void;

  sessionMode: SessionMode;
  getSessionMode: () => SessionMode;
  setSessionMode: (mode: SessionMode) => void;

  connect: ((...args: any[]) => any) | null;
  setConnect: (fn: (...args: any[]) => any) => void;

  call: ((...args: any[]) => any) | null;
  setCall: (fn: (...args: any[]) => any) => void;

  sendMessagueAll: (cmd: string, messague: Record<string, any>) => void;
  sendMessague: (
    arrayConnections: { conn: ConnType }[],
    cmd: string,
    messague: Record<string, any>
  ) => void;
  sendMessageById: (
    peersId: string[],
    cmd: string,
    messague: Record<string, any>
  ) => void;

  connections: Connection[];
  getConnections: () => Connection[];
  pushConnections: (connection: ConnType & { peer: string }) => void;
  deleteConnection: (idPeer: string) => void;

  getCall: (idPeer: string, idCall: string) => Call | undefined;

  addCall: (call: CallObjType, stream: StreamType, inOrOut: InOrOut) => void;

  closeAndDeleteCall: (idPeer: string, idCall: string) => void;
  closeCallsOutput: () => void;
  exitPeerNetwork: () => void;
  destroyPeer: () => void;
  initPeerNetwork: () => void;
};
