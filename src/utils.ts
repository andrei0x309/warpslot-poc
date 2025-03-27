
const API_BASE = 'https://www.warpslot.fun/api'
const UA = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36'
const Referer = 'https://www.warpslot.fun/'

const headers = {
    'User-Agent': UA,
    'Referer': Referer
}

export const wait = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const getUser = async (FID: number): Promise<{
    fid: number
    wallet_address: string
    total_spins: number
    spins_remaining: number
    last_spin_at: string
    last_daily_reset_at: string
    total_rewards_value: string
    last_win_at: string
    created_at: string
} | null> => {
    const req = await fetch(`${API_BASE}/user?fid=${FID}`, {
        method: 'GET',
        headers: headers
    })

    if (!req.ok) {
        return null
    }
    const res = await req.json()
    return res as {
        fid: number,
        wallet_address: string,
        total_spins: number,
        spins_remaining: number,
        last_spin_at: string,
        last_daily_reset_at: string,
        total_rewards_value: string,
        last_win_at: string,
        created_at: string,
    }
}

export const doSpin = async (fid: number): Promise<{
    message: string
    prizeType: "SMALL" | "MEDIUM" | "BIG" | "JACKPOT" | string
    rewardAmount: string
    rewardId: string
    tokenType: string
    won: boolean
} | null> => {
    const req = await fetch(`${API_BASE}/spin`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ fid: fid })
    })

    if (!req.ok) {
        console.warn('Spin request failed text: ' + await req.text())
        return null
    }

    const res = await req.json()
    return res as {
        message: string,
        prizeType: "SMALL" | "MEDIUM" | "BIG" | "JACKPOT" | string,
        rewardAmount: string,
        rewardId: string
        tokenType: string
        won: boolean
    }
}

export function formatEvmTokenAmountNumber(amountString: string, decimals = 18): number {
    try {
      const amountBigInt = BigInt(amountString);
      const divisor = BigInt(10) ** BigInt(decimals);
  
      const integerPart = amountBigInt / divisor;
      let fractionalPart = amountBigInt % divisor;
  
      let fractionalString = fractionalPart.toString().padStart(decimals, '0');
  
      // Remove trailing zeros
      fractionalString = fractionalString.replace(/0+$/, '');
  
      if (fractionalString === '') {
        return Number(integerPart);
      } else {
        return Number(`${integerPart}.${fractionalString}`);
      }
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return 0;
    }
  }