import { usePeer } from '@/hook/usePeer'
import './boxUsersStatus.css'
import OptionsStream from "@/components/OptionStream/OptionStream";
import { useStreamStore } from '@/store/streamStore';

export default function BoxUsersStatus() {
    let { viewStream } = usePeer()

    let { infoStream } = useStreamStore(state => ({
        infoStream: state.infoStream
    }))

    const handleViewStream = () => {
        viewStream()
    }

    return (
        <div className="box-main">
            {infoStream.isStream ?
                <div className="box-is-streaming">
                    {infoStream.userStreaming} is transmitting
                    <div className="box-is-streaming__button-view-streaming" onClick={handleViewStream}>
                        watch stream <span></span>
                    </div>
                </div> : ''
            }

            <div className="box-users-connected">
                {
                    infoStream.onlineStreamUsers.map((conn, i) => <div key={i + '77'} style={{ background: conn.background }} className="box-users-connected__user">
                        <img src={`https://picsum.photos/200/300?random=${i + 1}`} alt="" />
                    </div>)
                }
            </div>

            <OptionsStream client:load infoStream={infoStream} />
        </div>
    )
}