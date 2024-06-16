import { create } from "zustand";

export const usePeerStore = create((set, get) => ({
    idPeer: '',
    setIdPeer: (idPeer) => set({ idPeer }),

    peer: null,
    setPeer: (npeer) => set({ peer: npeer }),
    getPeer: () => get().peer,

    connectionCallbacks: {
        openRecived: [],
        data: [],
        close: [],
        closeCall: [],
        streamCall: []
    },
    on: (event, callback) => {
        set(state => ({
            connectionCallbacks: {
                ...state.connectionCallbacks,
                [event]: [
                    ...state.connectionCallbacks[event],
                    callback
                ]
            }
        }))
    },
    runCallbacks: (event, ...args) => {
        let connectionCallbacksA = get().connectionCallbacks
        if (connectionCallbacksA[event])
            connectionCallbacksA[event].forEach((funcCallback) => {
                funcCallback(...args)
            })
    },

    // processIncomingData,
    // setProcessIncomingData: (funcPID) => set({ processIncomingData: funcPID }),

    processIncomingDataPeer: ({ cmd, data, conn }, callback) => {
        if (cmd == "addTask:peerListToConnect") {
            if (data.peerListToConnect.length == 0) {
                window.toast({
                    title: 'Connected Susscesfully!',
                    message: '',
                    location: 'top-right',
                    dismissable: false,
                    theme: 'butterupcustom'
                })
            } else {
                get().addTask({
                    sender: conn.peer,
                    ...data
                })

                data.peerListToConnect.forEach(peerId => {
                    get().connectPeer(peerId, data.pendingPeer)
                })
            }


        } else if (cmd == "confirmPeerListToConnect") {
            deleteTask('confirmPeerListToConnect', data.pendingPeer)
        } else {
            callback()
        }
    },
    createServerI: async () => {

        if (get().getPeer()) return

        let Peer = (await import('peerjs')).default
        // let npeer = new Peer({
        //     host: "localhost",
        //     port: 8080,
        // })
        let npeer = new Peer({})

        get().setPeer(npeer)

        npeer.on("open", function (id) {
            console.log("Peer creado: " + id);
            get().setIdPeer(id)
        });

        npeer.on("connection", function (conn) {
            conn.on("data", function ({ cmd, data }) {
                // processIncomingData(cmd, data, conn)
                get().processIncomingDataPeer({ cmd, data, conn }, () => {
                    get().runCallbacks('data', cmd, data, conn)
                })
            });

            conn.on("open", function () {

                // console.log(conn.metadata.eventNetwork)
                if (conn.metadata.eventNetwork) {

                    get().addTask({

                        sender: npeer.id,
                        name: 'confirmPeerListToConnect',
                        pendingPeer: conn.peer
                    })
                    get().sendMessague(
                        [{ conn: conn }],
                        'addTask:peerListToConnect',
                        {
                            name: 'peerListToConnect',
                            peerListToConnect: get().getConnections().map(connection => connection.idPeer),
                            pendingPeer: conn.peer
                        }
                    )
                }

                get().pushConnections(conn);
                // let backgroundUser = availableBackground(getInfoStream().onlineStreamUsers)

                // sendMessague([conn], 'infoStream', dataInfoStream)
                get().runCallbacks('openRecived', conn)
            });

            conn.on("close", function () {
                console.log('se cerro la conexion completa cs')
                get().deleteConnection(conn.peer)
                // deleteStreamingUser(conn.peer)
                get().runCallbacks('close', conn)
            })

        });


        npeer.on("call", (call) => {

            call.answer();
            get().addCall(call, true, 'in')
            // console.log(call)
            call.on("stream", async (stream) => {
                // console.log(getPeer)
                console.log('recibiendo el stream')
                // call.connectionId

                // addActiveStreamingUserCaptScreen(stream, call.peer, call.connectionId)
                // setIsOpenModalVideoPlayer(true)
                get().runCallbacks('streamCall', stream, call)
            });

            call.on("close", () => {
                console.log('se cerro la conexion de la llamada , user')
                get().closeAndDeleteCall(call.peer, call.connectionId)
                // setIsOpenModalVideoPlayer(false)
                // console.log(call)
                get().runCallbacks('closeCall', call)
            });
        });


        window.addEventListener("message", function (event) {
            // console.log('datarenida de evento', event)
            let { cmd, data } = event.data
            if (cmd == "element-action") {
                if (data.status == 'sending') {
                    console.log('emviando', event)
                    get().sendMessagueAll(cmd, data)
                }
            }
        }, false);

    },
    connectPeer: (idEntered, pendingPeer) => {

        if (get().getConnections().find(con => con.idPeer == idEntered)) {
            window.toast({
                title: 'Are you connected!',
                message: '',
                location: 'top-right',
                dismissable: false,
                theme: 'butterupcustom'
            })
            return
        }

        let conn = get().peer.connect(idEntered, { metadata: { eventNetwork: pendingPeer ? false : true } });
        // console.log(pendingPeer ? false : true)
        conn.on("data", function ({ cmd, data }) {
            // get().processIncomingData(cmd, data, conn)
            get().processIncomingDataPeer({ cmd, data, conn }, () => {
                get().runCallbacks('data', cmd, data, conn)
            })
        });

        conn.on("open", function () {
            console.log('se conecto a ' + idEntered)
            get().updateTask('peerListToConnect', pendingPeer, conn.peer)
            let dataVerifyTask = get().verifyTask('peerListToConnect', pendingPeer)
            // console.log(dataVerifyTask)
            if (dataVerifyTask) {
                get().deleteTask('peerListToConnect', pendingPeer)
                get().sendMessague(
                    [get().getConnections().find(connection => connection.idPeer == dataVerifyTask.sender)],
                    'confirmPeerListToConnect',
                    { pendingPeer }
                )
                console.log('se conecto ala network')
                window.toast({
                    title: 'Connected Susscesfully!',
                    message: '',
                    location: 'top-right',
                    dismissable: false,
                    theme: 'butterupcustom'
                })
            }

            get().pushConnections(conn);

        });

        conn.on("close", function () {
            console.log('se cerro la conexion completa')
            get().deleteConnection(conn.peer)

            get().runCallbacks('close', conn)
        })
    },


    sendMessagueAll: (cmd, messague) => {
        let conectionsG = get().getConnections()

        conectionsG.forEach((connection) => {
            connection.conn.send({
                cmd: cmd,
                data: {
                    // ...getInfoStream(),
                    ...messague
                }
            })
        })
    },

    sendMessague: (arrayConnections, cmd, messague) => {
        // console.log(arrayConnections)
        arrayConnections.forEach((connection) => {
            connection.conn.send({
                cmd: cmd,
                data: messague
            });
        });
    },

    connections: [],
    getConnections: () => get().connections,
    pushConnections: (connection) => {
        if (get().connections.find(con => con.idPeer === connection.peer)) return
        set((state) => ({
            connections: [...state.connections, {
                idPeer: connection.peer,
                conn: connection,
                calls: []
            }]
        }))
        // console.log(get().peer)
    },
    deleteConnection: (idPeer) => {
        set((state) => ({ connections: state.connections.filter(conn => conn.idPeer != idPeer) }))
    },

    setCalls: (call) => set({ calls: call }),
    getCall: (idPeer, idCall) => {

        return get().connections.find(connection.idPeer == idPeer)
            .calls.find(call => call.idCall == idCall)
    },

    addCall: (call, stream, inOrOut) => {
        set((state) => ({

            connections: state.connections.map(connection => {
                if (connection.idPeer == call.peer) {
                    return {
                        ...connection,
                        calls: connection.calls ?
                            [
                                ...connection.calls,
                                {
                                    idCall: call.connectionId,
                                    stream, inOrOut, call
                                }
                            ]
                            : [{ idCall: call.connectionId, stream, inOrOut, call }]
                    }
                }
                return connection
            })

        }))
        // console.log(get().peer)
    },
    updateCall: (id, data) => {
        get().connections.find(connection => connection.idPeer == id)
        set((state) => ({

            connections: state.connections.map(connection => {
                if (connection.idPeer == id) {
                    return {
                        ...connection,
                        calls: connection.calls ? [...connection.calls, { stream, inOrOut, call }] : { stream, inOrOut, call }
                    }
                }
                return connection
            })

        }))
    },
    closeAndDeleteCall: (idPeer, idCall) => {

        set(state => ({
            connections: state.connections.map(connection => {
                //to improve
                if (connection.idPeer == idPeer) {
                    return {
                        ...connection,
                        calls: connection.calls.filter(call => {
                            if (call.call.connectionId == idCall) {
                                call.call.close()
                                return false
                            }
                            return true
                        })
                    }
                }
                return connection
            })
        }))
        // console.log(get().connections)
    },
    closeCallsOutput: () => {
        // console.log(get().connections)
        set(state => ({
            connections: state.connections.map(connection => {
                return {
                    ...connection,
                    calls: connection.calls.filter(call => {
                        if (call.inOrOut == 'out') {
                            call.call.close()
                            return false
                        }
                        return true
                    })
                }

            })
        }))
    },


    tasks: [],
    getTasks: () => get().tasks,
    addTask: (task) => {
        set(state => ({
            tasks: [
                ...state.tasks,
                task
            ]
        }))
    },

    updateTask: (name, pendingPeer, data) => {
        if (name == 'peerListToConnect') {
            set(state => ({
                tasks: state.tasks.map(task => {
                    if (task.name == name && task.pendingPeer == pendingPeer) {
                        return {
                            ...task,
                            peerListToConnect: [...task.peerListToConnect.filter(peer => peer != data)]
                        }
                    }
                    return task
                })
            }))
        }
    },

    verifyTask: (name, pendingPeer) => {
        if (name == 'peerListToConnect') {
            let findTask = get().tasks.find(task => task.name == name && task.pendingPeer == pendingPeer)
            return findTask?.peerListToConnect?.length == 0 ? findTask : false
        }
    },

    deleteTask: (name, pendingPeer) => {
        set(state => ({
            tasks: state.tasks.filter(task => !(task.name == name && task.pendingPeer == pendingPeer))
        }))
    }

}))