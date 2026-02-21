import { create } from 'zustand';

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

type PeerStore = {
  idPeer: string;
  setIdPeer: (idPeer: string) => void;

  peer: PeerType | null;
  setPeer: (npeer: PeerType) => void;
  getPeer: () => PeerType | null;

  elementAction: ElementAction;
  setElementAction: (state: ElementAction) => void;

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
};
