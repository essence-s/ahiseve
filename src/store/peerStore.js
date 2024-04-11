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
        if (get().connections.find(con => con.peer === connection.peer)) return
        set((state) => ({ connections: [...state.connections, connection] }))
    },

    incomingConnections: [],
    getIncomingConnections: () => get().incomingConnections,
    pushIncomingConnections: (connection) => {
        if (get().incomingConnections.find(con => con.peer === connection.peer)) return
        set((state) => ({ incomingConnections: [...state.incomingConnections, connection] }))
    },

    outgoingConnections: [],
    getOutgoingConnections: () => get().outgoingConnections,
    pushOutgoingConnections: (connection) => {
        if (get().outgoingConnections.find(con => con.peer === connection.peer)) return
        set((state) => ({ outgoingConnections: [...state.outgoingConnections, connection] }))
    },

    calls: null,
    setCalls: (call) => set({ calls: call }),
    getCalls: () => get().calls,

    arrayCallsServer: [],
    setArrayCallsServer: (acs) => {
        set({ arrayCallsServer: [...get().arrayCallsServer, acs] })
        // console.log(get().arrayCallsServer)
    },
    getArrayCallsServer: () => get().arrayCallsServer,
}))