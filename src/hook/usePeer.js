import { usePeerStore } from "@/store/peerStore"
import { useStreamStore } from "@/store/streamStore"
import { useState } from "react"
import { modalStore } from "../store/modalStore"


export function usePeer() {
    let { idPeer, setIdPeer, connections, pushConnections,
        peer, setPeer, getPeer, getConnections, deleteConnection,
        addCall, closeAndDeleteCall, closeCallsOutput,
        getTasks, addTask, updateTask, verifyTask, deleteTask
    } = usePeerStore(state => state)

    let { setStreamL, getStreamL, infoStream, setInfoStream, getInfoStream,
        addStreamingUsers, deleteStreamingUser, addActiveStreamingUserCaptScreen, getActiveStreamig, setNullActiveStreamingUserCaptScreen } = useStreamStore(state => ({
            setStreamL: state.setStreamL, getStreamL: state.getStreamL,
            infoStream: state.infoStream, setInfoStream: state.setInfoStream, getInfoStream: state.getInfoStream,
            addStreamingUsers: state.addStreamingUsers, deleteStreamingUser: state.deleteStreamingUser, addActiveStreamingUserCaptScreen: state.addActiveStreamingUserCaptScreen,
            getActiveStreamig: state.getActiveStreamig, setNullActiveStreamingUserCaptScreen: state.setNullActiveStreamingUserCaptScreen
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

    const connectPeer = (idEntered, pendingPeer) => {

        if (getConnections().find(con => con.idPeer == idEntered)) {
            window.toast({
                title: 'Are you connected!',
                message: '',
                location: 'top-right',
                dismissable: false,
                theme: 'butterupcustom'
            })
            return
        }

        let conn = peer.connect(idEntered, { metadata: { eventNetwork: pendingPeer ? false : true } });
        // console.log(pendingPeer ? false : true)
        conn.on("data", function ({ cmd, data }) {
            processIncomingData(cmd, data, conn)
        });

        conn.on("open", function () {
            console.log('se conecto a ' + idEntered)
            updateTask('peerListToConnect', pendingPeer, conn.peer)
            let dataVerifyTask = verifyTask('peerListToConnect', pendingPeer)
            // console.log(dataVerifyTask)
            if (dataVerifyTask) {
                deleteTask('peerListToConnect', pendingPeer)
                sendMessague(
                    [getConnections().find(connection => connection.idPeer == dataVerifyTask.sender)],
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

            pushConnections(conn);

        });

        conn.on("close", function () {
            console.log('se cerro la conexion completa')
            deleteConnection(conn.peer)
            deleteStreamingUser(conn.peer)
        })
    }

    const createServer = async () => {

        if (getPeer()) return

        let Peer = (await import('peerjs')).default
        // let npeer = new Peer({
        //     host: "localhost",
        //     port: 8080,
        // })
        let npeer = new Peer({})

        setPeer(npeer)

        npeer.on("open", function (id) {
            console.log("Peer creado: " + id);
            setIdPeer(id)
        });

        npeer.on("connection", function (conn) {
            conn.on("data", function ({ cmd, data }) {
                processIncomingData(cmd, data, conn)
            });

            conn.on("open", function () {

                // console.log(conn.metadata.eventNetwork)
                if (conn.metadata.eventNetwork) {

                    addTask({

                        sender: npeer.id,
                        name: 'confirmPeerListToConnect',
                        pendingPeer: conn.peer
                    })
                    sendMessague(
                        [{ conn: conn }],
                        'addTask:peerListToConnect',
                        {
                            name: 'peerListToConnect',
                            peerListToConnect: getConnections().map(connection => connection.idPeer),
                            pendingPeer: conn.peer
                        }
                    )
                }

                pushConnections(conn);
                // let backgroundUser = availableBackground(getInfoStream().onlineStreamUsers)

                // sendMessague([conn], 'infoStream', dataInfoStream)
                sendMessague([{ conn: conn }], 'addStreamingUsers', getInfoStream())

            });

            conn.on("close", function () {
                console.log('se cerro la conexion completa cs')
                deleteConnection(conn.peer)
                deleteStreamingUser(conn.peer)
            })

        });


        npeer.on("call", (call) => {

            call.answer();
            addCall(call, true, 'in')
            // console.log(call)
            call.on("stream", async (stream) => {
                // console.log(getPeer)
                console.log('recibiendo el stream')
                // call.connectionId
                addActiveStreamingUserCaptScreen(stream, call.peer, call.connectionId)
                setIsOpenModalVideoPlayer(true)
            });

            call.on("close", () => {
                console.log('se cerro la conexion de la llamada , user')
                closeAndDeleteCall(call.peer, call.connectionId)
                setIsOpenModalVideoPlayer(false)
                // console.log(call)
            });
        });

    }


    //to improve
    const startStream = async () => {

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: {
                    suppressLocalAudioPlayback: false,
                },
                preferCurrentTab: false,
                selfBrowserSurface: "exclude",
                systemAudio: "include",
                surfaceSwitching: "include",
                monitorTypeSurfaces: "include",
            });

            if (stream) {
                setStreamL(stream)

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


            }

            stream.getTracks().forEach(track => {
                track.onended = () => {
                    closeAllCallConnectionsOutput()
                    console.log('La pista ha terminado (el usuario dejó de transmitir)');
                };
            });

        } catch (error) {
            console.error("Error al obtener acceso a la pantalla:", error);
        }
    }

    const sendMessagueAll = (cmd, messague, option) => {
        let conectionsG = getConnections()

        conectionsG.forEach((connection) => {
            connection.conn.send({
                cmd: cmd,
                data: { ...getInfoStream(), ...messague }
            })
        })
    }

    const sendMessague = (arrayConnections, cmd, messague) => {
        // console.log(arrayConnections)
        arrayConnections.forEach((connection) => {
            connection.conn.send({
                cmd: cmd,
                data: messague
            });
        });
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

    const stopStreaming = () => {
        getStreamL().getTracks().forEach(track => {
            track.stop()
            closeAllCallConnectionsOutput()
        })
    }

    const processIncomingData = (cmd, data, conn) => {
        if (cmd == "playvideo") {
            window.postMessage(
                {
                    type: "playvideo",
                    text: "Hello from the webpage!",
                },
                "*",
            );
        } else if (cmd == "pausevideo") {
            window.postMessage(
                {
                    type: "pausevideo",
                    text: "Hello from the webpage!",
                },
                "*",
            );
        } else if (cmd == "seekvideo") {
            window.postMessage(
                {
                    type: "seekvideo",
                    data: { numberSeek: data.dataSeek },
                },
                "*",
            );

        } else if (cmd == 'viewStream') {
            console.log('el  id ' + conn.peer + ' pidio el stream')
            callF(conn)
        }

        else if (cmd == "addStreamingUsers") {
            console.log('info de user Obtenida')
            addStreamingUsers(conn.peer, { ...data })
        }


        else if (cmd == "addTask:peerListToConnect") {
            addTask({
                sender: conn.peer,
                ...data
            })

            data.peerListToConnect.forEach(peerId => {
                connectPeer(peerId, data.pendingPeer)
            })

        } else if (cmd == "confirmPeerListToConnect") {
            deleteTask('confirmPeerListToConnect', data.pendingPeer)
        }
    }

    const callF = (conn) => {
        const call = getPeer().call(conn.peer, getStreamL());
        console.log('se le envia el stream a ' + conn.peer)
        addCall(call, false, 'out')

        call.on("stream", (stream) => {
            console.log('se establecio en stream')
        });

        call.on("close", () => {
            closeAndDeleteCall(conn.peer, call.connectionId)
            // console.log(getConnections())
            console.log('se cerro la llamada , server , llamada posterior')
        });
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

    const exitPeerNetwork = () => {
        console.log('cerrando toda la network')
        getConnections().forEach(connection => {
            connection.conn.close()
            if (connection.calls) {
                connection.calls.forEach(callObject => {
                    callObject.call.close()
                });
            }
        })
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