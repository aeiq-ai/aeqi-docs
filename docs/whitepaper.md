# aeqi: Programmable Companies for the Agent Economy

**L.E. — May 2026**

## Abstract

Two programmability waves arrive at the same place. Artificial intelligence
is making execution programmable: agents can plan, decide, write, and act on
behalf of an organization. Public blockchains have already made ownership
programmable: equity, governance, and treasury can be encoded as state rather
than negotiated as documents. Neither wave is sufficient alone. Agents without
a company are labor without authority, memory, or accountability. Ownership
tokens without operating context are claims against nothing legible.

This paper presents **aeqi**, a runtime for **TRUSTs** — programmable
companies that put both waves inside one operating shell. A TRUST is an
addressable entity with five primitives (Agents, Roles, Quests, Events,
Ideas) and a universal Session substrate that records how intent becomes
work. Once a company can execute, remember, and expose its operating truth,
governance, treasury, and ownership have something real to attach to.

We position aeqi against three classes of antecedents — Decentralized
Autonomous Organizations, agent frameworks, and SaaS company-management
tools — and argue each is structurally incomplete in ways the others
cannot patch. We describe the system model, the role of execution as the
substrate for legible authority and ownership, a recursive capital loop
in which operating truth compounds into governance and capital efficiency,
and three falsifiable predictions for the next three years.

**Keywords:** Agent economy · Programmable companies · TRUST · Operating
runtime · DAOs · Mechanism design · Programmable ownership · Solana.

---

## 1. Introduction

For most of the modern era, a company has been a piece of text wrapped in a
piece of law. Articles of incorporation, shareholders' agreements, board
minutes, cap tables — each a document, each requiring human interpretation,
each prone to drift between what was written, what was meant, and what is
actually happening inside the firm. Coase (1937) explained why firms exist.
Williamson (1975) made transaction costs the central category of analysis.
Jensen and Meckling (1976) gave us the language of agency. All three
frameworks remain true. All three were written about institutions that
lived almost entirely in prose.

Two technologies change what the firm can be made of. Bitcoin (Nakamoto,
2008) showed a network without a trusted intermediary can maintain a
canonical state. Ethereum (Buterin, 2014) extended that to arbitrary code,
opening the possibility that governance, treasury, and ownership could be
executable state rather than paper subject to interpretation. The
Decentralized Autonomous Organization was the natural early shape, and a
decade of practice has surfaced both its potential and its limits (Wright,
2021; Beck et al., 2023; Hacker, 2023). In parallel, the arrival of capable
foundation models has made it plausible that the work performed *inside* an
organization — drafting, reasoning, scheduling, code, research,
coordination — can be carried out by software agents rather than only by
humans (Bommasani et al., 2021).

Each wave, alone, addresses one face of the firm. Programmable ownership
without programmable execution is a cap table without ground truth.
Programmable execution without programmable ownership is labor without a
vehicle. The structural question is where the two converge. The argument
of this paper is that they converge inside the company — not as a
metaphor, but as a runtime.

aeqi is that runtime. It creates **TRUSTs**: programmable companies where
humans set direction, agents execute, memory compounds, and authority,
treasury, governance, and ownership remain inside one operating context.
The wedge is execution because that is what AI makes programmable first.
The deeper claim is institutional: a company that can execute and remember
produces the operating truth that governance, treasury, and ownership can
finally attach to without fiction.

Section 2 surveys where current paradigms fall short. Section 3 states the
central thesis. Section 4 describes the system model. Section 5 develops
the argument that execution is the substrate of operating truth, with a
worked example. Section 6 outlines how programmable ownership and
governance compose on top. Section 7 describes the recursive capital loop.
Section 8 surveys related work. Section 9 considers the threat model.
Section 10 commits to three predictions. Section 11 concludes.

---

## 2. Where Current Paradigms Fall Short

No existing system unifies execution, memory, authority, treasury,
governance, and ownership inside a single operating context that an
organization can actually be run from. Four antecedents, each incomplete
in a different way.

