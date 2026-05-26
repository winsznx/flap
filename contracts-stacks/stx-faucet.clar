;; stx-faucet — permissionless STX drip for testnet/mainnet onboarding.
;; Anyone can claim once per cooldown window. No owner gating except for
;; the rotateable maintainer who can top up + adjust amounts.

(define-constant ERR-TOO-SOON (err u500))
(define-constant ERR-EMPTY (err u501))
(define-constant ERR-NOT-MAINTAINER (err u502))
(define-constant ERR-AMOUNT-TOO-LOW (err u503))

(define-data-var maintainer principal tx-sender)
(define-data-var claim-amount uint u1000000) ;; 1 STX in micro-stx
(define-data-var cooldown-blocks uint u36) ;; ~6 hours at 10-min blocks
(define-data-var min-claim uint u100000) ;; 0.1 STX floor

(define-map last-claim principal uint)
(define-data-var total-claims uint u0)

(define-public (claim)
  (let ((last (default-to u0 (map-get? last-claim tx-sender)))
        (amount (var-get claim-amount))
        (next-allowed (+ last (var-get cooldown-blocks))))
    (asserts! (or (is-eq last u0) (>= block-height next-allowed)) ERR-TOO-SOON)
    (asserts! (>= (stx-get-balance (as-contract tx-sender)) amount) ERR-EMPTY)
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (map-set last-claim tx-sender block-height)
    (var-set total-claims (+ (var-get total-claims) u1))
    (print { event: "claimed", who: tx-sender, amount: amount })
    (ok amount)))

(define-public (fund)
  (begin
    (print { event: "funded", from: tx-sender })
    (ok true)))

(define-public (set-amount (new-amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get maintainer)) ERR-NOT-MAINTAINER)
    (asserts! (>= new-amount (var-get min-claim)) ERR-AMOUNT-TOO-LOW)
    (var-set claim-amount new-amount)
    (ok true)))

(define-public (set-cooldown (blocks uint))
  (begin
    (asserts! (is-eq tx-sender (var-get maintainer)) ERR-NOT-MAINTAINER)
    (var-set cooldown-blocks blocks)
    (ok true)))

(define-public (transfer-maintainer (next principal))
  (begin
    (asserts! (is-eq tx-sender (var-get maintainer)) ERR-NOT-MAINTAINER)
    (var-set maintainer next)
    (ok true)))

(define-read-only (next-claim-at (who principal))
  (let ((last (default-to u0 (map-get? last-claim who))))
    (if (is-eq last u0) u0 (+ last (var-get cooldown-blocks)))))

(define-read-only (info)
  { claim-amount: (var-get claim-amount),
    cooldown-blocks: (var-get cooldown-blocks),
    min-claim: (var-get min-claim),
    total-claims: (var-get total-claims),
    pool: (stx-get-balance (as-contract tx-sender)) })
