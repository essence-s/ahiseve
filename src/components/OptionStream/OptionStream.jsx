import { usePeer } from '@/hook/usePeer'
import './optionStream.css'
import ModalConnectPeer from '@/components/ModalConnectPeer/ModalConnectPeer'
import { useState } from 'react'

export default function OptionStream({ infoStream }) {

    let { startStream, stopStreaming, exitPeerNetwork, connections } = usePeer()
    let [isOpenModal, setIsOpenModal] = useState(false)


    const handleSharedScreen = () => {
        startStream()
    }

    const handleCloseStream = () => {
        stopStreaming()
    }

    const handleConnection = () => {
        setIsOpenModal(true)
    }

    const handleCloseConnections = () => {
        exitPeerNetwork()
    }

    return (
        <div className="options-stream">
            <ModalConnectPeer  {...{ isOpenModal, setIsOpenModal }}></ModalConnectPeer>
            {infoStream.isStream ?
                <button className="call-close" onClick={handleCloseStream}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-screen-share-off">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
                        <path d="M7 20l10 0" />
                        <path d="M9 16l0 4" />
                        <path d="M15 16l0 4" />
                        <path d="M17 8l4 -4m-4 0l4 4" />
                    </svg>
                </button> :
                <button className="shared-screen" onClick={handleSharedScreen}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-device-imac-share"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path
                            d="M12.5 17h-8.5a1 1 0 0 1 -1 -1v-12a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v9"
                        ></path>
                        <path d="M3 13h18"></path>
                        <path d="M8 21h4"></path>
                        <path d="M10 17l-.5 4"></path>
                        <path d="M16 22l5 -5"></path>
                        <path d="M21 21.5v-4.5h-4.5"></path>
                    </svg>
                </button>
            }


            {connections.length != 0 ?
                <button className="call-close" onClick={handleCloseConnections}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-plug-connected-x">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M20 16l-4 4" />
                        <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z" />
                        <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z" />
                        <path d="M3 21l2.5 -2.5" />
                        <path d="M18.5 5.5l2.5 -2.5" />
                        <path d="M10 11l-2 2" />
                        <path d="M13 14l-2 2" />
                        <path d="M16 16l4 4" />
                    </svg>
                </button>
                : <button className="options-stream__connect" onClick={handleConnection}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plug-connected" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z" />
                        <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z" />
                        <path d="M3 21l2.5 -2.5" />
                        <path d="M18.5 5.5l2.5 -2.5" />
                        <path d="M10 11l-2 2" />
                        <path d="M13 14l-2 2" />
                    </svg>
                </button>
            }


        </div>
    )
}