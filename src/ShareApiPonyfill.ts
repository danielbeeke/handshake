if (!navigator.share) {
    navigator.share = (data?: ShareData | undefined): Promise<void> => {
        return navigator.clipboard.writeText(data?.url ?? data?.title ?? data?.text ?? '')
    }
}

export {}