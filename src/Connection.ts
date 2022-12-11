import './style.css'
import { Root } from 'react-dom/client'
import { html } from 'htm/react'
import { Initiator, Answerer } from './EasyWebRTC'
import { intercept } from './intercept'
import 'share-api-polyfill'

type ConnectionMessages = {
    invite: {
        title: string,
        text: string,
        html: ReturnType<typeof html>,
        buttonText: ReturnType<typeof html>,
    },
    answer: {
        title: string,
        text: string,
        html: ReturnType<typeof html>
        buttonText: ReturnType<typeof html>,
    },
    intercepted: {
        html: ReturnType<typeof html>
    },
    error: ReturnType<typeof html>
}

export const createConnection = async (root: Root, configuration: RTCConfiguration & { messages: ConnectionMessages }) => {    
    const { intercepted, interceptor } = intercept(location.hash)
    
    /**
     * The hash seems to come from a step further in the process, we need to send it to the iniating tab.
     */
    if (intercepted) {
        root.render(configuration.messages.intercepted.html)
        return false
    }
    
    /**
     * Connection, initiator and answerer
     */
    else {
        const connection = !location.hash ? 
            new Initiator(configuration) : 
            new Answerer(configuration, JSON.parse(atob(location.hash.split(':').pop()!)))
        
        connection.addEventListener('offer', (event: Event) => {
            const offer = (event as any).detail.offer
            const url = new URL(location.toString())
            url.hash = `offer:${btoa(JSON.stringify(offer))}`
        
            root.render(html`
                <button onClick=${() => {
                    navigator.share({
                        title: configuration.messages.invite.title,
                        text: configuration.messages.invite.text,
                        url: url.toString(),
                    })
                    .then(() => {
                        root.render(configuration.messages.invite.html)
                    })
                    .catch( error => {
                        root.render(configuration.messages.error)
                        console.error(error)
                    })
                }}>${configuration.messages.invite.buttonText}</button>
            `)
        })
        
        connection.addEventListener('answer', (event: Event) => {
            const answer = (event as any).detail.answer
            const url = new URL(location.toString())
            url.hash = `answer:${btoa(JSON.stringify(answer))}`
        
            root.render(html`
                <button onClick=${() => {
                    navigator.share({
                        title: configuration.messages.answer.title,
                        text: configuration.messages.answer.text,
                        url: url.toString(),
                    })
                    .then(() => {
                        root.render(configuration.messages.answer.html)
                    })
                    .catch( error => {
                        root.render(configuration.messages.error)
                        console.error(error)
                    })
                }}>${configuration.messages.answer.buttonText}</button>
            `)
        })
    
        interceptor.addEventListener('message', (event) => {
            if (!(connection instanceof Initiator)) return
            const answer = JSON.parse(atob(event.data.split(':').pop()))
            connection.setRemote(answer)
        })
        
        await connection.init()
        return connection
    }
}

