import { db } from "./db-init"
import { formatEvmTokenAmountNumber } from "./utils"

const snapshotPrices = {
    "HIGHER": 0.007451,
    "RUNNER": 0.5262,
    "DEGEN": 0.003492,
    "MFER": 0.01100,
    "DICKBUTT": 0.041827,
    "QR": 0.052986,
    "GDUPI": 0.052367
} as {
    [key: string]: number
}

const winsStats = {
    "HIGHER": 0,
    "RUNNER": 0,
    "DEGEN": 0,
    "MFER": 0,
    "DICKBUTT": 0,
    "QR": 0,
    "GDUPI": 0
} as {
    [key: string]: number
}

const lostStats = {
    "HIGHER": 0,
    "RUNNER": 0,
    "DEGEN": 0,
    "MFER": 0,
    "DICKBUTT": 0,
    "QR": 0,
    "GDUPI": 0
} as {
    [key: string]: number
}

const winAmountsInUSD = {
    "HIGHER": 0,
    "RUNNER": 0,
    "DEGEN": 0,
    "MFER": 0,
    "DICKBUTT": 0,
    "QR": 0,
    "GDUPI": 0
} as {
    [key: string]: number
}

const tokenDecimals = {
    "HIGHER": 18,
    "RUNNER": 18,
    "DEGEN": 18,
    "MFER": 18,
    "DICKBUTT": 21,
    "QR": 21,
    "GDUPI": 21
} as {
    [key: string]: number
}

const prizeTypeCounter = {
} as {
    [key: string]: number
}

const getAllSpins = () => {
    const spins = db.query(`
        SELECT * FROM spins
    `).all()
    return spins as {
        id: number,
        user_id: number,
        won_amount: string,
        is_win: number,
        token_type: string,
        prize_type: string,
        reward_id: string,
        created_at: string
    }[]
}

console.log('Getting all spins...')
const spins = getAllSpins()
const totalSpins = spins.length
console.log(`Total spins: ${totalSpins}`)

let totalWinAmount = 0
let totalNumberOfWins = 0
let totalNumberOfLosses = 0

for (const spin of spins) {
    const { is_win, prize_type, won_amount, token_type,  } = spin


    if (prize_type in prizeTypeCounter) {
        prizeTypeCounter[prize_type]++
    } else {
        prizeTypeCounter[prize_type] = 1
    }

    if (is_win) {
        winsStats[token_type]++
        winAmountsInUSD[token_type] += (formatEvmTokenAmountNumber(won_amount, tokenDecimals[token_type]) * snapshotPrices[token_type])
    } else {
        lostStats[token_type]++
    }
}

for (const token_type in winsStats) {
    console.log(`${token_type}: ${winsStats[token_type]} wins, ${lostStats[token_type]} losses`)
}

for (const token_type in winAmountsInUSD) {
    console.log(`${token_type}: ${winAmountsInUSD[token_type]} USD`)
}

for (const token_type in winsStats) {
    totalNumberOfWins += winsStats[token_type]
    totalWinAmount += winAmountsInUSD[token_type]
}

totalNumberOfLosses = totalSpins - totalNumberOfWins

console.log(`Total wins: ${totalNumberOfWins}`)
console.log(`Total losses: ${totalNumberOfLosses}`)
console.log(`Total win amount: ${totalWinAmount} USD`)



