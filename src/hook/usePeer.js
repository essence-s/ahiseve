import { usePeerStore } from "@/store/peerStore"
import { useStreamStore } from "@/store/streamStore"
import { useState } from "react"
import { modalStore } from "../store/modalStore"


export function usePeer() {
    let { idPeer, connections,
        peer, getPeer, getConnections, closeAndDeleteCall, closeCallsOutput,
        connectPeer, on, createServerI, sendMessague, sendMessagueAll, callF, exitPeerNetwork
    } = usePeerStore(state => state)

    let { getStreamL, infoStream, setInfoStream, getInfoStream,
        addStreamingUsers, deleteStreamingUser, addActiveStreamingUserCaptScreen,
        getActiveStreamig, setNullActiveStreamingUserCaptScreen, startStreamStore,
        stopStreamingStore } = useStreamStore(state => ({
            setStreamL: state.setStreamL, getStreamL: state.getStreamL,
            infoStream: state.infoStream, setInfoStream: state.setInfoStream, getInfoStream: state.getInfoStream,
            addStreamingUsers: state.addStreamingUsers, deleteStreamingUser: state.deleteStreamingUser, addActiveStreamingUserCaptScreen: state.addActiveStreamingUserCaptScreen,
            getActiveStreamig: state.getActiveStreamig, setNullActiveStreamingUserCaptScreen: state.setNullActiveStreamingUserCaptScreen, startStreamStore: state.startStreamStore,
            stopStreamingStore: state.stopStreamingStore
        }))

    let { setIsOpenModalVideoPlayer } = modalStore(state => ({
        setIsOpenModalVideoPlayer: state.setIsOpenModalVideoPlayer
    }))

    let [nameUser, setNameUser] = useState(generateName())


    let colorBackgroundUser = [
        'rgb(165, 147, 182)',
        'rgb(108, 76, 110)',
        'rgb(223, 91, 104)',
        'rgb(248, 239, 139)',
        'rgb(111, 41, 210)'
    ]

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const availableBackground = (arrayUser) => {
        let available = colorBackgroundUser.filter((back) => {
            return !arrayUser.some((user) => user.background == back)
        })

        return available.length > 0 ? available[0] : getRandomColor()

    }

    //to improve
    function generateName() {
        const caracters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';

        for (let i = 0; i < 6; i++) {
            const indice = Math.floor(Math.random() * caracters.length);
            name += caracters.charAt(indice);
        }

        return name;
    }

    const createServer = async () => {
        on('openRecived', (conn) => {
            sendMessague([{ conn: conn }], 'addStreamingUsers', getInfoStream())
        })
        on('data', processIncomingData)
        on('close', (conn) => {
            deleteStreamingUser(conn.peer)
        })
        on('closeCall', () => {
            setIsOpenModalVideoPlayer(false)
        })
        on('streamCall', (stream, call) => {
            addActiveStreamingUserCaptScreen(stream, call.peer, call.connectionId)
            setIsOpenModalVideoPlayer(true)
        })
        createServerI()
    }


    //to improve
    const startStream = async () => {
        try {
            await startStreamStore()
            setInfoStream((state) => {
                let dataInfoStream = {
                    isStream: true,
                    userStreaming: nameUser
                }

                sendMessague(getConnections(), 'addStreamingUsers', dataInfoStream)

                return {
                    ...state,
                    ...dataInfoStream
                }
            })
        } catch (err) {
            console.log("Error al obtener acceso a la pantalla:", err)
        }

    }

    const stopStreaming = () => {
        stopStreamingStore.then(_ => {
            closeAllCallConnectionsOutput()
        }).catch(err => {
            console.log(err)
        })
    }

    const viewStream = (idPeer) => {
        // let peerUserMaster = findConnection()
        // console.log(idPeer)
        let dataFind = getConnections().find(connection => connection.idPeer == idPeer)
        dataFind && dataFind.conn.send({ cmd: 'viewStream', data: { peer: idPeer } })

    }

    const closeAllCallConnectionsOutput = () => {

        setInfoStream((state) => {
            let dataInfoStream = {
                isStream: false,
                userStreaming: nameUser
            }

            sendMessague(getConnections(), 'addStreamingUsers', dataInfoStream)

            return {
                ...state,
                ...dataInfoStream
            }
        })

        closeCallsOutput()
    }

    const processIncomingData = (cmd, data, conn) => {
        if (cmd == 'element-action') {
            window.postMessage({
                cmd: cmd,
                data: {
                    ...data,
                    status: 'received'
                },
            }, "*",);

            // console.log(data)

        } else if (cmd == 'viewStream') {
            console.log('el  id ' + conn.peer + ' pidio el stream')
            callF(conn, getStreamL())
        }

        else if (cmd == "addStreamingUsers") {
            console.log('info de user Obtenida')
            addStreamingUsers(conn.peer, { ...data })
        }
    }

    const closeActiveStreamig = () => {
        // console.log(getActiveStreamig())
        let dataCaptScreen = getActiveStreamig().captScreen
        if (dataCaptScreen) {
            let { idPeer, idCall } = dataCaptScreen
            closeAndDeleteCall(idPeer, idCall)
            setNullActiveStreamingUserCaptScreen()
        }

    }

    return {
        idPeer,
        connectPeer,
        createServer,
        connections,
        startStream,
        infoStream,
        peer,
        getPeer,
        getConnections,
        viewStream,
        stopStreaming,
        sendMessagueAll,
        closeActiveStreamig,
        exitPeerNetwork
    }
}