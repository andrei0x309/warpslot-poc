import { wait, getUser, doSpin, formatEvmTokenAmountNumber } from './utils'
import fs from 'fs'

class SpinIntervalControllerClass {
    private stopSpinning: boolean = false

    setStopSpinning(stopSpinning: boolean): void {
        this.stopSpinning = stopSpinning
    }

    getStopSpinning(): boolean {
        return this.stopSpinning
    }
}

export const SpinIntervalController: SpinIntervalControllerClass = new SpinIntervalControllerClass()

export const doCheckSpins = async ({
    fids,
    checkSpinInterval = 20000,
    logWins = false,
    doConsoleLog = false,
    logFn = console.log
}: {
    fids: number[],
    checkSpinInterval?: number,
    logWins?: boolean,
    doConsoleLog?: boolean,
    logFn?: (...args: any[]) => void
}): Promise<void> => {
try {
    const interval = setInterval(async () => {
        if (SpinIntervalController.getStopSpinning()) {
            clearInterval(interval)
            return
        }

        for (const fid of fids) {
            const user = await getUser(fid)
            const spinsRemaining = Number(user?.spins_remaining || 0)
            if(spinsRemaining > 0) {
                for (let i = 0; i < spinsRemaining; i++) {
                    const spin = await doSpin(fid)
                    await wait(4000)
                    if (logWins && spin?.won) {
                        if(!fs.existsSync('./wins.txt')) {
                            fs.writeFileSync('./wins.txt', '')
                        }
                        const HRAmount = formatEvmTokenAmountNumber(spin?.rewardAmount)

                        const winLine = `Fid: ${fid}, PrizeType: ${spin?.prizeType} Amount: ${HRAmount}\n`
                        if (doConsoleLog) {
                            logFn(winLine)
                        }
                        fs.appendFileSync('./wins.txt', winLine)
                    }
                }
            }
        }

    }, checkSpinInterval)
 } catch (error) {
     console.error(`Error in doCheckSpins: ${error}`)
 }
}