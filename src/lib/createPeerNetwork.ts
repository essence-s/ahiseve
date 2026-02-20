import Peer from 'peerjs';

export function createPeerNetwork() {
  let myPeerId = null;
  let peer = null;
  let connections = {};
  let handlers = {
    open: [],
    openRecived: [],
    data: [],
    close: [],
    closeCall: [],
    callSend: [],
    callRecived: [],
    streamCall: [],
    callbackConnectToList: [],
  };

  const init = () => {
    const storedId = localStorage.getItem('myPeerId');
    // peer = new Peer(storedId, {
    //   host: 'localhost',
    //   port: 8080,
    // });
    peer = new Peer(storedId);

    peer.on('open', (peerId) => {
      console.log('Peer creado: ' + peerId);
      myPeerId = peerId;
      localStorage.setItem('myPeerId', peerId);
      emit('open', peerId);
    });

    peer.on('connection', (conn) => {
      _setupConnection(conn);
    });

    peer.on('call', (call) => {
      emit('callRecived', call);
      addCall(call, true, 'in');
      call.on('stream', async (stream) => {
        // console.log('recibiendo el stream');
        console.log('se establecio en stream');
        // emit('streamCall', stream, call);
      });

      call.on('close', () => {
        console.log('se cerro la conexion de la llamada , user');
        closeAndDeleteCall(call.peer, call.connectionId);
        emit('closeCall', call);
      });
      // call.on('error', (error) => console.log('error en call', error));
    });

    peer.on('error', (error) => console.log('error en peer', error));
  };

  const _setupConnection = (conn) => {
    conn.on('data', function ({ cmd, data }) {
      processIncomingDataPeer({ cmd, data, conn }, () => {
        emit('data', cmd, data, conn);
      });
    });

    conn.on('open', function () {
      if (conn.metadata.eventNetwork) {
        addTask({
          sender: peer.id,
          name: 'confirmPeerListToConnect',
          pendingPeer: conn.peer,
        });
        sendTo([{ conn }], 'addTask:peerListToConnect', {
          name: 'peerListToConnect',
          peerListToConnect: Object.keys(connections),
          pendingPeer: conn.peer,
        });
      }

      pushConnections(conn);
      emit('openRecived', conn);
    });

    conn.on('close', function () {
      console.log('se cerro la conexion completa cs');
      deleteConnection(conn.peer);
      emit('close', conn);
    });
  };

  const connect = async (idEntered, pendingPeer, callback?) => {
    return new Promise((resolve, reject) => {
      if (callback) {
        if (handlers.callbackConnectToList.length == 0) {
          on('callbackConnectToList', resolve);
        } else {
          reject('no puede conectarse a un nuevo grupo');
          return;
        }
      }

      if (connections[idEntered]) {
        window.toast({
          title: 'Are you connected!',
          message: '',
          location: 'top-right',
          dismissable: false,
          theme: 'butterupcustom',
        });
        return;
      }

      let conn = peer.connect(idEntered, {
        metadata: { eventNetwork: pendingPeer ? false : true },
      });

      conn.on('data', function ({ cmd, data }) {
        processIncomingDataPeer({ cmd, data, conn }, () => {
          emit('data', cmd, data, conn);
        });
      });

      conn.on('open', function () {
        console.log('se conecto a ' + idEntered);
        updateTask('peerListToConnect', pendingPeer, conn.peer);
        let dataVerifyTask = verifyTask('peerListToConnect', pendingPeer);

        if (dataVerifyTask) {
          deleteTask('peerListToConnect', pendingPeer);
          sendTo(
            [connections[dataVerifyTask.sender]],
            'confirmPeerListToConnect',
            { pendingPeer }
          );
          emit('callbackConnectToList');
          cleanEmit('callbackConnectToList');
          console.log('se conecto ala network');
          window.toast({
            title: 'Connected Susscesfully!',
            message: '',
            location: 'top-right',
            dismissable: false,
            theme: 'butterupcustom',
          });
        }
        pushConnections(conn);
        emit('openRecived', conn, 'sent');
      });

      conn.on('close', function () {
        console.log('se cerro la conexion completa');
        deleteConnection(conn.peer);

        emit('close', conn);
      });
    });
  };

  const on = (event, callback) => {
    handlers[event] ||= [];
    handlers[event].push(callback);
  };

  const emit = (event, ...args) => {
    (handlers[event] || []).forEach((fn) => fn(...args));
  };

  const cleanEmit = (event) => {
    handlers = {
      ...handlers,
      [event]: [],
    };
  };

  const sendTo = (arrayConnections, cmd, message) => {
    arrayConnections.forEach((connection) => {
      connection.conn.send({
        cmd: cmd,
        data: message,
      });
    });
  };

  const broadcast = (cmd, messague) => {
    Object.values(connections).forEach(({ conn }: any) => {
      conn.send({
        cmd: cmd,
        data: {
          ...messague,
        },
      });
    });
  };

  const processIncomingDataPeer = ({ cmd, data, conn }, callback) => {
    if (cmd == 'addTask:peerListToConnect') {
      if (data.peerListToConnect.length == 0) {
        window.toast({
          title: 'Connected Susscesfully!',
          message: '',
          location: 'top-right',
          dismissable: false,
          theme: 'butterupcustom',
        });
        emit('callbackConnectToList');
        cleanEmit('callbackConnectToList');
      } else {
        addTask({
          sender: conn.peer,
          ...data,
        });

        data.peerListToConnect.forEach((peerId) => {
          connect(peerId, data.pendingPeer);
        });
      }
    } else if (cmd == 'confirmPeerListToConnect') {
      deleteTask('confirmPeerListToConnect', data.pendingPeer);
    } else {
      callback();
    }
  };

  const getConnections = () => connections;
  const pushConnections = (connection) => {
    if (connections[connection.peer]) return;
    connections[connection.peer] = {
      idPeer: connection.peer,
      conn: connection,
      calls: [],
    };
  };

  const deleteConnection = (idPeer) => {
    delete connections[idPeer];
  };

  let tasks = [];
  const addTask = (task) => {
    tasks = [tasks, task];
  };

  const updateTask = (name, pendingPeer, data) => {
    if (name == 'peerListToConnect') {
      tasks = tasks.map((task) => {
        if (task.name == name && task.pendingPeer == pendingPeer) {
          return {
            ...task,
            peerListToConnect: [
              ...task.peerListToConnect.filter((peer) => peer != data),
            ],
          };
        }
        return task;
      });
    }
  };

  const verifyTask = (name, pendingPeer) => {
    if (name == 'peerListToConnect') {
      let findTask = tasks.find(
        (task) => task.name == name && task.pendingPeer == pendingPeer
      );
      return findTask?.peerListToConnect?.length == 0 ? findTask : false;
    }
  };

  const deleteTask = (name, pendingPeer) => {
    tasks = tasks.filter(
      (task) => !(task.name == name && task.pendingPeer == pendingPeer)
    );
  };

  // const setCalls= (call) => set({ calls: call }),
  const getCall = (idPeer, idCall) => {
    return connections[idPeer].calls.find((call) => call.idCall == idCall);
  };

  const addCall = (call, stream, inOrOut) => {
    connections[call.peer].calls = connections[call.peer].calls
      ? [
          ...connections[call.peer].calls,
          {
            idCall: call.connectionId,
            stream,
            inOrOut,
            call,
          },
        ]
      : [{ idCall: call.connectionId, stream, inOrOut, call }];
  };
  // const updateCall= (id, data) => {
  //   get().connections.find((connection) => connection.idPeer == id);
  //   set((state) => ({
  //     connections: state.connections.map((connection) => {
  //       if (connection.idPeer == id) {
  //         return {
  //           ...connection,
  //           calls: connection.calls
  //             ? [...connection.calls, { stream, inOrOut, call }]
  //             : { stream, inOrOut, call },
  //         };
  //       }
  //       return connection;
  //     }),
  //   }));
  // }
  const closeAndDeleteCall = (idPeer, idCall) => {
    connections[idPeer] = {
      ...connections[idPeer],
      calls: connections[idPeer].calls.filter((call) => {
        if (call.call.connectionId == idCall) {
          call.call.close();
          return false;
        }
        return true;
      }),
    };
  };

  const closeCallsOutput = () => {
    Object.keys(connections).forEach((connection) => {
      connections[connection] = {
        ...connections[connection],
        calls: connections[connection].calls.filter((call) => {
          if (call.inOrOut == 'out') {
            call.call.close();
            return false;
          }
          return true;
        }),
      };
    });
  };

  const callF = (conn, stream, metadata) => {
    const emptyStream = new MediaStream();
    const call = peer.call(conn.peer, emptyStream, {
      constraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      },
    });
    // const call = peer.call(conn.peer, emptyStream, {
    //   sdpTransform: (sdp) => {
    //     // Forzar el offerToReceiveAudio / Video en el SDP
    //     return sdp.replace(/a=sendrecv/g, 'a=recvonly');
    //   },
    // });
    // const call = peer.call(conn.peer, stream, { metadata });
    console.log('call', call);
    console.log('se hace la llamada a ' + conn.peer);
    // console.log('se le envia el stream a ' + conn.peer);
    addCall(call, false, 'out');
    emit('callSend', call);

    call.on('stream', (stream) => {
      // console.log('se establecio en stream');
      console.log('recibiendo el stream');
      console.log('call en stream', call);
      emit('streamCall', stream, call);
    });

    call.on('close', () => {
      closeAndDeleteCall(conn.peer, call.connectionId);
      console.log('se cerro la llamada , server , llamada posterior');
    });
  };

  const exitPeerNetwork = () => {
    console.log('cerrando toda la network');
    Object.entries(connections).forEach(([keys, value]: any) => {
      // improve
      value.conn.close();
      if (value.calls) {
        value.calls.forEach((callObject) => {
          callObject.call.close();
        });
      }
    });
  };

  return {
    init,
    on,
    connect,
    sendTo,
    broadcast,
    connections,
    getConnections,
    callF,
    exitPeerNetwork,
    closeCallsOutput,
    closeAndDeleteCall,
  };
}
