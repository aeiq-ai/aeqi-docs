# aeqi: Programmable Companies for the Agent Economy

**L.E. — May 2026**

## Abstract

Two distinct programmability waves arrive at the same place. Artificial
intelligence is making execution programmable: agents can plan, decide, write,
and act on behalf of an organization. Public blockchains have already made
ownership programmable: equity, governance, and treasury can be encoded as
state rather than negotiated as documents. Neither wave is sufficient on its
own. Agents without a company are labor without authority, memory, or
accountability. Ownership tokens without operating context are claims against
nothing legible.

This paper presents **aeqi**, a runtime for **TRUSTs**: programmable companies
that put both waves inside one operating shell. A TRUST is an addressable
entity with five primitives — Agents, Roles, Quests, Events, and Ideas — and a
universal Session substrate that records how intent becomes work. Once a
company can execute, remember, and expose its operating truth, governance,
treasury, and ownership have something real to attach to. The result is a
foundation for what an earlier generation of this work called *programmable
capitalism* (L.E., 2025), reframed around a specific entry point: execution
first, operating truth as the substrate, ownership and capital as the
compounding consequence.

We position aeqi against three classes of antecedents — Decentralized
Autonomous Organizations, agent frameworks, and SaaS company-management
tools — and argue that each is structurally incomplete in a way the others
cannot patch. We describe the system model, the role of execution as the
substrate for legible authority and ownership, and a recursive capital loop in
which operating truth compounds into governance and capital efficiency. The
contribution is not a new agent framework, a new DAO tool, or a new
incorporation app. It is the company itself, restated as software.

**Keywords:** Agent economy · Programmable companies · TRUST · Operating
runtime · Decentralized autonomous organizations · Mechanism design · New
institutional economics · Programmable ownership · Solana.

---

## 1. Introduction: The Convergence

For most of the modern era, a company has been a piece of text wrapped in a
piece of law. Articles of incorporation, shareholders' agreements, employment
contracts, board minutes, cap tables — each a document, each requiring human
interpretation, each prone to drift between what was written, what was meant,
and what is actually happening inside the firm. Coase (1937) observed that the
firm exists because internal coordination is sometimes cheaper than market
exchange. Williamson (1975) made transaction costs the central category of
analysis. Jensen and Meckling (1976) gave us the language of agency to
describe the gap between principals and the people who act on their behalf.
All three frameworks remain true. All three were written about institutions
that lived almost entirely in prose.

Two technologies have changed what the firm can be made of. Bitcoin (Nakamoto,
2008) demonstrated that a network of participants without a trusted
intermediary can maintain a canonical state. Ethereum (Buterin, 2014) extended
that capability to arbitrary code, opening the possibility that an
organization's governance, treasury, and ownership could be expressed as
executable state rather than as paper subject to interpretation. The
Decentralized Autonomous Organization (DAO) was the natural early shape of
this idea, and a decade of experimentation has surfaced both its potential and
its limits (Wright, 2021; Beck et al., 2023; Hacker, 2023). In parallel, the
arrival of capable foundation models has made it plausible that the work
performed *inside* an organization — drafting, reasoning, scheduling, code,
research, coordination — can be carried out by software agents rather than
only by humans (Bommasani et al., 2021).

Each programmability wave, taken alone, addresses one face of the firm.
Programmable ownership without programmable execution is a cap table without
ground truth: a tokenized claim against an organization whose operating
reality still lives in disconnected documents and chat logs. Programmable
execution without programmable ownership is labor without a vehicle: agents
that can do work but have nowhere to do it from, no authority to act under,
no memory to compound, no economic identity to be paid into. The structural
question is where the two waves converge. The argument of this paper is that
they converge inside the company — not as a metaphor, but as a runtime.

aeqi is that runtime. It creates **TRUSTs**: programmable companies for the
agent economy where humans set direction, agents execute, memory compounds,
and authority, treasury, governance, and ownership remain inside one operating
context. The product wedge is execution because execution is what AI makes
programmable first. The deeper thesis is institutional: a company that can
execute and remember produces the operating truth that governance, treasury,
and ownership can finally attach to without fiction.

