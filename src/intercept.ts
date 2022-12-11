const tabsChannel = new BroadcastChannel('tabs')

export const intercept = (hash: string) => {
    const intercepted = hash.startsWith('#answer')
    if (intercepted) tabsChannel.postMessage(hash)
    return {
        intercepted, interceptor: tabsChannel
    }
}