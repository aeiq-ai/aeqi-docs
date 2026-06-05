# Billing

## Launch plans

The atomic billing unit is a **Company**: one hosted operating context with its
own runtime, members, agents, quests, sessions, memory, and monthly runtime
credit allowance.

### Personal

- **Price:** $0 today, then $49/month.
- **Included capacity:** 1 member, 10k trial credits, then 100k credits/month
  after trial, S server.
- **Best for:** solo founder trial.

### Startup

- **Price:** $99/month for the first 3 months for the First 100 companies, then
  $190/month.
- **Included capacity:** 3 members, 400k credits/month, M server.
- **Best for:** founding teams.

### Scaleup

- **Price:** $490/month.
- **Included capacity:** 10 members, 2M credits/month, L server.
- **Best for:** higher-capacity company operations.

Every launch plan includes one hosted Company, Company profile, roles, agents,
quests, ideas, events, memory, managed hosting, API access, and MCP access.

## Runtime credits

Runtime credits are USD-subunits for hosted execution capacity:

```text
1,000 credits = $1 of runtime capacity
```

Plan credits are a monthly allowance. Runtime pauses at zero instead of creating
surprise overage invoices.

Personal starts with 10k trial credits during the 7-day card-required trial.
After the trial converts, Personal receives 100k runtime credits/month.

## Monthly credit add-ons

Paid-plan credit add-ons are separate monthly subscriptions:

- **Pack:** 10k extra credits/month.
- **Price:** $10/month.
- **Self-serve limit:** up to 100k extra credits/month.

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
