# HRC-Infrastructure — Notes

> Repo: `github.com/Cybersenz-Inc/HRC-infra` (private, SSH access via snehashis key)
> Status as of 2026-06-06: repo exists but is **empty** — Arpit has not pushed yet.

---

## Context

Arpit (+91 91066 80069) is migrating the HRC Azure infrastructure to Terraform.

**Plan (from chat, 2026-06-03):**
1. Build everything in a new `HRC-dev` resource group
2. Destroy the old `HRC` resource group
3. Rename `HRC-dev` → `HRC`

**Key constraint from Rajveer (2026-06-03):**
GPT-5 family models are only available in **Azure East US 2** — that region must be
preserved for the Azure OpenAI resource, same as the current `HRC` RG.

---

## Access granted (arpit@securecrm.ai)

| Scope | Role |
|-------|------|
| RG `HRC-dev-tfstate` | Storage Blob Data Contributor |
| RG `HRC-dev` | User Access Administrator |
| RG `HRC-dev` | Key Vault Administrator |
| Subscription level | Contributor |

## Access granted (snehashis — 2026-06-08, KT call)

| Scope | Role |
|-------|------|
| RG `HRC` (current production VM) | Contributor |
| RG `HRC-dev` (Arpit's ACA migration) | Contributor |

Granted live during the KT call (after secure-CRM invite looping issues, the
**Gmail** account is what finally worked). Portal: `portal.azure.com` → View all
resources. Roles may be tightened as production nears.

> **RG roles:** `HRC` = the current VM/production stack; `HRC-dev` = Arpit's
> **4× Azure Container Apps** migration target (managed PostgreSQL + Redis).

---

## Impact on HRC-Voice-Agents testing

The migration will affect the **live system** being tested (VM at `4.149.74.135`,
Key Vault `outboundhrc.vault.azure.net`, etc.). Coordinate with Arpit on timing
so the migration does not run during live Aetna call testing.

When the migration completes, confirm:
- New VM IP / SSH details
- Key Vault URL still resolves
- Azure OpenAI deployment name. Code evidence points to **GPT-5.x**
  (`extraction/client.py` tuned with `max_completion_tokens=16000`), though the
  voice-agent README says GPT-4.1 and Rajveer noted GPT-5 family is East US 2 only.
  Confirm the actual `AZURE_OPENAI_DEPLOYMENT` value with Rajveer.

---

## Open items

- [ ] Arpit to push Terraform code to `HRC-infra` repo
- [ ] Confirm migration timing with Arpit before any live Aetna test calls
- [ ] After migration: re-verify `hrc-outbound.cybersenz.com` and SSH access

---

## References

- Voice agent notes: `r&d/hrc-voice/ARCHITECTURE.md`
- Testing plan: `r&d/hrc-voice/TASK-01-aetna-ivr-live-testing.md`
- Chat log: `r&d/hrc-voice/project-discussion.md`
