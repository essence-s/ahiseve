import { useEffect, useState } from "react"
import './modalConnectPeer.css'
import { usePeer } from '@/hook/usePeer'
import IDCopyBox from '../IDCopyBox/IDCopyBox'
import { createPortal } from "react-dom"

//improve
export default function ModalConnectPeer({ isOpenModal, setIsOpenModal }) {

    let [userEnteredId, setUserEnteredId] = useState('')
    // let { seekValue, setSeekValue } = usePlayerStore(state => state)
    let { idPeer, createServer, connectPeer } = usePeer()

    let [se, setSe] = useState(false)
    let [load, setLoad] = useState(false)

    const handleConnectServer = (event) => {
        event.preventDefault()
        if (userEnteredId != "") {
            setLoad(true)
            connectPeer(userEnteredId, "", 'info').then(() => {
                setLoad(false)
                setIsOpenModal(false)
            }).catch((err) => {
                console.log(err)
                setLoad(false)
            })
        }
    }

    // const handleOpenModal = () => {
    //     window.history.pushState({}, '', '?modal=open');
    //     handleUrlChange()
    // }

    const handleCloseModal = () => {
        setIsOpenModal(false)
    }

    const handleUrlChange = () => {
        // console.log(window.location.href)
        if (new URLSearchParams(window.location.search).get('modal') == 'open') {
            setIsOpenModal(true)
            // console.log('true')
        } else {
            setIsOpenModal(false)
            // console.log('false')
        }
    }

    useEffect(() => {
        handleUrlChange()
        window.addEventListener('popstate', handleUrlChange)

        createServer()
        return () => {
            window.removeEventListener('popstate', handleUrlChange)
        };

    }, [])
    useEffect(() => {

        if (se) {
            if (isOpenModal && !(new URLSearchParams(window.location.search).get('modal') == 'open')) {
                // console.log('pushmodal')
                window.history.pushState({}, '', '?modal=open');
            } else if (!isOpenModal && new URLSearchParams(window.location.search).get('modal') == 'open') {
                const newUrl = `${window.location.pathname}`;
                // console.log('rt')
                window.history.pushState({}, '', newUrl);
            }
        } else {
            setSe(true)
        }

    }, [isOpenModal])

    const comp = (
        <div className="box-peer-modal">
            < div className="box-peer-modal__background" onClick={handleCloseModal} ></div >
            <div className="box-peer-modal__container">

                <div className="box-peer-modal__icon-back" onClick={handleCloseModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-left">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 12l14 0" />
                        <path d="M5 12l4 4" />
                        <path d="M5 12l4 -4" />
                    </svg>
                </div>
                <IDCopyBox idPeer={idPeer}></IDCopyBox>

                <form className="box-peer-modal__connect-server" onSubmit={(e) => handleConnectServer(e)}>
                    <p>Conectarse al Server</p>
                    <input autoFocus name="" id="" cols="10" rows="3" value={userEnteredId} onChange={(e) => setUserEnteredId(e.target.value)} ></input>

                    <button id="handleButtonConnect" >
                        <span>Conectar</span>
                        {load ?
                            <svg style={{ animation: "giveColor 1.5s forwards,rotateIcon 0.8s infinite linear" }} xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-loader-2">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 3a9 9 0 1 0 9 9" />
                            </svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plug-connected" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z" />
                                <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z" />
                                <path d="M3 21l2.5 -2.5" />
                                <path d="M18.5 5.5l2.5 -2.5" />
                                <path d="M10 11l-2 2" />
                                <path d="M13 14l-2 2" />
                            </svg>}
                    </button>

                </form>

                <div className="box-peer-modal__options">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-home" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                        </svg>
                    </span>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings-2" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                            <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        </svg>
                    </span>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-contrast" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path d="M12 17a5 5 0 0 0 0 -10v10" />
                        </svg>
                    </span>
                </div>

            </div>
        </div >
    )

    return isOpenModal && createPortal(comp, document.body)
}