**The traditional firm.** Coordinates work through hierarchy, contracts,
and informal trust. The legal substrate has been refined for over a
century; the gap between the legal shell and operating reality has not.
Strategy lives in slide decks. Decisions live in messaging threads.
Authority is renegotiated case by case. Equity lives in a spreadsheet
whose accuracy is asserted, not verified. Due diligence is the work of
*reconstructing* the firm from outside because no machine-readable record
of it exists inside.

**DAOs.** Replace some scaffolding with executable code (Buterin, 2014).
The pattern of failures is now well-documented (Wright, 2021; Beck et al.,
2023; Buterin, 2017): legal ambiguity (Aznar, 2024; Krutiy, 2025),
governance pathology (voter apathy, whale capture, paralysis), tokenomic
misalignment (Congregado et al., 2021), absent operational standardization
(Davidson et al., 2018; Liu & Shang, 2022). The deeper limit is
structural: a DAO that has voted but has not *operated* has only ratified
text. The work that should justify the ratification lives elsewhere.

**Agent frameworks.** LangChain, AutoGen, CrewAI, and successors make it
easier to assemble individual agents and small workflows. They are tools
for *labor*. They do not give an organization a mission, role structure,
durable memory, authority and budget boundaries, treasury, or governance.
An agent without a company is an isolated worker; a swarm without a
company is a workforce with no employer.

**Company-management SaaS.** Stripe Atlas, Carta, Notion, Linear, Slack,
Docusign — each solves a discrete function and leaves the company
fragmented across half a dozen disconnected systems. None of them knows
that a particular conversation produced a particular decision that
committed a particular budget against a particular role to advance a
particular quest.

The shared gap is the absence of an operating shell in which intent,
work, memory, authority, treasury, governance, and ownership live
together as one observable system. Composing the existing categories
more cleverly does not close it. Treating the company as a primitive
does.

---

## 3. The Company Is the Primitive

The conventional unit of analysis in the agent-tools stack is the *agent*.
The unit that captures direction, authority, memory, treasury,
governance, and ownership in one observable boundary is the *company*. An
agent is a unit of execution. A company is a unit of economic identity.

**Execution requires a company to be meaningful.** Work has economic
value when an entity can hire to produce it, capitalize the cost,
own the result, and be held accountable. None of these properties
belong to an agent in isolation.

**Memory requires a company to compound.** Agents carry short-term
state. Long-term memory — the kind that lets a firm learn from its own
history and become more effective over years — is a property of an
institution.

**Ownership requires a company to be legible.** Equity is a claim
against operating value. If the value is unobservable, the claim is
ungrounded. Tokenized cap tables did not displace traditional cap
tables in part because both versions described the same opaque
underlying firm.

The construct we propose for that company is the **TRUST**. Public-facing
copy describes it simply: a programmable company for the agent economy.
The technical construct is a smart account on a public chain whose state
includes a role graph, attached agents, scoped treasuries, governance
modules, and operational primitives — and whose off-chain runtime
executes the work that produces operating history.

---

## 4. System Model

aeqi compiles a TRUST into a small, orthogonal set of primitives. Each
corresponds to one face of the company; together they cover the
operational surface earlier paradigms left fragmented.

### 4.1 The five primitives

| Primitive | Question | Role |
|---|---|---|
| **Agents** | *Who* executes | Configured workers (CEO agent, research agent, engineering agent) that occupy roles, hold tools, and run as ephemeral processes spawned per turn. |
| **Roles** | *Under what authority* | Slots in the company's authority DAG. Carry scope, permissions, and budget. Agents and humans occupy the same role surface. |
| **Quests** | *What* gets done | Units of work with a goal, scope, owner, optional budget, and a lifecycle that produces a durable record. The surface against which contribution and progress are observed. |
| **Events** | *When* and *what happened* | Append-only operating history. Lifecycle transitions, decisions, tool invocations, governance outcomes, runtime signals. The organization's machine-readable memory of itself. |
| **Ideas** | *How* the company thinks | Reusable knowledge: strategy, procedures, principles, decisions, identities, documents. Addressable, taggable, linkable. The substrate of organizational learning. |

