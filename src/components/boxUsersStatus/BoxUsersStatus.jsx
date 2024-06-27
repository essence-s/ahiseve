import { usePeer } from '@/hook/usePeer'
import './boxUsersStatus.css'
import OptionsStream from "@/components/OptionStream/OptionStream";
import { useStreamStore } from '@/store/streamStore';
import IDCopyBox from '../IDCopyBox/IDCopyBox';

export default function BoxUsersStatus() {
    let { idPeer, viewStream, connections } = usePeer()

    let { streamingUsers, infoStream } = useStreamStore(state => ({
        streamingUsers: state.streamingUsers,
        infoStream: state.infoStream
    }))

    const handleViewStream = (idPeer) => {
        viewStream(idPeer)
    }

    return (
        <div className="box-main">
            <IDCopyBox idPeer={idPeer} className='fixedIDCopyBox'></IDCopyBox>

            <div className="box-users-transmitting">
                {
                    Object.entries(streamingUsers).map(([key, value]) => {

                        return value.isStream && <div className="box-is-streaming" key={key}>
                            {value.userStreaming} is transmitting
                            <div className="box-is-streaming__button-view-streaming" onClick={() => handleViewStream(key)}>
                                watch stream <span></span>
                            </div>
                        </div>
                    })
                }
            </div>

            {
                connections.length > 0 ?
                    <div className="box-users-connected">
                        {
                            connections.map((conn, i) => <div key={i + '77'} style={{ background: conn.background }} className="box-users-connected__user">
                                <img src={`https://picsum.photos/200/300?random=${i + 1}`} alt="" />
                            </div>)
                        }
                    </div> :
                    <div className="box-no-friends">
                        <p>No tienes amigos</p>
                        <p>ಥ_ಥ</p>
                    </div>
            }

            <OptionsStream infoStream={infoStream} />
        </div>
    )
}