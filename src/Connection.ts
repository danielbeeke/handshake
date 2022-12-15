import './style.css'
import { Root } from 'react-dom/client'
import { html } from 'htm/react'
import { Initiator, Answerer } from './EasyWebRTC'
import { intercept } from './intercept'
import './ShareApiPonyfill'

type ConnectionMessages = {
    invite: {
        share: {
            title: string,
            text: string,    
        }
        before: (onClick: Function) => ReturnType<typeof html>,
        after: () => ReturnType<typeof html>,
    },
    answer: {
        share: {
            title: string,
            text: string,    
        },
        before: (onClick: Function) => ReturnType<typeof html>,
        after: () => ReturnType<typeof html>
    },
    intercepted: ReturnType<typeof html>
    error: ReturnType<typeof html>
}

export const createConnection = async (root: Root, configuration: RTCConfiguration & { messages: ConnectionMessages }) => {    
    const { intercepted, interceptor } = intercept(location.hash)
    
    const { answer, invite } = configuration.messages

    /**
     * The hash seems to come from a step further in the process, we need to send it to the iniating tab.
     */
    if (intercepted) {
        root.render(configuration.messages.intercepted)
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
            const callback = () => {
                navigator.share({
                    title: invite.share.title,
                    text: invite.share.text,
                    url: url.toString(),
                })
                .then(() => {
                    root.render(invite.after())
                })
                .catch( error => {
                    root.render(configuration.messages.error)
                    console.error(error)
                })
            }

            root.render(invite.before(callback))
        })
        
        connection.addEventListener('answer', (event: Event) => {
            const answerObject = (event as any).detail.answer
            const url = new URL(location.toString())
            url.hash = `answer:${btoa(JSON.stringify(answerObject))}`
            const callback = () => {
                navigator.share({
                    title: answer.share.title,
                    text: answer.share.text,
                    url: url.toString(),
                })
                .then(() => {
                    root.render(answer.after())
                })
                .catch( error => {
                    root.render(configuration.messages.error)
                    console.error(error)
                })
            }
        
            root.render(answer.before(callback))
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

