import { db, initDB } from './db-init'
import { getUser, doSpin, wait } from './utils'


class CounterClass {
    private counter: number = 0
    getCounter() {
        return this.counter
    }
    incrementCounter() {
        this.counter++
    }
}

const doUserSpinAndLog = async (FID: number, counter: CounterClass) => {
    const user = await getUser(FID)

    console.log(JSON.stringify(user, null, 2))

    if (!user) {
        return
    }
    const noSpins = Number(user.spins_remaining) || 0

    if(noSpins <= 0) {
        return
    }
    
    for (let i = 0; i < noSpins; i++) {
        const spin = await doSpin(FID)
        await wait(4500)
        if (!spin) {
            continue
        }
        const {won, rewardAmount, prizeType, tokenType, rewardId } = spin
        db.run(`
            INSERT INTO spins (user_id, won_amount, is_win, token_type, prize_type, reward_id)
            VALUES (?, ?, ?, ?, ?, ?)`, [FID, rewardAmount, won, tokenType, prizeType, rewardId])
        counter.incrementCounter()
    }
}

const mainPocExample = async () => {
const startFID = 1e3
const endFID = 10e6
const stopAfterNoSpins = 600

const counter = new CounterClass()


initDB()
const promiseBatch = [] as Promise<void>[]

const counterInterval = setInterval(() => {
    console.log(`${counter.getCounter()} Spins made`)
}, 4e3)

for (let i = startFID; i < endFID; i += (Math.floor(Math.random() * 100) + 1)) {
    promiseBatch.push(doUserSpinAndLog(i, counter))
    if (counter.getCounter() >= stopAfterNoSpins) {
        clearInterval(counterInterval)
        break
    }
    if (promiseBatch.length === 10) {
        await Promise.all(promiseBatch)
        promiseBatch.length = 0
        await wait(1000)
    }
  }
}

mainPocExample()