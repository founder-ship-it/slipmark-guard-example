# Slipmark + Codapult Guard: one gate, two signed verdicts

Two tools check every pull request here, independently:

- **[Codapult Guard](https://github.com/codapult/codapult-guard)** verifies the
  change against the repository's architecture policy, and signs a receipt
  covering the exact files it checked at the PR head.
- **[Slipmark](https://github.com/founder-ship-it/Slipmark)** records a reviewer's
  verdict bound to the SHA-256 of the files it reviewed, and signs it.

Each signs an in-toto Statement through Sigstore, from its own workflow on
`main`. One gate, `slipmark verify-bundle`, puts both in one Bundle and accepts
the PR only if:

- both are there;
- each is signed by the workflow the policy names for it;
- each still holds for the files at the PR head.

It reports back on the PR as the **Slipmark bundle gate** status.

## The pull requests

| PR | What changes | Expected |
|---|---|---|
| Add `withVat` | A documented, tested function | Gate passes: both verdicts hold |
| Add `roundUp` | A function with no doc comment or test | Gate refuses: the reviewer's verdict is `fail` |

These stay open as the demo. Don't merge them.

## How it fits together

1. `guard-trusted-pr-attestation.yml` is Guard's own trusted workflow,
   unchanged. It runs on `pull_request_target`, verifies the PR head against
   the policy on its base commit, and signs a Guard verification Statement
   ([predicate v1](https://github.com/codapult/codapult-guard/blob/main/docs/attestations/guard-verification-v1.md)).
2. `slipmark-trusted-pr.yml` runs when Guard finishes. It:
   - runs `scripts/doc-review.mjs` from `main` against the PR head. This is a
     stand-in for an AI reviewer: it reads files and never runs them;
   - signs that verdict with `slipmark attest --sign-format intoto`;
   - adds Guard's signed Statement with `slipmark export-intoto --format sigstore --include`;
   - checks the result with `slipmark verify-bundle`.
3. `.slipmark/policy.json` names the two predicate types and the one workflow
   allowed to sign each. The gate reads it from the PR's base commit, so a PR
   can't loosen it.

Nothing in either trusted workflow executes code from the pull request.

## What each verdict means

- **Guard:** one passing Guard run covered the whole file inventory at this
  exact commit. A Guard file subject is not a review of that file.
- **Slipmark:** this reviewer gave this verdict about these exact bytes. The
  verdict still counts after an unrelated commit; Guard's doesn't.

The gate needs both. Change any file either of them covered and it refuses.

## Running it in your own repository

- Guard's setup: [Guard's guide](https://github.com/codapult/codapult-guard/blob/main/docs/integrations/github-actions-attestation-example.md).
  It needs the repository variables `CODAPULT_GUARD_VERSION` and
  `CODAPULT_GUARD_COMMIT`, and the CI integrity contract in
  `.codapult/guard/rules.json`.
- Slipmark's gate: [Checking a combined Bundle](https://github.com/founder-ship-it/Slipmark/blob/main/docs/attestation.md#checking-a-combined-bundle).
- Signatures are made with public Sigstore, so this works for public
  repositories. Private repositories sign with GitHub's own Sigstore instance,
  which `verify-bundle` can't check yet.

## Licence

MIT. The two Guard workflows are copied from
[codapult/codapult-guard](https://github.com/codapult/codapult-guard) under its
MIT licence. See [NOTICE](NOTICE).