The remainder of this paper is organized as follows. Section 2 surveys what
the existing solutions — traditional firms, DAOs, agent frameworks, SaaS
company tools — get right and where each is structurally incomplete. Section
3 states the central thesis: the company is the primitive. Section 4
describes the system model and the five operational primitives of a TRUST.
Section 5 develops the argument that execution is the substrate of operating
truth, and that this is the missing ingredient earlier work could not supply.
Section 6 outlines how programmable ownership and governance compose on top
of that substrate. Section 7 describes the recursive capital loop that
follows when these layers compound. Section 8 surveys related work. Section
9 considers the threat model. Section 10 concludes.

---

## 2. Background: Where Current Paradigms Fall Short

The case for aeqi rests on a specific claim: that no existing system unifies
execution, memory, authority, treasury, governance, and ownership inside a
single operating context that an organization can actually be run from. To
make that claim concrete, we examine four classes of antecedents and identify
the structural gap each leaves open.

### 2.1 The traditional firm

The traditional firm coordinates work through hierarchy, contracts, and
informal trust. Coase (1937) explained why such firms exist; Williamson
(1975) catalogued why they bear meaningful coordination costs. The legal
substrate — Delaware C-corporations, LLCs, the apparatus of cap tables and
shareholder agreements — has been refined for over a century. What has not
been refined is the gap between this legal shell and the operating reality
inside it. Strategy lives in slide decks. Decisions live in messaging
threads. Authority lives in titles whose actual scope is negotiated case by
case. Equity lives in a spreadsheet whose accuracy is asserted, not verified.

The cost of this fragmentation is borne everywhere along the venture
lifecycle. Due diligence is essentially the work of *reconstructing* a
company's operating reality from outside — through documents, calls, and
data rooms — because no machine-readable record of that reality exists
inside the firm itself. The transaction costs Williamson (1975) identified
are not residual frictions to be optimized away; they are the dominant cost
structure of how companies are formed, funded, and exited.

### 2.2 Decentralized Autonomous Organizations

The DAO promised to replace some of that scaffolding with executable code
(Buterin, 2014). A decade of practice has produced real innovation — token
voting, on-chain treasuries, formal proposal mechanisms — but also a
recognizable pattern of failure modes (Wright, 2021; Beck et al., 2023;
Buterin, 2017; Ellinger et al., 2023; Hacker, 2023). DAOs typically lack
clear legal personality, which limits their ability to own property, enter
enforceable contracts, or shield participants from liability (Aznar, 2024;
Krutiy, 2025; Guillaume, 2023). Governance often collapses into voter
apathy, whale capture, or paralysis (CENTRUM Católica, 2024). Tokenomic
design routinely fails to align contributor incentives with long-term value
creation (Congregado et al., 2021; Three Sigma, n.d.; TokenMinds, 2025), and
the absence of operational standardization forces every DAO to rebuild basic
business functions from scratch (Davidson et al., 2018; Liu & Shang, 2022).

The deeper limitation is structural. A DAO that has voted but has not
*operated* has only ratified text. The organization's actual work — the
sequence of decisions, drafts, conversations, and commits that produced its
state — typically lives outside the chain. Governance is recorded; execution
is not. Without a record of execution, the DAO's on-chain artifacts are
claims about an off-chain organization that may or may not exist in the
shape its tokens describe.

### 2.3 Agent frameworks

The current generation of agent frameworks — LangChain, AutoGen, CrewAI, and
their successors — has made it dramatically easier to construct individual
agents and small multi-agent workflows. Useful as these are, they are
explicitly tools for assembling *labor*. They do not, on their own, give an
organization the things a company is for: a mission, a role structure,
durable memory across sessions, authority and budget boundaries, integration
with treasury and ownership, or a substrate for governance. An agent without
a company is an isolated worker. A swarm of agents without a company is a
loosely coupled workforce with no employer. The work happens; the
institution that should be accumulating from it does not exist.

