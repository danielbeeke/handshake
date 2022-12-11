class EasyWebRTC extends EventTarget {


    public configuration: RTCConfiguration
    public peerConnection: RTCPeerConnection
    public dataChannel: RTCDataChannel | undefined

    constructor (configuration: RTCConfiguration) {
        super()
        this.configuration = configuration
        this.peerConnection = new RTCPeerConnection(this.configuration)
    }

    setRemote (answer: RTCSessionDescriptionInit) {
        return this.peerConnection.setRemoteDescription(answer)
    }

    /**
     * Attach callbacks to the dataChannel, is the same for both the initiator and the answerer.
     */
    attachDataChannel () {
        if (!this.dataChannel) return

        this.dataChannel.onopen = (...args: Array<any>) => {
            this.dispatchEvent(new CustomEvent('started', { detail: args }))
        }

        this.dataChannel.onmessage = (message) => {
            this.dispatchEvent(new CustomEvent('message', { detail: message }))
        }

        this.dataChannel.onclose = (...args: Array<any>) => {
            this.dispatchEvent(new CustomEvent('close', { detail: args }))
        }

        this.dataChannel.onerror = (...args: Array<any>) => {
            this.dispatchEvent(new CustomEvent('error', { detail: args }))
        }
    }
}

export class Initiator extends EasyWebRTC {
    
    async init () {
        this.peerConnection.addEventListener('icecandidate', (event) => {
            // This event is called multiple times, and when it does not have a candidate it is finished.
            if (!event.candidate) {
                // We grab the offer from the peerConnection, hopefully it contains the ice candidates. 
                this.dispatchEvent(new CustomEvent('offer', { 
                    detail: { offer: this.peerConnection.localDescription!.toJSON() } 
                }))
            }
        })
        this.dataChannel = this.peerConnection.createDataChannel('data')
        this.attachDataChannel()
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
    }

}

export class Answerer extends EasyWebRTC {

    public initialOffer: RTCSessionDescriptionInit

    constructor (configuration: RTCConfiguration, initialOffer: RTCSessionDescriptionInit) {
        super(configuration)
        this.initialOffer = initialOffer
    }

    async init () {
        this.peerConnection.addEventListener('icecandidate', (event) => {
            // This event is called multiple times, and when it does not have a candidate it is finished.
            if (!event.candidate) {
                // We grab the answer from the peerConnection, hopefully it contains the ice candidates. 
                this.dispatchEvent(new CustomEvent('answer', { 
                    detail: { answer: this.peerConnection.localDescription!.toJSON() } 
                }))
            }
        })

        this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.initialOffer))
        this.dataChannel = this.peerConnection.createDataChannel('data')
        this.attachDataChannel()
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
    }

}