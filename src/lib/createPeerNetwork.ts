import Peer from 'peerjs';
const peerServer = import.meta.env.PUBLIC_PEER_SERVER;
const stunUrl = import.meta.env.PUBLIC_PEER_STUN;
const turnUrl = import.meta.env.PUBLIC_PEER_TURN_URL;
const turnUser = import.meta.env.PUBLIC_PEER_TURN_USERNAME;
const turnPass = import.meta.env.PUBLIC_PEER_TURN_PASSWORD;

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
    // console.log('peer create', peer);
    if (peer) return console.log('network existente');
    const storedId = localStorage.getItem('myPeerId');
    let peerOptions: any = {};

    if (peerServer) {
      peerOptions.host = peerServer;
      peerOptions.secure = true;
    }

    if (turnUrl && turnUser && turnPass) {
      peerOptions = {
        ...peerOptions,
        config: {
          iceServers: [
            { urls: stunUrl || 'stun:stun.l.google.com:19302' },
            {
              urls: turnUrl,
              username: turnUser,
              credential: turnPass,
            },
          ],
        },
      };
    }

    peer = new Peer(storedId, peerOptions);

    peer.on('open', (peerId) => {
      console.log('Peer creado: ' + peerId);
      myPeerId = peerId;
      localStorage.setItem('myPeerId', peerId);
      emit('open', peerId, peer);
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
        console.log('se cerro la conexion de la llamada que se recibio');
        closeAndDeleteCall(call.peer, call.connectionId);
        // emit('closeCall', call);
      });
      call.on('error', (error) => console.log('error en call', error));
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
        // CONN_LIST_STEP 01 Enviar la lista a la nueva conexion
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
      // al conectar desde el componente puede enviar el callback para
      // recibir si termino de conectarse a la lista
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

      // CONN_LIST_STEP 05 hacer la conexion enviando un parametro por metadata
      // el parametro eventNetwork le dice al abrir la conexion que sea tratado como una
      // conexion de lista
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
        // CONN_LIST_STEP 06 cuando recibimos tambien la conexion que hicimos
        // actualizamos muestra lista de conectados
        updateTask('peerListToConnect', pendingPeer, conn.peer);
        let dataVerifyTask = verifyTask('peerListToConnect', pendingPeer);

        // CONN_LIST_STEP 07 verificamos si se termino la tarea de las lista a conectar
        if (dataVerifyTask) {
          // si se termino eliminamos la tarea
          deleteTask('peerListToConnect', pendingPeer);
          // CONN_LIST_STEP 08 enviamos el mensaje de se termino de conectar al que nos envio la lista
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
    // CONN_LIST_STEP 02 llegada del la lista a conectar
    if (cmd == 'addTask:peerListToConnect') {
      // si la lista esta vacia entonces mandamos el mensaje de conectado
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
        // CONN_LIST_STEP 03 se agrega la tarea de conectarse a los peers de la lista que se recibio
        addTask({
          sender: conn.peer,
          ...data,
        });

        // CONN_LIST_STEP 04 empezamos la conexio los peers de la lista
        data.peerListToConnect.forEach((peerId) => {
          connect(peerId, data.pendingPeer);
        });
      }

      // CONN_LIST_STEP 09 llegada de la confirmacion del termino de la conexion de la lista
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
    tasks.push(task);
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
    const options = {
      constraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true,
        },
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      },
    };

    const call = peer.call(conn.peer, new MediaStream(), options);

    console.log('se hace la llamada a ' + conn.peer);
    // console.log('se le envia el stream a ' + conn.peer);
    addCall(call, false, 'out');
    emit('callSend', call);

    call.on('stream', (stream) => {
      // console.log('se establecio en stream');
      console.log('recibiendo el stream');
      emit('streamCall', stream, call);
    });

    call.on('close', () => {
      closeAndDeleteCall(conn.peer, call.connectionId);
      emit('closeCall', call);
      console.log('se cerro la llamada que se inicio');
    });
    call.on('error', (error) => console.log('error en call', error));
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
    peer,
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