### 2.4 Company-management SaaS

A third class of antecedents — Stripe Atlas for incorporation, Carta for cap
tables, Notion or Linear for operations, Slack for conversation, Docusign for
signatures — solves discrete problems competently but leaves the company
itself fragmented across half a dozen disconnected systems. None of these
tools knows that a particular conversation produced a particular decision
that committed a particular budget against a particular role to advance a
particular quest. None of them produces an operating record that governance
or capital can read directly. They are functions on the surface of the firm;
they are not the firm.

### 2.5 The gap

The shared gap across all four categories is the absence of a single
operating shell in which intent, work, memory, authority, treasury,
governance, and ownership live together as one observable system. Each
category solves part of the problem at the cost of leaving the other parts
elsewhere. The bet of this paper is that this gap is not narrow — it is the
shape of the company itself, and it cannot be closed by composing the
existing categories more cleverly. It can be closed only by treating the
company as a primitive.

---

## 3. The Company Is the Primitive

The conventional unit of analysis in the modern operating-system stack is
the *agent*. We disagree. The unit that captures direction, authority,
memory, treasury, governance, and ownership in one observable boundary is
the *company*. An agent is a unit of execution. A company is a unit of
economic identity.

Three observations follow from this choice.

**Execution requires a company to be meaningful.** Work has economic value
when an entity can hire to produce it, capitalize the cost of producing it,
own the result of producing it, and be held accountable for what it did
along the way. None of these properties belong to an agent in isolation.
They belong to a company that the agent operates inside.

**Memory requires a company to compound.** Individual agents can carry
short-term state. Long-term memory — the kind that lets a firm learn from
its own history, accumulate strategy and procedure, and become more
effective over years — is a property of an institution. It is the company
that should know what it knows.

**Ownership requires a company to be legible.** Equity is a claim against
operating value. If the operating value is unobservable, the claim is
ungrounded. Tokenized cap tables failed to displace traditional cap tables
in part because both versions described the same opaque underlying firm.
Programmable ownership becomes more efficient than its analog predecessor
only when the company underneath becomes programmable too.

The construct we propose for that company is the **TRUST**. Public-facing
copy describes a TRUST simply: a programmable company for the agent
economy. The technical construct is a smart account on a public chain whose
state includes a role graph, attached agents, scoped treasuries, governance
modules, and operational primitives — and whose off-chain runtime executes
the work that produces operating history. The TRUST is the addressable
entity. The runtime is what gives it motion.

---

## 4. System Model

aeqi compiles a TRUST into a small, orthogonal set of primitives. Each
primitive corresponds to one face of the company; together they cover the
operational surface that earlier paradigms left fragmented across documents,
threads, spreadsheets, and tools.

### 4.1 Five primitives

- **Agents — *who* executes.** An agent is a configured worker that can act
  inside the company: a CEO agent, a research agent, an engineering agent.
  Agents occupy roles, hold tools, and run as ephemeral processes spawned
  per turn. They are the company's labor.

- **Roles — *under what authority*.** A role is a slot in the company's
  authority graph. It carries scope (what it may act on), permissions (which
  tools it may invoke), and budget (what spend it may commit). Authority is
  expressed as a directed acyclic graph; effective authority is the
  transitive closure. Agents occupy roles; humans may also occupy roles.
  The graph is the org chart, not as a diagram, but as state.

- **Quests — *what* gets done.** A quest is a unit of work with a goal, a
  scope, an owner, an optional budget, and a lifecycle that produces a
  durable record. Quests are the company's planned and tracked output. They
  are the surface against which contribution, attribution, and progress are
  observed.

- **Events — *when* and *what happened*.** Events are an append-only
  operating history. They record lifecycle transitions, decisions, tool
  invocations, governance outcomes, and runtime signals. They are the
  organization's machine-readable memory of itself.

- **Ideas — *how* the company thinks.** Ideas are the company's reusable
  knowledge: strategy, procedures, principles, briefs, decisions,
  identities, and documents. Ideas are addressable, taggable, and linkable;
  they form the durable substrate of organizational learning. The set of
  ideas attached to a role or an agent is, in effect, that participant's
  operating context.

