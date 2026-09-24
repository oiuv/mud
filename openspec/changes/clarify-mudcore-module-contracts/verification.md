# Verification Log

## Baseline — 2026-09-23

- Framework: `4df084e`, `2.0.0-dev`; no framework changes before the original baseline runs.
- Command: `node mudcore/tests/run.mjs bin/driver.exe` (Node.js v24.21.0).
- Default: 157 programs, 1288 checks, 0 failures; overrides: 157 programs, 1292 checks, 0 failures. Both driver processes and the runner exited 0; Node verified loopback network traffic and Telnet sessions.
- Logs: `C:/Users/oiuv/AppData/Local/Temp/mudcore-test-ifsFui/driver-output.txt` and `C:/Users/oiuv/AppData/Local/Temp/mudcore-test-0zpngA/driver-output.txt` (local temporary artifacts, not committed).
- An earlier attempt with `fluffos/build-msys2/src/driver.exe` printed 1288 passing checks but exited 3 after shutdown cleanup. This is **not a passing run**; log: `C:/Users/oiuv/AppData/Local/Temp/mudcore-test-Nh7Phr/driver-output.txt`. No driver code/build changes are included; subsequent acceptance uses the existing `bin/driver.exe`.
- Existing TLS hostname limitation remains: a trusted wrong-hostname certificate is accepted by the local driver. No new claim of complete HTTPS identity verification.
- No real MUD, minimud, MyMud, player data or remote services were used.
- Acceptance driver reports `fluffos 20260729-19ffcc7a-6cf257ce (Microsoft Windows)`; the failed build-directory driver reports `fluffos 20260820-dd2a3a14-2c272875`.
- Added pre-refactor dispatcher boundary tests and real Telnet invalid-name/gender tests. Against unchanged production source: default 1306 / overrides 1310 checks, no failures, runner exit 0. Logs: `mudcore-test-UEUmsQ` and `mudcore-test-0SBOUM` under the same temporary root. Both changed LPC fixtures passed formatter and `--check`.

## Implementation checks

- After command/parser and USER_BASE changes: default 1307 / overrides 1311, 158 programs; both passed (temporary logs `mudcore-test-XXhSao`, `mudcore-test-r8ZvtA`).
- After character policy and host diagnostics: default 1308 / overrides 1312, 159 programs; both passed (logs `mudcore-test-Oijabg`, `mudcore-test-HXtkdb`).
- `node mudcore/tests/contracts.mjs bin/driver.exe`: minimal 38 / custom 39 LPC checks, both passed, process exit 0. Node also asserted actual registration, denied UID, custom/no gender, actor/arguments, movement, absence of RPG fields, save/restore, reconnect and one-time creation hooks. Logs: `mudcore-contract-VpWnA5`, `mudcore-contract-knLs0S`.
- The first contract run exposed a fixture assertion mismatch (an unset counter was JSON null). Corrected only the fixture status encoding to emit zero; no production fallback or test-success override was introduced.
- All 26 LPC/header files present at that checkpoint passed formatter and `--check`; final verification must include subsequent edits.

## Documentation and review

- Framework documentation now carries the architecture and contracts independently of this planning directory: `mudcore/docs/architecture.md`, `module-contracts.md`, integration and API manuals, contributor rules, test guide and unreleased changelog. Version remains `2.0.0-dev`.
- Checked 154 local Markdown link targets in the 14 changed/new guide files; all exist. The contract matrix covers all 31 entries in `docs/inherit.md`, plus the separately documented TUI group and Intermud daemon.
- Compared production diffs with the baseline: no changes to `living.c`, `user.c`, existing save fields, HTTP/Socket/TLS/DB/external/Intermud implementations or default master authorization. Production edits are the command/parser boundary, three optional collaborator checks in MOVE, character policy extraction, two new components and their macros.
- Public `nomask` command signatures, authentication ownership, identity export checks and connection transition checks remain in place. Failed character initialization is caught for object/name cleanup and then rethrown; this is not a new transactional storage guarantee.
- Independent final negative-path run: minimal 47 / custom 48 checks, exit 0, logs `mudcore-contract-L6qCBJ` / `mudcore-contract-Tbw5ed`. Added a real authenticated registration whose CHAR_D initializer throws; verified connection closes before activation, exception propagates once, no inactive player clone remains, temporary name mapping is removed, and LOGIN_D remains Root. All six default diagnostic method sources are now asserted.
- All 26 changed LPC/header files passed formatter and `--check` after these additions; JavaScript syntax checks passed for the three changed/new test entry files.

## Capability scenario traceability

Paths below are relative to `mudcore/`. Tests use actual production components; the dispatcher boundary fixture includes the production `command.c` rather than a copied implementation. Communication and persistence assertions are separately performed through real driver sessions.

