# Infrastructure Mental Model

A blueprint for understanding where Corellia sits in the infrastructure stack,
how different platforms carve up that stack, and why Corellia makes the
infrastructure choices it does.

This document is meant to be read when you need to make an infra decision, onboard
a new engineer, or explain to a stakeholder why Corellia is "just" a control plane.

## The seven-layer stack

Modern cloud infrastructure is best understood as a layered stack, where each
layer abstracts the one below it. Corellia's application logic sits at the top;
everything underneath is either managed by a provider or (occasionally) by us.

```
+----------------------------------------------+
| 7. Application code (Hermes, Corellia API)   |
+----------------------------------------------+
| 6. Orchestration / deploy control            |
|    (Fly control plane, Kubernetes, Nomad)    |
+----------------------------------------------+
| 5. Container runtime                         |
|    (Docker, containerd)                      |
+----------------------------------------------+
| 4. Operating system                          |
|    (Linux distribution: Ubuntu, Alpine, Nix) |
+----------------------------------------------+
| 3. Virtualization                            |
|    (Firecracker, KVM, Xen)                   |
+----------------------------------------------+
| 2. Physical hardware                         |
|    (CPU, RAM, disk in a data center)         |
+----------------------------------------------+
| 1. Data center / facility                    |
+----------------------------------------------+
```

### What each layer does

**Layers 1-2 — Physical.** Real machines in real data centers. Almost never touched
directly; you rent them from a cloud provider.

**Layer 3 — Virtualization.** Splits one physical machine into multiple isolated
"virtual machines." Each VM appears to its software as its own computer. Classic
VMs (KVM, Xen) boot in seconds to minutes. **Firecracker** (used by Fly and AWS
Lambda) is a microVM that boots in ~125ms — fast enough to treat as ephemeral.
This is the primitive that makes per-agent isolated VMs economically viable.

**Layer 4 — Operating system.** The software environment inside the VM. Usually
Linux (Ubuntu, Alpine, Debian). **NixOS** is a specific Linux distribution where
the entire system configuration is defined declaratively in a flake file. Useful
for reproducibility and local/bare-metal deployments; not needed for MVP.

**Layer 5 — Container runtime.** Docker and its cousins. Containers are a lighter
form of isolation than VMs — a single process tree that sees only its own
filesystem, network, and process namespace. Containers share the host kernel, so
they are cheap to run many of, but isolation is weaker than full VMs.

**Layer 6 — Orchestration.** Answers the questions: *"How do I run N containers
across M machines? How do I restart them when they crash? How do I route traffic?
Where do secrets live?"* Kubernetes is the industry standard (powerful, complex).
Fly's control plane, AWS ECS, HashiCorp Nomad are alternatives. SkyPilot is a
higher-level layer that sits on top of multiple backends.

**Layer 7 — Application.** Your code. In Corellia's case: the control-plane API,
the UI, and the adapted agent harnesses (Hermes-as-deployed).

## How different platforms carve up the stack

| Platform | Handles layers | You handle | Good for |
|---|---|---|---|
| **Fly.io** | 1-6 | 7 (Dockerfile) | Many small services, per-instance isolation |
| **Railway / Render** | 1-6 | 7 | Dev-friendly web services |
| **AWS Fargate / ECS** | 1-6 | 7 | Enterprise AWS-native workloads |
| **Kubernetes (EKS/GKE/AKS)** | 1-5 | 6 + 7 | Large-scale, maximum flexibility |
| **NixOS on bare VM (Hetzner, DO)** | 1-3 | 4 + 5 + 6 + 7 | Reproducibility, bare-metal cost |
| **SkyPilot** | Spans 6 across many backends | 7 + YAML | Cross-cloud / GPU bursts |

Rule of thumb: **lower in the stack = more control + more work + cheaper raw
infra; higher = less control + less work + higher per-unit cost.**

## Key primitives worth knowing

### VM vs microVM vs container

- **VM** (KVM, Xen): full hardware virtualization, seconds to minutes to boot,
  strongest isolation, highest overhead.
- **microVM** (Firecracker): stripped-down hardware virtualization, ~125ms boot,
  near-VM isolation, near-container overhead. Fly uses these.
- **Container** (Docker): OS-level isolation via Linux namespaces and cgroups,
  ~1s startup, shares host kernel, weakest isolation. Dozens can run per host.

For a governance platform, VM or microVM isolation is preferable — a malicious
or buggy agent cannot escape into neighboring agents' state.

### Fly's App / Machine / Secret / Volume primitives

- **App**: a namespace owning a set of machines, a domain, secrets, and config.
  Roughly analogous to a Kubernetes namespace or a single service.
