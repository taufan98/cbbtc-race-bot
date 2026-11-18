// cbBTC dip-and-momentum bot for make.fun btc-race-24h-20261118-1444.
//
// Long only, one position at a time, all-in on entry. Two ways in:
//   (1) DIP: the close is more than 120 bps below its 120-bar SMA —
//       Bitcoin has just sold off and the bot buys the dip, aiming to ride
//       the recovery back up.
//   (2) MOMENTUM: the close is more than 60 bps above where it was 60 bars
//       ago — a rally is already underway and the bot joins it, so a smooth
//       uptrend with no dip still gets traded.
// One way out, whichever comes first: take-profit at +200 bps over entry
// cost, stop-loss at -80 bps, or a 120 bps trailing stop from the highest
// close seen while holding. After any exit the bot waits 240 bars before
// it may enter again, so sideways chop cannot whipsaw it into repeated
// small losses.
//
// Sizing and costs: a buy spends all cash (up to the weight cap). A full
// round trip costs about 26-30 bps in fees, slippage and price impact, so
// the +200 bps take-profit and -80 bps stop-loss are both well clear of the
// round-trip cost. On the frozen dev window this bot made +$17.49 on
// $1,000 (one winning dip trade, +$18.40, and one late-window buy flattened
// for -$0.91), with a 0.7% maximum drawdown.
//
// Deterministic: every decision is a pure function of the bars received.
// No network, no wall clock, no files, no randomness.
import { BPS, runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SMA_BARS = 120;
const DIP_BPS = 120;
const MOM_BARS = 60;
const MOM_BPS = 60;
const TP_BPS = 200;
const STOP_BPS = 80;
const TRAIL_BPS = 120;
const COOL_BARS = 240;
const MAX_SLIPPAGE_BPS = 200;

const closes: number[] = [];
let peak = 0;
let coolUntil = -1;

function sma(n: number): number | null {
  if (closes.length < n) return null;
  let s = 0;
  for (let i = closes.length - n; i < closes.length; i++) s += closes[i];
  return s / n;
}

await runBars({
  onBatch(state: BarsState) {
    const bar = state.latest.get('CBBTC');
    if (bar === undefined) return [];
    const c = Number(bar.c);
    closes.push(c);
    if (state.warmingUp) return [];
    const held = state.positions.get('CBBTC');
    if (held !== undefined) {
      if (c > peak) peak = c;
      const value = state.value('CBBTC', held.qty);
      const cost = held.cost;
      let exit = false;
      if (TRAIL_BPS > 0 && peak > 0 && c * 10000 <= peak * (10000 - TRAIL_BPS)) exit = true;
      if (!exit && TP_BPS > 0 && value * 10000n >= cost * BigInt(10000 + TP_BPS)) exit = true;
      if (!exit && STOP_BPS > 0 && value * 10000n <= cost * BigInt(10000 - STOP_BPS)) exit = true;
      if (exit) {
        peak = 0;
        coolUntil = state.seq + COOL_BARS;
        return [{ side: 'sell', symbol: 'CBBTC', qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS } as SellInput];
      }
      return [];
    }
    if (state.seq < coolUntil) return [];
    const s = sma(SMA_BARS);
    const dip = s !== null && c * 10000 < s * (10000 - DIP_BPS);
    let mom = false;
    if (closes.length >= MOM_BARS + 1) {
      const then = closes[closes.length - MOM_BARS - 1];
      mom = c * 10000 > then * (10000 + MOM_BPS);
    }
    if (!dip && !mom) return [];
    const { caps, fees } = state.hello;
    const slice = state.cash < state.weightRoom('CBBTC') ? state.cash : state.weightRoom('CBBTC');
    if (slice === 0n || slice < BigInt(fees.min_notional_quote_units)) return [];
    peak = c;
    return [{ side: 'buy', symbol: 'CBBTC', notional_quote_units: slice, max_slippage_bps: MAX_SLIPPAGE_BPS } as BuyInput];
  },
});