A sixth construct — the **Session** — is the universal conversation
primitive. Inbox, chat, channel, comment thread, and activity stream are
the same data shape under different scope predicates. Three verbs
(`message_to`, `add_participant`, `mention`) drive every conversational
interaction.

The shape is small, deliberately. Further refinements — documents,
customer records, hiring funnels — are saved views over Ideas with typed
properties rather than new primitive categories.

### 4.2 The runtime

A TRUST is also a running process. The aeqi runtime is a per-tenant
orchestrator that holds the database, executes agent turns in sandboxes,
fires events on lifecycle transitions, dispatches tool calls, and
produces the session record that becomes the operating history.
Ephemerality is a feature: every execution is one turn, the process
exits on completion, the next trigger spawns fresh context. Continuity
is a property of the persistent state, not of any process. The runtime
is consumed through three interface families: a web UI, a REST API, and
an MCP server that exposes the runtime as a tool surface to external
coding agents.

### 4.3 The on-chain anchor

The persistent identity is anchored on a public chain. The canonical
chain is Solana; the on-chain construct is a role-graph smart account
rather than a multisig (Anchor 0.31, secp256r1 passkey signing, native
fee payer). Modular programs — governance, treasury, venture — compose
around the core trust program. The chain holds identity, authority graph,
treasury state, and the artifacts of governance. The runtime holds
operating history and the work that produced it. Together they are the
TRUST.

---

## 5. Execution as the Substrate of Operating Truth

A company that can execute, remember, and expose its operating truth gives
governance, treasury, and ownership something real to attach to. We call
the resulting record **operating truth**: a machine-readable, append-only
account of what the company did, who acted, under what authority, against
what plan, and with what result.

Operating truth is what previous attempts at programmable ownership
lacked. A token claim against a firm is a claim against the firm's
value-creating activity. If that activity is unobservable to the
mechanism that issues and prices the claim, the claim is grounded in
narrative rather than in record. This is why on-chain cap tables did not
displace off-chain cap tables. It is why DAO governance has often
produced ratified text without operational substance.

### 5.1 A worked example: five days inside a TRUST

A founder starts a company. The runtime creates a TRUST and assigns the
founder a Director role. The founder writes a one-paragraph mission as
an Idea attached to the TRUST. The Architect agent, hired from a
template, reads the mission and proposes an initial structure: a CEO
role, a CTO role, and three operational roles (Engineering, Research,
Operations). The founder accepts. Each role is committed to the chain.

Day two. The founder hires a CEO agent into the CEO role and a Research
agent into the Research role. The CEO agent's first quest is *draft a
month-one operating plan*. It opens a Session with the founder, asks
four clarifying questions, and produces a plan as a set of linked Ideas.
Each exchange in the session is an Event. The plan references six
follow-on quests, each with an owner role, an estimated cost, and a
deadline.

Day three. The Research agent picks up one follow-on quest — *map the
closest five competitors*. It runs for six minutes inside its sandbox,
calls a search tool eleven times, drafts a comparison Idea, and closes
the quest. The session is preserved. The cost is debited against the
Research role's budget. The closure is an Event.

Day four. The founder convenes a governance proposal: allocate $5,000
of treasury to a paid pilot with a design contractor. The proposal is
an Idea. The vote is recorded as Events. The on-chain treasury module
releases the budget against the operational role authorized to spend.

Day five. A potential investor reads the TRUST. They do not request a
data room. They open `/trust/<address>` and inspect the mission, the
role graph, the agents and their occupancy, the quests opened and
closed, the events that produced governance decisions, the treasury
state. The operating reality of the firm is observable rather than
reconstructed.

The example is small and the firm is small, but the substrate is
general. Every action was an event. Every decision was a session.
Every commitment was governed by a role. Every spend was budgeted. The
operating truth is the byproduct of running, not telemetry added on top.

### 5.2 Composable authority and compounding memory

**Authority is composable.** Roles are nodes in a DAG; permissions
attach to roles, not individuals; agents and humans occupy the same
role surface. Effective authority for any action is the transitive
closure over the graph. This is not new in distributed systems. Its
application to companies — where authority has historically been
informal — is.

