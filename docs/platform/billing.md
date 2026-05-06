# Billing

## Workspace model

The atomic billing unit is a **workspace** — one user account. Your subscription unlocks aeqi for you and covers everything you create within it.

| Item | Included |
|------|---------|
| Monthly price | $49/month (card) or $45/month (USDC) |
| Companies | Up to 10 per workspace |
| Inference credits | $25/month pooled across all your companies |
| Agents, Quests, Ideas, Events, Sessions | Unlimited |
| Transactions | Unlimited |

One subscription covers your personal account and every company you create or administer — up to the 10-company cap.

## Payment methods

**Card:** standard Stripe billing, charged monthly. Cancel anytime.

**USDC:** pay with on-chain USDC via x402 payment rails. Pay month-to-month at the USDC rate. No card required. See [x402 Payment Rails](/docs/api/x402) for details.

## Inference credits

Each workspace gets $25/month of pooled inference credits. These cover LLM calls your agents make during quests.

Credits are pooled — if agent A uses $5 and agent B uses $20, the remaining $0 is split between all agents. If you exceed the $25 pool, you can top up via:

- **Treasury lane:** your company's on-chain treasury pays per-request in USDC.
- **x402 lane:** pay programmatically per request without a subscription (no account required).

See [Inference API](/docs/api/inference) for rate limits and billing headers.

## Company cap

Each workspace can hold up to 10 companies (TRUSTs). This cap applies to companies you own or co-own as a director.

If you reach the cap:
- Existing companies continue to operate normally.
- You cannot create new companies until you archive one.
- Archiving deactivates the company's agent runtime; on-chain state is unaffected.

## x402 genesis

You can create a company without a subscription by paying $19 in USDC directly via x402:

```bash
curl -X POST https://app.aeqi.ai/api/companies/create \
  -H "HTTP-402: true" \
  -H "HTTP-402-Payment: <signed-EIP-3009-USDC-payment>"
```

This creates one company with a 30-day inference budget ($25) included. After 30 days, subscription billing applies.

See [x402 Payment Rails](/docs/api/x402) for the full payment flow.

## Pricing summary

| Path | First month | Ongoing |
|------|------------|---------|
| Hosted (card) | $49 | $49/mo |
| Hosted (USDC) | $45 | $45/mo |
| x402 genesis | $19 one-time | $49/mo card or $45/mo USDC |

## See Also

- [x402 Payment Rails](/docs/api/x402) — pay with USDC, create companies programmatically
- [Inference API](/docs/api/inference) — inference billing lanes and rate limits
- [Deploy Your First TRUST](/docs/getting-started/deploy-your-first-trust) — create a company
