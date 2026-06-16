# Billing

## Launch plans

The atomic billing unit is a **Company**: one hosted operating context with its
own runtime, members, agents, quests, sessions, memory, and monthly runtime
credit allowance.

### Personal

- **Price:** $0 today, then $49/month.
- **Included capacity:** 1 member, 100 trial credits, then 1,000 credits/month
  after trial, small runtime.
- **Best for:** solo founder trial.

### Startup

- **Price:** $190/month.
- **Included capacity:** 3 members, 4,000 credits/month, team runtime.
- **Best for:** founding teams.

### Scaleup

- **Price:** $490/month.
- **Included capacity:** 10 members, 10,000 credits/month, scale runtime.
- **Best for:** higher-capacity company operations.

Every launch plan includes one hosted Company, Company profile, roles, agents,
quests, ideas, events, memory, managed hosting, API access, and MCP access.

## Runtime credits

Runtime credits are USD-subunits for hosted execution capacity:

```text
100 credits = $1 of runtime capacity (1 credit = 1 cent)
```

Plan credits are a monthly allowance. Runtime pauses at zero instead of creating
surprise overage invoices.

Personal starts with 100 trial credits during the 3-day card-required trial.
After the trial converts, Personal receives 1,000 runtime credits/month.

## Monthly credit add-ons

Paid-plan credit add-ons are separate monthly subscriptions:

- **Pack:** 250 extra credits/month.
- **Price:** $25/month.
- **Self-serve limit:** up to 250 extra credits/month.

Personal add-ons unlock after the trial converts. Larger committed runtime
credit packages are Enterprise.

## Annual billing

Annual billing is a plan cadence, not a credit add-on. It bills ten months for a
year of the same plan capacity:

- **Personal:** $490/year after trial conversion.
- **Startup:** $1,900/year.
- **Scaleup:** $4,900/year.

Monthly credit add-ons stay monthly even when the base plan is annual.

## Multiple Companies

Each launched Company chooses Personal, Startup, or Scaleup independently.
Joining a Company owned by another user is free unless you launch your own paid
Company.

## Enterprise

More than 10 members, larger committed runtime credit capacity, dedicated
infrastructure, SSO, SLAs, audit logs, or custom integrations are Enterprise.
Book a call instead of trying to force those requirements through self-serve
billing.

## See also

- [Company](/docs/concepts/company) - the operating context behind Company authority
- [Inference API](/docs/api/inference) - inference endpoints and limits
- [MCP](/reference/mcp) - exposing aeqi as tools to agent clients