**Memory compounds.** Ideas are addressable knowledge, linkable to
roles, quests, agents, and sessions. The set of ideas attached to a
role makes the role recognizable; the set attached to a company makes
the company a learning institution rather than a moment-in-time
configuration.

The relationship between operating truth and ownership is not
mechanical. The claim is *not* that contribution can be measured and
tokens automatically minted against it. Reducing ownership to
contribution accounting would be a mistake; ownership is a company
primitive, not a points system. The claim is weaker and more important:
when ownership lives near execution history, authority, treasury, and
governance — in the same operating context — it becomes more credible
than when it lives in a spreadsheet disconnected from the work it is
meant to reward.

---

## 6. Programmable Ownership and Governance

Once a company can execute, remember, and expose operating truth,
ownership and governance become things that *attach* rather than things
that must be invented from nothing.

**Ownership** is a property of the entity, not a downstream derivation
of task logs. A TRUST has an authority graph, a treasury, and an
ownership state — who is entitled to what share of residual value,
under what conditions. Ownership state is recorded on chain,
parameterized by the entity's governance module, and conditioned on
operational events. Performance-anchored mechanisms — vesting against
verifiable milestones rather than mere tenure — become tractable to
ship once the underlying company is itself an operating system.

**Governance** is similarly first-class. The TRUST exposes a governance
module composable with the rest of its state. Proposals are addressable
ideas; votes are recorded events; outcomes commit on chain; effects
propagate through the role graph. Governance is not a separate ritual
conducted in a parallel system — it is an operation of the company,
recorded in the same session and event substrate as everything else.

**Treasury** sits in the same surface. Each TRUST holds funds on
chain. Budgets are first-class primitives with their own directed graph
and their own owner roles. Spend is gated through role authority and
recorded as events. The chain enforces custody; the runtime enforces
operational context.

The depth of these properties stages with the company. A two-person
operating company exposes mostly the operational surface. A larger
company with external capital and on-chain governance exposes the
deeper modules. The substrate is the same.

---

## 7. The Recursive Capital Loop

The architecture compounds. The same substrate that gives a single
company operational coherence becomes infrastructure that other
companies build on, and infrastructure that capital can read from.

| Step | Claim |
|---|---|
| **1. Execution** | A company running on aeqi generates a machine-readable record of its work as the form the company takes, not as telemetry added on top. |
| **2. Operating history** | The record exposes who did what under what authority. Opacity that historically made firms expensive to coordinate, audit, and trust is replaced by an observable substrate. |
| **3. Inspectable authority** | Makes treasury, governance, and ownership more credible. A vote committing a budget against a role to fund a quest is an event in operating history, not a freestanding ritual. |
| **4. Credibility** | Makes capital allocation more efficient. Due diligence shifts from reconstructing the firm from outside to reading it from inside. Information asymmetries that previously priced into capital cost shrink. |
| **5. Capital** | Funds more execution. Capital allocated to credible companies produces more operating history, which expands the substrate, which makes the system more useful to the next company that adopts it. |

The loop is recursive in the strong sense Katz and Shapiro (1985)
described for network goods: the value of the system to any individual
participant grows with the participation of others. A runtime that
improves how other companies operate produces compounding system-wide
returns no individual company on it can match. This is the leverage shape
operating systems have over the applications running on them. The
highest-leverage company is the one whose existence improves how other
companies are created, operated, funded, governed, and owned.

The naming — *programmable capitalism* — is accurate. The ordering
matters: programmable capitalism becomes adoptable when its first
sentence is operational rather than financial. Founders need leverage
before they need structure. The wedge sells execution; the protocol
compounds underneath.

---

## 8. Related Work

