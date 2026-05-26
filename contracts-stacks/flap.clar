;; Flap — Stacks/Clarity port (draft)
;; Stake-to-play arcade: escrow stake on startPlay, scorer reports, settlePlay
;; pays 2× on a win or routes the stake to the daily bounty pool.

(use-trait ft-trait .sip-010-trait.sip-010-trait)

(define-constant ERR-NOT-SCORER (err u400))
(define-constant ERR-ALREADY-SCORED (err u401))
(define-constant ERR-ZERO-STAKE (err u402))
(define-constant ERR-PLAY-NOT-OPEN (err u403))

(define-data-var owner principal tx-sender)
(define-data-var scorer principal tx-sender)
(define-data-var treasury principal tx-sender)
(define-data-var score-threshold uint u50)

(define-map plays
  uint
  {
    player: principal,
    stake: uint,
    score: uint,
    status: uint, ;; 0=open 1=scored 2=settled 3=cancelled
    day: uint,
  })

(define-map bounty-pool uint uint) ;; day -> pool size
(define-data-var next-play-id uint u0)

(define-public (start-play (stake uint))
  (let ((id (var-get next-play-id))
        (today (/ block-height u144))) ;; ~144 blocks ≈ 1 day on Stacks
    (asserts! (> stake u0) ERR-ZERO-STAKE)
    ;; TODO: SIP-010 transfer stake from tx-sender
    (map-set plays id
      { player: tx-sender, stake: stake, score: u0, status: u0, day: today })
    (var-set next-play-id (+ id u1))
    (ok id)))

(define-public (submit-score (play-id uint) (score uint))
  (let ((play (map-get? plays play-id)))
    (asserts! (is-eq tx-sender (var-get scorer)) ERR-NOT-SCORER)
    (asserts! (is-some play) ERR-PLAY-NOT-OPEN)
    (let ((p (unwrap! play ERR-PLAY-NOT-OPEN)))
      (asserts! (is-eq (get status p) u0) ERR-ALREADY-SCORED)
      (map-set plays play-id (merge p { score: score, status: u1 }))
      (ok true))))

;; TODO: settle-play — pay 2x on >threshold, route to bounty-pool otherwise
;; TODO: claim-daily-bounty — split pool among day's stakers proportional to stake
;; TODO: cancel-play — escape hatch when scorer never reports

(define-read-only (get-play (id uint))
  (map-get? plays id))

(define-read-only (today)
  (/ block-height u144))
