# ADR-SHARED-0012: Observability with the Grafana stack

- Status: Accepted (Grafana stack) / Proposed (components)
- Date: 2026-11-03
- Deciders: Owner, Architect
- Supersedes / Superseded by: —

## Context
CuriosityLab needs metrics, logs and traces for every deployable, correlated by trace ID, so one person can troubleshoot it. The whole platform, including observability, must fit on `k3s-node` (4 vCPU / 16 GB, ~3.2 GB already used). Nothing is installed yet. Spring Boot 4 supports OpenTelemetry.

## Decision Drivers
- Metrics, logs and traces in one UI with correlation.
- Low memory and CPU cost on one shared node.
- Vendor-neutral instrumentation (OpenTelemetry).
- Teachable as one coherent stack.

## Considered Options
1. Grafana stack: Grafana, Prometheus, Loki, Tempo, Grafana Alloy (chosen).
2. ELK (Elasticsearch, Logstash, Kibana).
3. kube-prometheus-stack plus separate logging and tracing.

## Decision
Use option 1 (Accepted). Proposed components and modes:
- Prometheus for metrics (Micrometer endpoint scraped).
- Loki in single-binary mode for logs.
- Tempo in monolithic mode for traces.
- Grafana Alloy as the single collector: Pod logs (JSON on stdout) and OTLP traces.
- Applications use the Spring Boot 4 OpenTelemetry support; trace ID in every log line.
- Everything in namespace `observability`; total budget ~2.5 GB memory.

Rejected options:
- ELK: Elasticsearch needs a large JVM heap; too heavy for the node.
- kube-prometheus-stack: more components (Alertmanager, node exporter, operator) than needed; heavier than a minimal Prometheus.

Elasticsearch or OpenSearch may still appear later as a search feature for products, not for logging.

## Consequences
### Positive
- One UI for all signals; logs to traces by trace ID.
- Fits the resource budget.
### Negative / Trade-offs
- Single-binary and monolithic modes do not scale out; acceptable for a lab.
- Observability shares the node it observes: a node outage loses both.
- Short retention to stay within disk and memory.
### Follow-up actions
- Write the Helm values and retention per component; verify modes and chart names against current Grafana docs.
- Verify Spring Boot 4 OpenTelemetry starter and properties against current docs.
- Dashboards and alerts (including incomplete event publications).

## Compliance / Verification
Each deployable shows metrics, logs and traces in Grafana in the lab; log review shows no passwords, tokens, session IDs or secret values; memory usage of `observability` stays within ~2.5 GB.

## Related
- PRD: — (module PRD not written yet)
- Architecture: Shared architecture: §10.1, §10.3, §12
- ADRs: [ADR-SHARED-0008](0008-event-driven-integration-with-jdbc-event-publication-registry.md), [ADR-SHARED-0011](0011-kubernetes-namespaces.md)
