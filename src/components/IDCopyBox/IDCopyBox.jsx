import './idCopyBox.css';

export default function IDCopyBox({ idPeer, className }) {

    const handleCopy = (e) => {
        console.log('copy text')
        navigator.clipboard.writeText(idPeer.toString())
        let element = e.currentTarget.querySelector('.id-copy-box__shoot-copy')

        element.style.animation = 'IDCopy 1s'
        element.style.display = 'block'
        setTimeout(() => {
            element.style.animation = 'none'
            element.style.display = 'none'
        }, 500)
    }

    return (
        <div className={`id-copy-box${className ? ' ' + className : ''}`}>
            <p>ID :</p><p> {idPeer || '...espere generando'}</p>
            <span onClick={(e) => handleCopy(e)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-copy" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                </svg>
                <div className="id-copy-box__shoot-copy">
                    Copy!
                </div>
            </span>
        </div>
    )
}