import { usePeerStore } from "@/store/peerStore"
import { useStreamStore } from "@/store/streamStore"
import { useState } from "react"
import { modalStore } from "../store/modalStore"


export function usePeer() {
    let { idPeer, setIdPeer, connections, pushConnections,
        peer, setPeer, getPeer, getConnections,
        setCalls, getCalls, setArrayCallsServer, getArrayCallsServer
    } = usePeerStore(state => state)

    let { setStreamL, getStreamL, getRefVideoStream, infoStream, setInfoStream, getInfoStream } = useStreamStore(state => ({
        setStreamL: state.setStreamL, getStreamL: state.getStreamL, getRefVideoStream: state.getRefVideoStream,
        infoStream: state.infoStream, setInfoStream: state.setInfoStream, getInfoStream: state.getInfoStream
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

    const connectPeer = (idEntered) => {

        if (getConnections().find(con => con.peer === idEntered)) {
            window.toast({
                title: 'Are you connected!',
                message: '',
                location: 'top-right',
                dismissable: false,
            })
            return
        }

        let conn = peer.connect(idEntered);

        conn.on("data", function ({ cmd, data }) {
            // console.log("Received", data);
            if (cmd == "infoStream") {
                console.log('info de server obtenida')
                setInfoStream({ ...data })
            } else if (cmd == "infoStream:info") {
                setInfoStream({
                    ...getInfoStream(),
                    ...data,
                    ...getInfoStream().onlineStreamUsers
                })
            } else if (cmd == "infoStream:onlineStreamUsers") {
                setInfoStream({
                    ...getInfoStream(),
                    onlineStreamUsers: data
                })
            }
        });

        conn.on("open", function () {
            console.log('se conecto a ' + idEntered)
            pushConnections(conn);
            window.toast({
                title: 'Connected Susscesfully!',
                message: '',
                location: 'top-right',
                dismissable: false,
            })
            conn.send("hi!");
        });

        conn.on("close", function () {
            console.log('se cerro la conexion completa')
        })
    }

    const createServer = async () => {
        // try {
        // console.log('revisando')
        if (getPeer()) return

        let Peer = (await import('peerjs')).default
        let npeer = new Peer({
            // host: "localhost",
            // port: 443,
            // path: "/",
        })
        // console.log(npeer)
        setPeer(npeer)
        // console.log('Creando Peer')
        // } catch (e) {
        //     console.log('aqui' + e)
        // }

        npeer.on("open", function (id) {
            console.log("Peer creado: " + id);
            setIdPeer(id)
        });

        npeer.on("connection", function (conn) {
            conn.on("data", function ({ cmd, data }) {
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
                    const call = getPeer().call(conn.peer, getStreamL());
                    console.log('se le envia el stream a ' + conn.peer)
                    setArrayCallsServer(call)

                    call.on("stream", (stream) => {
                        console.log('se establecio en stream')
                    });

                    call.on("close", () => {
                        // console.log(call)
                        console.log('se cerro la llamada , server , llamada posterior')
                    });

                }
            });
            conn.on("open", function () {
                conn.send("hello!");
                pushConnections(conn);
                let backgroundUser = availableBackground(getInfoStream().onlineStreamUsers)

                // console.log(getInfoStream());
                let dataInfoStream = {
                    ...getInfoStream(),
                    masterId: npeer.id,
                    onlineStreamUsers: [
                        ...getInfoStream().onlineStreamUsers,
                        {
                            background: backgroundUser
                        }
                    ]
                }
                setInfoStream(dataInfoStream)
                // sendMessague([conn], 'infoStream', dataInfoStream)
                sendMessague(getConnections(), 'infoStream:onlineStreamUsers', dataInfoStream.onlineStreamUsers)
                sendMessague([conn], 'infoStream', dataInfoStream)
            });

        });


        npeer.on("call", (call) => {

            call.answer();

            call.on("stream", async (stream) => {
                // console.log(getPeer)
                console.log('recibiendo el stream')
                setCalls(call)
                let refVideoStreamCurrent = getRefVideoStream()
                refVideoStreamCurrent.srcObject = stream
                let playPromise = refVideoStreamCurrent.play();

                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                    }).catch(error => { });
                }

                setIsOpenModalVideoPlayer(true)
            });

            call.on("close", () => {
                console.log('se cerro la conexion de la llamada , user')
                setIsOpenModalVideoPlayer(false)
                // console.log(call)
            });
        });

    }


    //to improve
    const callAll = async () => {

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

                    sendMessague(getConnections(), 'infoStream:info', dataInfoStream)

                    return {
                        ...state,
                        ...dataInfoStream
                    }
                })


            }

            stream.getTracks().forEach(track => {
                track.onended = () => {
                    closeAllCallConnections()
                    console.log('La pista ha terminado (el usuario dejó de transmitir)');
                };
            });
            let refVideoStreamCurrent = getRefVideoStream()
            refVideoStreamCurrent.srcObject = stream
            refVideoStreamCurrent.play();
            refVideoStreamCurrent.muted = true;

            connections.forEach((conn) => {
                const call = peer.call(conn.peer, stream);
                setArrayCallsServer(call)
                call.on("stream", (stream) => { });

                call.on("close", () => {
                    console.log('se cerro la conexion de la llamada , server')
                });
            });

        } catch (error) {
            console.error("Error al obtener acceso a la pantalla:", error);
        }
    }

    const sendMessagueAll = (cmd, messague, option) => {
        let conectionsG;
        if (option == 'outgoing') {
            conectionsG = getOutgoingConnections()
        } else {
            conectionsG = getConnections()
        }

        conectionsG.forEach((conn) => {
            conn.send({
                cmd: cmd,
                data: { ...getInfoStream(), ...messague }
            })
        })
    }

    const sendMessague = (arrayConnections, cmd, messague) => {
        arrayConnections.forEach((conn) => {
            conn.send({
                cmd: cmd,
                data: messague
            });
        });
    }

    // const findConnection = () => {
    //     return getConnections().find(con => con.peer == getInfoStream().masterId)
    // }

    const viewStream = () => {
        // let peerUserMaster = findConnection()
        // console.log(idPeer)
        getConnections()[0].send({ cmd: 'viewStream', data: { peer: idPeer } })
    }

    const closeAllCallConnections = () => {

        setInfoStream((state) => {
            let dataInfoStream = {
                isStream: false,
                userStreaming: nameUser
            }

            sendMessague(getConnections(), 'infoStream:info', dataInfoStream)

            return {
                ...state,
                ...dataInfoStream
            }
        })

        getArrayCallsServer().forEach((acs) => {
            acs.close()
        })
    }

    const stopStreaming = () => {
        getStreamL().getTracks().forEach(track => {
            track.stop()
            closeAllCallConnections()
        })
    }

    return {
        idPeer,
        connectPeer,
        createServer,
        connections,
        callAll,
        infoStream,
        peer,
        getPeer,
        getConnections,
        viewStream,
        getCalls, stopStreaming,
        sendMessagueAll
    }
}