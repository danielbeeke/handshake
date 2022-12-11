import './style.css'
import { createRoot } from 'react-dom/client'
import { html } from 'htm/react'
import { createConnection } from './Connection'

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    messages: {
        invite: {
            title: 'You are invited',
            text: 'You are invited',
            html: html`Please wait for a link from your friend and click on it.`,
            buttonText: html`Invite`
        },
        answer: {
            title: 'Response of your friend',
            text: 'Response of your friend',
            html: html`Please wait`,
            buttonText: html`Send it back`
        },
        intercepted: {
            html: html`You can close this tab`
        },
        error: html`Something went wrong`
    }
}

const root = createRoot(document.querySelector('#app')!)
const connection = await createConnection(root, configuration)
if (connection) {
    connection.addEventListener('started', (event) => {
        console.log(event)
    })
}