- **Machine**: a lightweight Firecracker microVM. One machine runs one container
  (one "process group" in Fly terms). Can be stopped/started and auto-sleep.
- **Secret**: key/value, scoped to the app. All machines in the app see the same
  secrets. This is the primary reason "one agent = one app" is our chosen model.
- **Volume**: persistent storage, scoped to a single machine.

### Docker image tags vs digests

- **Tag** (e.g., `:latest`, `:v0.3.2`) — human-readable, **mutable**. Can silently
  point to new content on the next push.
- **Digest** (e.g., `@sha256:a7f9...`) — content-addressed, **immutable**. Always
  refers to the exact same bytes.

Corellia pins Agent Templates by **digest**, not tag. Upgrading a template is an
explicit, audited action.

## Corellia's position in the stack

Corellia is a **layer-7 control plane**. It does not invent new orchestration,
containerization, or virtualization primitives. It orchestrates existing ones
and adds governance, fleet visibility, and a uniform harness interface on top.

### Deploy target abstraction

All infrastructure access is mediated by a `DeployTarget` interface. This is the
single most important architectural rule in the codebase:

- **MVP implements one deploy target: Fly.io.**
- **No Fly-specific code may leak outside the `FlyDeployTarget` module.**
- All other potential targets (AWS, SkyPilot, NixOS, local) are stubbed as
  concrete `DeployTarget` implementations that raise `NotImplemented`, not
  as UI buttons that do nothing.

This costs maybe a day of extra scaffolding in the MVP. It saves weeks when we
add the second target.

### Why Fly for v1

1. **Right level of abstraction.** We need to spawn isolated workloads with
   per-instance secrets and cheap idle cost. Fly's app+machine model maps to
   this directly; we don't have to invent it on top of raw VMs.
2. **Firecracker isolation.** Real hypervisor-level isolation per agent, not
   shared-kernel containers. Important for a governance/IAM pitch.
3. **Auto-stop/auto-start.** Idle agents sleep; wake in ~1s. Significant at
   the "250 employees x several agents each" scale.
4. **Clean per-app secrets.** Maps to "one agent = one app" with no custom
   multi-tenancy logic.
5. **Small API surface.** Machines API is one REST endpoint plus a few verbs.
   We do not want to learn Kubernetes during MVP.

### Why not [X] for v1

- **Kubernetes:** too much layer-6 work for a hackathon. Revisit only if we
  need cluster-level features Fly does not provide.
- **NixOS/bare metal:** excellent for reproducibility and local deploys, but
  layers 4-6 become our problem. Strong candidate for a later `DeployTarget`
  when the use case (local agents, compliance, bare-metal cost) justifies it.
- **SkyPilot:** great cross-cloud abstraction, but adds a dependency and a
  YAML layer for no MVP benefit. Natural fit as the underlying implementation
  of future multi-cloud `DeployTarget`s.
- **Serverless (Modal, Lambda-style):** cold starts and statelessness conflict
  with long-lived agent state. Not a fit for the personal-agent use case.

## The two questions to ask for any infra decision

1. **Is this decision reversible?** If yes (because the `DeployTarget`
   abstraction shields the rest of the code), pick the easiest option for
   today. If no, invest in making it reversible first.
2. **Does this decision differentiate the product?** If yes (fleet view, IAM,
   harness contract, audit), invest deeply. If no (specific VM provider,
   container runtime choice), pick whatever ships fastest.

Most infra decisions are layer-1-through-6 decisions, which means they fail
test 2, which means they should get the minimum viable attention.

## Related concepts from peer tools

Brief note on tools that live near Corellia's space, to avoid re-inventing
wheels:

- **SkyPilot** (layer 6, cross-cloud): "launch a YAML on any cloud." Close
  match for a future multi-backend `DeployTarget`.
- **BeeAI Agent Stack** (layer 7, framework-agnostic agent services):
  closest peer to Corellia's runtime; worth reading before finalizing the
  harness contract. Not a competitor at the governance/IAM layer.
- **LiteLLM / Portkey** (layer 7, model gateway): the likely implementation
  of Corellia's optional model-gateway in v2. Do not build from scratch.
- **AURA (Mezmo)** (layer 7, production Rust harness): reference for what
  a well-structured agent harness looks like — useful when drafting the
  harness contract.

## Strategic framing

Deployment is a commodity problem. Every cloud and framework solves it one way
or another. The real unsolved problem — and therefore where Corellia invests —
is **management, governance, access control, and fleet visibility across
heterogeneous agents**.

The practical implication: when faced with "should we build X at the infra
layer?", the default answer is **no, use an existing tool behind the
`DeployTarget` abstraction.** When faced with "should we build X at the
governance layer?", the default answer is **yes, that is the product.**