A sixth construct — the **Session** — is the universal conversation
primitive in which the other five interact. Inbox, chat, channel, comment
thread, and activity stream are all the same data shape under different
scope predicates: sessions where you are a participant; sessions scoped to
an agent; sessions scoped to a TRUST. A consequence of treating sessions as
a primitive is that every operational surface of the product is a saved
view over the same substrate. Three verbs — `message_to`, `add_participant`,
`mention` — are sufficient to drive every conversational interaction the
runtime supports.

The shape is small, deliberately. Four primitives plus roles plus sessions
covers the operational surface a company exposes; further refinements
(documents, files, customer records, hiring funnels) are saved views over
Ideas with typed properties rather than new primitive categories.

### 4.2 The runtime

A TRUST is not only a schema. It is a running process. The aeqi runtime is
a per-tenant orchestrator that holds the TRUST's database, executes agent
turns inside sandboxes, fires events on lifecycle transitions, dispatches
tool calls, and produces the session record that becomes the company's
operating history. Ephemerality is a feature: every agent execution is one
turn, the process exits on completion, and the next trigger spawns a fresh
context. There are no parked workers, no daemon agents holding state in
memory. Continuity is a property of the company's persistent state, not of
any particular process.

The runtime is consumed through three interface families. The web UI
(`apps/ui`) is the human surface. The platform API exposes the same
operations programmatically over REST. The Model Context Protocol (MCP)
server exposes the runtime as a tool surface to any MCP-aware client — Claude
Code, Codex, Cursor — so that external coding agents can act *inside* a
TRUST and have their actions captured as part of the company's operating
history.

### 4.3 The on-chain anchor

The persistent identity of a TRUST is anchored on a public chain. The
canonical chain is Solana; the on-chain construct is a role-graph smart
account rather than a multisig (Anchor 0.31; secp256r1 passkey signing;
native fee payer). Modular programs — governance, treasury, and venture
modules — compose around the core trust program. The chain holds identity,
authority graph, treasury state, and the artifacts of governance. The
runtime holds operating history and the work that produced it. Together
they constitute the TRUST: an entity whose state is partly enforced by
public consensus and partly produced by its own execution.

---

## 5. Execution as the Substrate of Operating Truth

The central architectural claim of this paper can be stated compactly: a
company that can execute, remember, and expose its operating truth gives
governance, treasury, and ownership something real to attach to. We call
the resulting record **operating truth**: a machine-readable, append-only
account of what the company did, who acted, under what authority, against
what plan, and with what result.

Operating truth is what previous attempts at programmable ownership lacked.
A token that represents a claim against a firm is a claim against the
firm's value-creating activity. If that activity is unobservable to the
mechanism that issues and prices the claim, the claim is grounded in
narrative rather than in record. This is why on-chain cap tables, taken in
isolation, did not displace off-chain cap tables: the underlying object
they described was equally opaque in both forms. It is also why DAO
governance, in isolation, has so often produced ratified text without
operational substance: there was nothing operational to ratify.

The aeqi runtime is designed to make operating truth the cheap default of
running a company. Every quest produces a record. Every decision produces a
session. Every tool call produces an event. The records are linked, scoped,
and addressable. A reader of the company — internal auditor, external
counterparty, governance participant, capital allocator — can resolve from
"this entity" to "what it did," and from "what it did" to "who acted with
what authority and what budget," without reconstructing that information
from external sources.

Two properties of this substrate deserve emphasis.

**Authority is composable.** Roles are nodes in a DAG; permissions are
attached to roles, not to individuals; agents and humans occupy the same
role surface. Effective authority for any action is the transitive closure
over the graph. This is not a new idea in distributed systems, but its
application to companies — where authority has historically been informal
and renegotiated case by case — is. Composable authority means scope can be
inspected and verified rather than asserted.

