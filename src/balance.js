async function fetchBalances({ lnmarkets }) {
    const info = await lnmarkets.getUser()
    const balanceBtc = info.balance / 100000000.0
    const balanceUsd = await calculateUsdBalance({ lnmarkets })
    const { btcEquivalent, usdEquivalent } = await calculateEquivalents({ balanceBtc, balanceUsd, lnmarkets })
    return { balanceBtc, balanceUsd, btcEquivalent, usdEquivalent }
}

async function calculateEquivalents({ balanceBtc, balanceUsd, lnmarkets }) {
    const ticker = await lnmarkets.futuresGetTicker()
    const btcUsdPrice = ticker.index
    const usdEquivalent = ((balanceBtc * btcUsdPrice) + balanceUsd).toFixed(2)
    const btcEquivalent = (balanceBtc + (balanceUsd / btcUsdPrice)).toFixed(8)
    return { btcEquivalent, usdEquivalent }
}

async function calculateUsdBalance({ lnmarkets }) {
    const positions = await lnmarkets.futuresGetPositions()
    const liveShorts = positions.filter(p => p.side === 's' && p.market_wi === 'filled' && p.margin_wi === 'running')
    return liveShorts.reduce((acc, p) => acc + p.quantity, 0)
} 

module.exports = { fetchBalances }