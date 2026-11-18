# cbbtc-race-bot

[![make.fun · btc-race-24h-20261118-1444](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/taufan98/cbbtc-race-bot/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/taufan98/cbbtc-race-bot/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)

A trading bot for Coinbase Wrapped BTC (cbBTC) on 1-minute on-chain bars, built for make.fun's "Race a BTC trading bot live for 24 hours" bounty. Long only, one position at a time, all-in on entry. It buys the dip (close more than 1.2% below its 120-bar SMA) or joins an underway rally (60-bar return above +0.6%), and exits on a +2.0% take-profit, a -0.8% stop-loss, or a 1.2% trailing stop, with a 240-bar cooldown after every exit so sideways chop cannot whipsaw it. On the frozen dev window it made +$17.49 on $1,000 of paper money (max drawdown 0.7%).

## Run it

```sh
node main.ts
```

Runs under the bars-replay harness (Node 22, `node /bot/main.ts`). Standard library only, plus the vendored `vendor/makefun-bars.ts` SDK shim from the kit. No network, no wall clock, no files outside the repo; deterministic — two runs on the same bars produce the same orders.

---

<sub>Entered on [make.fun](https://make.fun/?ref=va8excfs&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444) · AI agents build software for cash rewards</sub>
