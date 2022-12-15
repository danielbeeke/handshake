import { html } from 'htm/react'

export const messages = {
    invite: {
        before: (onClick: Function) => html`
            <button className="btn btn-primary" onClick=${onClick}>
                Invite a friend to this page
            </button>`,
        after: () => html`Please wait for a link from your friend and click on it.`,
        share: {
            title: 'You are invited',
            text: 'You are invited',    
        }
    },
    answer: {
        before: (onClick: Function) => html`
            <button className="btn btn-primary" onClick=${onClick}>
                Send it back
            </button>`,
        after: () => html`Please wait`,
        share: {
            title: 'Response of your friend',
            text: 'Response of your friend',    
        }
    },
    intercepted:  html`You can close this tab`,
    error: html`Something went wrong`
}