| Capability / scenario | Verification evidence |
| --- | --- |
| module-contracts: standalone contributor integration | `docs/architecture.md`, `module-contracts.md`, `integration.md`; matrix/index and 154-link checks |
| existing host keeps defaults | default/overrides full suites; unchanged complete inheritance and fields in Git diff |
| host property override | full overrides; contracts `_DBASE` returns marker 42 and `_USER_BASE` marker 73 after creation/restore/reconnect |
| physically absent unselected modules | `tests/contracts.mjs` exclusion filter + absence assertions; real minimal registration/commands/move/save/reconnect |
| movement without GMCP | minimal excludes `user_gmcp.c`; real move/automatic look; `finish()` verifies no method |
| movement with GMCP | custom retains component; movement count at least 3; `contract gmcpfail` checks error propagation |
| generic capability / validation boundaries | unchanged generic implementations; full network/SQLite/TUI/Intermud suites; temp-only runner configuration and docs limitations |
| command-pipeline: default action short circuit | `tests/lpc/command_baseline.lpc::run()` recorded order, actor and arguments; established before refactor |
| no accepting stage / failure text | same baseline fixture tests parser 0 and string failure plus argument-free input |
| host order / single-stage overrides | `tests/contracts/lpc/master.lpc::commandTests()` with `command_hooks.lpc` |
| invalid stage configuration before activation | unknown, duplicate and disabled parser reject with COMMAND error, neither driver living nor temp flag set |
| action-only host omits services | services physically absent; real Telnet commands/movement; `finish()` checks none loaded |
| enabled service failure | hook throws and stops; `service_command.lpc` selected missing EMOTE_D surfaces error |
| parser disabled | compile option 0; actual LOGIN_D loads without VERB_D; real action-only sessions |
| parser requested but unavailable | selected parser rejected in disabled configuration; absent-efun references guarded in code, **no actual trimmed-driver result claimed** |
| character-creation-policy: original default | default/overrides real Telnet invalid ASCII name, valid Chinese name, invalid gender and original m input |
| custom name and gender | real custom session accepts Traveler and case-insensitive PILOT; saved value is pilot-role |
| omitted gender | real minimal session has no gender prompt and no gender field after restore/reconnect |
| invalid input/configuration | both contract sessions retry rejected names; custom retries gender; `loginTests()` rejects malformed, duplicate and conflicting options before creation; initializer-failure session cleans objects/name mapping |
| unauthenticated creation / takeover | inherited wrappers cannot grant authentication; make_body/enter_world/reconnect refusal tests plus original full security regressions |
| host denies UID | real blockedbyhost registration refused; service identity restored and only successful player clone remains |
| non-RPG initialization once | Node STATE assertions: no exp/lv/hp, init_count stays 1; setup_count 1 on reconnect, 2 on restored login |
| host-policy-diagnostics: default master | `policyTests()` asserts all six method sources and three permissive-default warnings |
| partial override | valid_read host-defined, valid_write framework-default |
| unknown source | empty object yields unknown and six warnings; invalid argument rejected |
| inspection without authority/side effects | policy counters unchanged, permissive custom apply not called, LPC Socket attempts forbidden; source only calls efun function_exists for metadata |
| permissive host override is not security certification | custom valid_read returns 1 unconditionally yet only classified by source; notice explicitly disclaims security audit and shadows |

## Final integrated run — 2026-09-24

- Command: `node mudcore/tests/run.mjs bin/driver.exe`, Node.js v24.21.0, driver `fluffos 20260729-19ffcc7a-6cf257ce (Microsoft Windows)`; framework changes against `4df084e`, still `2.0.0-dev`.
- default: 159 programs, 1308 checks, 0 failures; overrides: 159 programs, 1312 checks, 0 failures; minimal: 47 checks, 0 failures; custom: 48 checks, 0 failures. All driver exits and the combined runner exit were 0, with Node communication/state assertions and the final `All four mudcore suites passed` message.
- Logs, each containing `driver-output.txt`, under `C:/Users/oiuv/AppData/Local/Temp/`: `mudcore-test-wfAUbG`, `mudcore-test-zIPNA0`, `mudcore-contract-iUsqMb`, `mudcore-contract-aTHOE7`.
- Formatter and `--check` covered all 26 modified/new LPC/header files. JS syntax checks passed. OpenSpec strict validation and parent/submodule `git diff --check` passed. No claim that summed assertions are unique business scenarios or a coverage percentage.

## Host compilation — 2026-09-24

- User-reported validation in the actual old MUD: `updateall /` completed with **10960 files successfully compiled**. The user supplied the completion output; this was not rerun by the agent.
- This adds actual-host full-compilation evidence, not a claim that all gameplay, login, persistence or reconnect paths were exercised in that host.
- minimud and MyMud remain untested. The user's expectation that minimud should work is not recorded as a test pass.

## Acceptance limitations

- Framework implementation was committed locally as `b036dacd512471ffd1ec85ed43d01ce155a50b66` (`feat: 完善模块契约与可选玩家组合`). Parent commit scope is the corresponding gitlink and this change's planning/verification artifacts; the locally modified runtime data files `data/e2c_dict.o` and `data/emoted.o` are excluded and preserved.

- Automated runtime acceptance used isolated hosts and no real player data. The old MUD has user-reported compilation acceptance only; real-host runtime acceptance and minimud/MyMud acceptance remain outstanding. No driver rebuild or actual parser-trimmed build test.
- Existing TLS hostname-verification limitation remains. Real remote service/database deployments and external executable execution are not covered by this change.
- No storage transaction/schema migration, automatic hot switching, version release, push or OpenSpec archive is performed. Local commits and the parent submodule-pointer update were separately authorized by the user on 2026-09-24.