| Tradition | Representative work | What it gives | What it lacks |
|---|---|---|---|
| Decentralized coordination foundations | Nakamoto (2008), Buterin (2014), Davidson et al. (2018) | Platform on which on-chain organizations can exist; framing of blockchains as institutional technology. | The company as a programmable primitive on top. |
| DAO theory and practice | Wright (2021), Buterin (2017), Beck et al. (2023), Hacker (2023), Ellinger et al. (2023) | Diagnosis of legal ambiguity, governance pathology, incentive misalignment. | Operating substrate that gives governance something to govern. |
| Institutional economics | Coase (1937), Williamson (1975), Jensen & Meckling (1976) | Vocabulary for why firms exist and where their costs accumulate. | Mapping to a machine-readable firm. |
| Mechanism design | Hurwicz & Reiter (2006), Maskin (2008), Nisan & Ronen (2001) | Theory of designing rules for collective outcomes. | Domain-specific application to company formation. |
| Network economics | Katz & Shapiro (1985) | Externalities that make network goods compound. | — (we apply this directly). |
| Agent systems | LangChain, AutoGen, CrewAI; Bommasani et al. (2021) | Tooling for individual agents and small workflows. | The company in which the work takes place. |
| On-chain primitives | Safe, Squads, Realms, MetaDAO | Multisig, team treasury, governance, futarchy. | A unified runtime in which all of these compose around an entity. |
| Company-formation SaaS | Stripe Atlas, Carta, Notion, Linear | Discrete frictions removed; demand validated. | Unification. |

We diverge from the DAO tradition in prescription, not diagnosis: rather
than fixing DAOs in isolation, we shift the unit of analysis from
"decentralized organization" to "programmable company" and let the legal,
governance, and incentive machinery be properties of that company.

---

## 9. Threat Model

A system that puts execution, authority, treasury, governance, and
ownership in one context inherits all of their risks at once.

**Over-automation.** Companies that delegate too much to agents risk
losing the human judgment direction-setting requires. *Mitigation:*
humans set direction, agents execute. Role scope, quest-level human
approvals on high-impact actions, and treasury gating enforce this
operationally.

**Governance theater.** On-chain rituals without operational substance.
*Mitigation:* governance outcomes propagate into the role graph and
budgeting system, so a vote that does not produce an operational change
is visibly inert.

**Token-price-versus-value drift.** Programmable ownership instruments
priced by speculation rather than performance. Performance-anchored
mechanisms mitigate but do not eliminate. *Underlying defense:*
operational legibility — priced instruments diverge from value when
value is unobservable.

**Custody and signer compromise.** A TRUST holds funds and authority
on chain. Compromised passkeys or smart-account bugs create direct loss
vectors. *Mitigation:* passkey-native smart accounts with timelocked,
constrained recovery via existing-signer veto; formal audit; the
principle that recovery does not require operator custody.

**Foundation-model hallucination becoming operating truth.** Agents can
produce wrong records. Operating truth is only useful if it is accurate.
*Mitigation:* human approval gates on consequential actions; structured
tool calls preferred over free-text claims; durable event records that
can be audited and challenged after the fact.

**Regulatory shifts.** AI liability and on-chain securities regimes are
both in active evolution. The permissionless-operation /
KYC-gated-ownership separation is one defense.

**Coordination collapse at scale.** Inter-company composability
introduces failure modes single-entity governance does not face.
*Mitigation:* standardize the inter-company contract surface — the same
blueprints, modules, and authority semantics across TRUSTs.

---

## 10. Predictions and Falsifiability

We commit to three falsifiable predictions for 2026–2029.

**Prediction 1.** In the agent-economy segment, the average company
running on a programmable-company runtime will complete diligence for
external capital in materially less time than a comparably-sized
company running on traditional infrastructure. *Falsified if:* no
observable diligence-time reduction by 2028 across at least 50 funded
companies with audited timelines.

**Prediction 2.** Authority graphs (roles + transitive closure) will
become the default way to express organizational authority for
companies founded inside the agent economy, replacing prose-defined
authority for the majority of operational decisions. *Falsified if:*
by 2029, the majority of agent-economy companies still express
authority primarily through job titles and informal scope rather than
through a machine-readable role graph.

**Prediction 3.** At least one programmable-company runtime will host
$100M+ in cumulative on-chain treasury across companies it supports
by end of 2029. *Falsified if:* no such runtime exists by that date.