**Memory compounds.** Ideas are addressable knowledge, linkable to roles,
quests, agents, and sessions. The same idea can serve as a strategy
document, a procedure, a position, an operating principle, or an attached
context for an agent. The set of ideas attached to a role is what makes the
role recognizable; the set of ideas attached to a company is what makes the
company a learning institution rather than a moment-in-time configuration.
Memory of this shape compounds — it accumulates, it cross-references, it
becomes part of the company's identity in a way that a chat history or a
folder of files cannot.

The relationship between operating truth and ownership is not mechanical.
It is not the claim that contribution can be measured and tokens can be
automatically minted against it. Reducing ownership to contribution
accounting would be a mistake; ownership is a company primitive, not a
points system. The claim is weaker and more important: when ownership lives
near execution history, authority, treasury, and governance — in the same
operating context — it becomes more credible than when it lives in a
spreadsheet disconnected from the work it is meant to reward.

---

## 6. Programmable Ownership and Governance

Once a company can execute, remember, and expose operating truth, ownership
and governance become things that *attach* rather than things that have to
be invented from nothing. The TRUST construct gives them the place to
attach.

**Ownership** in aeqi is a property of the entity, not a downstream
derivation of task logs. A TRUST has an authority graph (roles), a treasury
(budgets and balances), and an ownership state (who is entitled to what
share of the entity's residual value, under what conditions). Ownership
state is recorded on chain, parameterized by the entity's governance
module, and conditioned on operational events — vesting against
verifiable milestones rather than mere tenure, for instance. The earlier
generation of this work (L.E., 2025) catalogued specific mechanisms for
performance-anchored vesting, market-validated unlock conditions, and
deterministic fundraising pipelines. Those mechanisms remain available and
remain useful; what has changed is the order. They become tractable to ship
once the underlying company is itself an operating system rather than a
piece of text. Execution first; ownership instruments on top.

**Governance** is similarly first-class. The TRUST exposes a governance
module composable with the rest of its state. Proposals are addressable
ideas; votes are recorded events; outcomes are committed on chain; effects
propagate through the role graph and through the runtime that executes
against it. Governance is therefore not a separate ritual conducted in a
parallel system. It is an operation of the company, recorded in the same
session and event substrate as everything else the company does. Authority,
budget, and policy changes are operational events — visible, scoped, and
auditable like any other.

**Treasury** sits in the same surface. Each TRUST holds its own funds on
chain. Budgets are first-class primitives with their own directed graph and
their own owner roles. Spend is gated through role authority and recorded
as events. The chain enforces custody; the runtime enforces operational
context. Together they make a treasury that is both protected and legible.

The central design decision of this layer is that none of it requires the
company to first produce a separate "governance entity" or "treasury
entity" or "cap-table entity" elsewhere. There is one TRUST. It has roles,
treasury, governance, and ownership as properties. The depth of these
properties can be staged: a small two-person operating company exposes
mostly the operational surface; a larger company with external capital and
on-chain governance exposes the deeper modules. The substrate is the same.

The dual-token architecture of the earlier whitepaper — separating
permissionless operational participation from KYC-gated formal ownership —
remains a viable shape for ventures that need it, and the legal-wrapper
considerations that surrounded it (L.E., 2025) remain implementation
choices that can be plugged in per jurisdiction. Public-facing copy stages
these carefully: the wedge is execution and operating truth; the legal and
capital scaffolding is depth that exists for readers and operators who ask
for it, not a cold opening line.

---

## 7. The Recursive Capital Loop

The architecture compounds. The same substrate that gives a single company
its operating coherence becomes infrastructure that other companies build
on, and infrastructure that capital can read from. Five linked claims
describe the loop.

**Execution creates operating history.** A company running on aeqi
generates a machine-readable record of its work as a routine byproduct of
running. This is not telemetry added to the company; it is the form the
company takes.

**Operating history makes authority and accountability inspectable.** The
record exposes who did what under what authority. The opacity that has
historically made firms expensive to coordinate, audit, and trust is
replaced by an observable substrate.

**Inspectable authority makes treasury, governance, and ownership more
credible.** A vote that commits a budget against a role to fund a quest is
not a freestanding ritual; it is an event in the company's operating
history, linked to the work that follows from it.

**Credibility makes capital allocation more efficient.** Due diligence
shifts from reconstructing the firm from outside to reading the firm from
inside. Information asymmetries that previously priced into capital cost
shrink. Cross-jurisdictional, programmatic capital becomes available to
companies that previously could not access it.

**Capital funds more execution.** Capital allocated to credible companies
produces more operating history, which expands the substrate, which makes
the system more useful to the next company that adopts it.

The loop is recursive in the strong sense Katz and Shapiro (1985) described
for network goods: the value of the system to any individual participant
grows with the participation of others. A particular implementation of this
recursion — equity flowing from each company on the platform into a
protocol-aligned capital entity — is one specific mechanism explored at
length in the earlier paper (L.E., 2025) and remains available. The general
principle is independent of that specific mechanism: a runtime that
improves how other companies operate produces compounding system-wide
returns that no individual company on it can match. This is the leverage
shape that operating systems have over the applications running on them.
The highest-leverage company is the one whose existence improves how other
companies are created, operated, funded, governed, and owned.

The earlier work called this *programmable capitalism*. The naming
remains accurate. The reordering matters: programmable capitalism becomes
adoptable when its first sentence is operational rather than financial.
Founders need leverage before they need structure. The MVP sells
execution; the protocol compounds underneath.

---

## 8. Related Work

This paper builds on several traditions and positions itself between them.

**Foundations of decentralized coordination.** Nakamoto (2008) and Buterin
(2014) defined the platform on which on-chain organizations can exist.
Davidson, De Filippi, and Potts (2018) frame blockchains as an
institutional technology in the sense of new institutional economics —
this paper takes that framing as foundational and extends it from coins
and DAOs to the company itself.

**DAO theory and practice.** Wright (2021), Buterin (2017), Beck et al.
(2023), Hacker (2023), Ellinger et al. (2023), and the recent surveys
(CENTRUM Católica, 2024) document the practical limits of DAOs as
currently constructed. We share the diagnosis that legal ambiguity,
governance pathology, and incentive misalignment are systemic rather than
incidental. We diverge in prescription: rather than fixing DAOs in
isolation, we shift the unit of analysis from "decentralized organization"
to "programmable company" and let the legal, governance, and incentive
machinery be properties of that company.

**Institutional economics.** Coase (1937), Williamson (1975), and Jensen
and Meckling (1976) supply the conceptual vocabulary for understanding
why firms exist and where their costs accumulate. We adopt this vocabulary
and argue that the dominant transaction cost in contemporary venture
formation is not negotiation or enforcement in the abstract — it is the
cost of *reconstructing the firm from outside* for every counterparty,
auditor, and capital allocator who needs to read it.

**Mechanism design.** Hurwicz and Reiter (2006), Maskin (2008), and Nisan
and Ronen (2001) developed the theory of designing rules that yield
desired collective behaviors. The role-graph authority structure,
performance-anchored ownership mechanisms (where they apply), and
recursive capital flywheel are mechanism-design choices within the
framework. We use the theory; we do not propose new theorems.

**Network economics.** Katz and Shapiro (1985) describe the externalities
that make network goods compound. The recursive loop in Section 7 is an
application of this theory to operating infrastructure.

**Agent systems and tooling.** LangChain, AutoGen, CrewAI, and adjacent
frameworks have advanced what individual agents and small agent teams can
do. We treat them as labor frameworks and consume them where useful. The
contribution we add is the layer above: the company in which their work
takes place.

**Wallet, governance, and DAO infrastructure on chain.** Safe, Squads,
Realms, MetaDAO, and other on-chain primitives are reference points for
the components a TRUST composes (multisig, team treasury, governance,
futarchy). They are read-only references in the sense that we do not
depend on any of them as a runtime; the TRUST is our own primitive,
designed to integrate with the broader on-chain economy without becoming
a thin wrapper over one of these tools.

**Company-formation and management SaaS.** Stripe Atlas, Carta, Notion,
Linear, and similar tools have demonstrated that founders will adopt
software that reduces specific frictions. We treat the success of these
tools as evidence that the demand is real and the gap is in unification,
not in willingness.

---

## 9. Threat Model

A system that proposes to put execution, authority, treasury, governance,
and ownership inside one operating context inherits all of their risks at
once. We enumerate the principal categories.

**Over-automation.** Companies that delegate too much to agents risk
losing the human judgment that direction-setting requires. The
architectural mitigation is the principle that humans set direction;
agents execute. Operationally, this is enforced by role scope, by
quest-level human approvals on high-impact actions, and by treasury
gating. The cultural mitigation is the explicit positioning that aeqi is
not a replacement for the founder — it is leverage for the founder.

**Governance theater.** A company can perform on-chain governance rituals
without those rituals affecting operational reality. The substrate is
designed to make this expensive: governance outcomes propagate into the
role graph and the budgeting system, so a vote that does not produce an
operational change is visibly inert.

**Token-price-versus-value drift.** Programmable ownership instruments
can be priced by speculation rather than by operational performance.
Performance-anchored mechanisms (where they apply) mitigate but do not
eliminate this risk. We argue the underlying defense is operational
legibility: priced instruments diverge from value when value is
unobservable. Making value observable shrinks but does not close the gap.

**Custody and signer compromise.** A TRUST holds funds and authority on
chain. Compromised passkeys, social recovery flaws, or smart-account bugs
create direct loss vectors. The architectural mitigation is the
canonical wallet design (passkey-native smart accounts with timelocked,
constrained recovery via existing-signer veto), formal audit of the on-chain
programs, and the explicit principle that recovery should not require
operator custody of user funds.

**Regulatory shifts.** Both AI liability and on-chain securities regimes
are in active evolution across jurisdictions. The dual-token,
permissionless-operation / KYC-gated-ownership separation is one defense.
The legal scaffolding catalogued in the earlier paper (L.E., 2025) — IBC
wrappers, trust structures, jurisdictional graduation paths — remains an
available toolkit for ventures that need to expose specific compliance
surfaces.

**Model and provider risk.** Foundation-model deprecation, rate-limit
shifts, and provider outages can disrupt agent execution. Multi-provider
support, local fallback paths, and an explicit Inference API abstraction
mitigate this. The architectural principle is that the runtime is
provider-agnostic where it can be; cost and capability remain the
operator's choice.

**Coordination collapse at scale.** Composability between TRUSTs — a
company hiring agents from another company, funds investing in companies
in the same ecosystem, recursive capital flowing through partner entities —
introduces failure modes that single-entity governance does not face.
Standardizing the inter-company contract surface (the same blueprints,
modules, and authority semantics across TRUSTs) is the structural defense.

---

## 10. Conclusion

The bottleneck has moved. Capital is abundant. Foundation models are
abundant. The scarce thing is infrastructure that allows execution and
ownership to be programmable inside the same operating context, with the
operating truth in between that makes both credible.

A traditional company assembles itself out of documents, conversations,
and tools. A DAO ratifies decisions about an organization whose work lives
elsewhere. An agent framework manufactures labor that has no employer. A
SaaS company OS files away discrete pieces of the firm in disconnected
applications. None of these primitives is wrong. None of them is sufficient.

aeqi proposes a primitive that is. A TRUST is a programmable company: an
addressable entity with role-scoped authority, attached agents, durable
memory, on-chain treasury and ownership, and a runtime that turns intent
into work and work into operating history. Humans set direction. Agents
execute. Memory compounds. Authority, treasury, governance, and ownership
live in one operating context.

The earlier framing remains intact: programmable capitalism is the long
arc, and improvements to the default infrastructure for venture creation
have compounding system-wide effects greater than any individual startup
they enable. What changed is the entry point. Programmable companies are
the wedge; programmable capitalism is the consequence.

Startups fail or exit. Operating systems persist. The question is no
longer *if* programmable companies become the default substrate for the
agent economy. The question is what shape that substrate takes, and who
defines it.

aeqi is one answer.

---

## Acknowledgments

This paper supersedes the June 2025 *Protocol-Based Venture Operating
System for Programmable Capitalism* (L.E., 2025) as the canonical public
statement of the aeqi thesis. Much of the legal, governance, and capital
infrastructure detailed in that earlier work remains correct as
implementation-layer scaffolding and can be re-engaged when public
positioning makes it appropriate. The change is one of ordering: execution
first, operating truth as substrate, programmable ownership and capital
as the compounding result.

---

## References

Aznar, E. (2024). *Legal challenges and structures of Decentralised
Autonomous Organisations (DAOs)*. LegalCripto — Baes Blockchain Lab.

Beck, L., Müller-Bloch, C., & King, J. L. (2023). Governance in
Decentralized Autonomous Organizations: A Review and Research Agenda.
*ECIS 2023 Research Papers*.

Bommasani, R., et al. (2021). On the Opportunities and Risks of
Foundation Models. *Stanford HAI Center for Research on Foundation
Models*.

Buterin, V. (2014). Ethereum: A Next-Generation Smart Contract and
Decentralized Application Platform. *Ethereum Whitepaper*.

Buterin, V. (2017). *Notes on Blockchain Governance*.

CENTRUM Católica Graduate Business School. (2024). Issues and
Reflections on DAO: Governance Challenges and Solutions. *AIFT*.

Coase, R. H. (1937). The Nature of the Firm. *Economica*, 4(16),
386–405.

Congregado, E., Golpe, A. A., & Iglesias, J. (2021). Tokenomics and
blockchain. *PLoS ONE*, 16(8), e0256065.

Davidson, S., De Filippi, P., & Potts, J. (2018). Blockchains and the
economic institutions of capitalism. *Journal of Institutional
Economics*, 14(4), 639–658.

Ellinger, P., Mini, T., Gregory, R. W., & Dietz, L. (2023). Exploring
Decentralized Autonomous Organization (DAO) Governance: An integrative
literature review.

Guillaume, F. (2023). Decentralized Autonomous Organizations (DAOs) in
front of courts. In A. Perestrelo de Oliveira & A. Garcia (Eds.), *DAOs
Regulation: Principles and Perspectives for the Future* (pp. 135–168).
Mohr Siebeck.

Hacker, P. (2023). Corporate Governance for Complex Cryptocurrencies? A
Conceptual Framework. *Journal of Corporation Law*, Forthcoming.

Hurwicz, L., & Reiter, S. (2006). *Designing Economic Mechanisms*.
Cambridge University Press.

Jensen, M. C., & Meckling, W. H. (1976). Theory of the firm: Managerial
behavior, agency costs and ownership structure. *Journal of Financial
Economics*, 3(4), 305–360.

Katz, M. L., & Shapiro, C. (1985). Network Externalities, Competition,
and Compatibility. *The American Economic Review*, 75(3), 424–440.

Krutiy, E. (2025). Decentralized Autonomous Organizations (DAOs):
Challenges of Qualification and Choice of a Law Applicable. *Law Journal
of the Higher School of Economics*.

L.E. (2025). *A Protocol-Based Venture Operating System for
Programmable Capitalism*. aeqi.

Liu, Y., & Shang, R. (2022). Decentralized Autonomous Organizations:
Concept, Practice, and Challenges. *IEEE International Conference on
Blockchain*, 1–8.

Maskin, E. S. (2008). Mechanism design: How to implement social goals.
*American Economic Review*, 98(3), 567–576.

Nakamoto, S. (2008). *Bitcoin: A Peer-to-Peer Electronic Cash System*.

Nisan, N., & Ronen, A. (2001). Algorithmic Mechanism Design. *Games and
Economic Behavior*, 35(1–2), 166–196.

Williamson, O. E. (1975). *Markets and Hierarchies: Analysis and
Antitrust Implications*. Free Press.

Wright, A. (2021). The Rise of Decentralized Autonomous Organizations:
Opportunities and Challenges. *Stanford Journal of Blockchain Law &
Policy*.
