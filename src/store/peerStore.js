import { create } from "zustand";

export const usePeerStore = create((set, get) => ({
    idPeer: '',
    setIdPeer: (idPeer) => set({ idPeer }),

    peer: null,
    setPeer: (npeer) => set({ peer: npeer }),
    getPeer: () => get().peer,

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