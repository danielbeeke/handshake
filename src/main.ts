import './style.css'
import { createRoot } from 'react-dom/client'
import { html } from 'htm/react'
import { createConnection } from './Connection'
import { messages } from './messenges'
import { Initiator } from './EasyWebRTC'
import { useEffect, useState } from 'react'

const configuration = {
    // This is only used by each client to know their outgoing IP address.
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    messages
}

const root = createRoot(document.querySelector('#app')!)
const connection = await createConnection(root, configuration)

function connectionMessages ({ connection }: { connection: EventTarget }) {
    const [messages, setMessage] = useState<Array<{ [key: string]: any }>>([])

    useEffect(() => {
        const handler = (event: Event) => {
            console.log(event)
            setMessage([...messages, ((event as CustomEvent).detail)])
        }

        connection.addEventListener('message', handler)    

        console.log(connection)

        return () => {
            console.log('test')
            connection.removeEventListener('message', handler)
        }
    })

    return html`
        <ul>
            ${messages.map(message => html`<li key=${message}>${JSON.stringify(message, null, 2)}</li>`)}
        </ul>
    `
}

if (connection) {

    connection.addEventListener('started', () => {
        root.render(html`
            <div>
                <h1>Connected</h1>
                <${connectionMessages} connection=${connection} />
            </div>
        `)

        if (connection instanceof Initiator) {
            setTimeout(() => {
                connection.send({
                    lorem: 'ipsum'
                })        
                console.log('tried')
            }, 4000)
        }
    })
}