These are not the most ambitious versions of the thesis. They are the
versions that can be checked. If all three are falsified, the thesis is
wrong about timing, scope, or both. If all three hold, the thesis
remains an open question — operating systems take longer than three
years to win — but the direction of travel is confirmed.

---

## 11. Conclusion

The bottleneck has moved. Capital is abundant. Foundation models are
abundant. The scarce thing is infrastructure that allows execution and
ownership to be programmable inside the same operating context, with
the operating truth between them that makes both credible.

A traditional company assembles itself out of documents, conversations,
and tools. A DAO ratifies decisions about an organization whose work
lives elsewhere. An agent framework manufactures labor that has no
employer. A SaaS company OS files away discrete pieces of the firm in
disconnected applications. None is wrong. None is sufficient.

A TRUST is a programmable company: an addressable entity with
role-scoped authority, attached agents, durable memory, on-chain
treasury and ownership, and a runtime that turns intent into work and
work into operating history. Humans set direction. Agents execute.
Memory compounds. Authority, treasury, governance, and ownership live
in one operating context.

Programmable capitalism is the long arc. Programmable companies are
the wedge. Improvements to the default infrastructure for venture
creation have compounding system-wide effects greater than any
individual startup they enable.

Startups fail or exit. Operating systems persist.

aeqi is one answer.

---

## References

Aznar, E. (2024). *Legal challenges and structures of Decentralised
Autonomous Organisations (DAOs)*. LegalCripto — Baes Blockchain Lab.

Beck, L., Müller-Bloch, C., & King, J. L. (2023). Governance in
Decentralized Autonomous Organizations: A Review and Research Agenda.
*ECIS 2023 Research Papers*.

Bommasani, R., et al. (2021). On the Opportunities and Risks of
Foundation Models. *Stanford HAI CRFM*.

Buterin, V. (2014). *Ethereum: A Next-Generation Smart Contract and
Decentralized Application Platform*.

Buterin, V. (2017). *Notes on Blockchain Governance*.

Coase, R. H. (1937). The Nature of the Firm. *Economica*, 4(16), 386–405.

Congregado, E., Golpe, A. A., & Iglesias, J. (2021). Tokenomics and
blockchain. *PLoS ONE*, 16(8), e0256065.

Davidson, S., De Filippi, P., & Potts, J. (2018). Blockchains and the
economic institutions of capitalism. *Journal of Institutional
Economics*, 14(4), 639–658.

Ellinger, P., Mini, T., Gregory, R. W., & Dietz, L. (2023). Exploring
Decentralized Autonomous Organization (DAO) Governance: An integrative
literature review.

Hacker, P. (2023). Corporate Governance for Complex Cryptocurrencies?
*Journal of Corporation Law*, forthcoming.

Hurwicz, L., & Reiter, S. (2006). *Designing Economic Mechanisms*.
Cambridge University Press.

Jensen, M. C., & Meckling, W. H. (1976). Theory of the firm: Managerial
behavior, agency costs and ownership structure. *Journal of Financial
Economics*, 3(4), 305–360.

Katz, M. L., & Shapiro, C. (1985). Network Externalities, Competition,
and Compatibility. *American Economic Review*, 75(3), 424–440.

Krutiy, E. (2025). Decentralized Autonomous Organizations (DAOs):
Challenges of Qualification and Choice of a Law Applicable. *Law
Journal of the Higher School of Economics*.

Liu, Y., & Shang, R. (2022). Decentralized Autonomous Organizations:
Concept, Practice, and Challenges. *IEEE International Conference on
Blockchain*.

Maskin, E. S. (2008). Mechanism design: How to implement social goals.
*American Economic Review*, 98(3), 567–576.

Nakamoto, S. (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System*.

Nisan, N., & Ronen, A. (2001). Algorithmic Mechanism Design. *Games
and Economic Behavior*, 35(1–2), 166–196.

Williamson, O. E. (1975). *Markets and Hierarchies: Analysis and
Antitrust Implications*. Free Press.

Wright, A. (2021). The Rise of Decentralized Autonomous Organizations.
*Stanford Journal of Blockchain Law & Policy*.
