;; flap-hop — permissionless daily hop counter. Mirrors dailyHop() on the
;; EVM build: streak increments while cooldown is met within grace, resets
;; otherwise. Used by the client to award daily hop credits.

(define-constant ERR-TOO-SOON (err u900))

(define-data-var cooldown-blocks uint u126) ;; ~21h
(define-data-var grace-blocks uint u36) ;; ~6h grace

(define-map last-hop principal uint)
(define-map hop-run principal uint)
(define-map hop-credits principal uint)

(define-public (daily-hop)
  (let ((last (default-to u0 (map-get? last-hop tx-sender)))
        (run (default-to u0 (map-get? hop-run tx-sender)))
        (next-allowed (+ last (var-get cooldown-blocks)))
        (grace-end (+ last (+ (var-get cooldown-blocks) (var-get grace-blocks)))))
    (asserts! (or (is-eq last u0) (>= block-height next-allowed)) ERR-TOO-SOON)
    (let ((next-run (if (or (is-eq last u0) (> block-height grace-end)) u1 (+ run u1))))
      (let ((reward (if (is-eq (mod next-run u30) u0) u20
                      (if (is-eq (mod next-run u7) u0) u5 u1))))
        (map-set last-hop tx-sender block-height)
        (map-set hop-run tx-sender next-run)
        (map-set hop-credits tx-sender (+ (default-to u0 (map-get? hop-credits tx-sender)) reward))
        (print { event: "hopped", who: tx-sender, run: next-run, reward: reward })
        (ok next-run)))))

(define-read-only (current-streak (who principal))
  (default-to u0 (map-get? hop-run who)))

(define-read-only (credits-of (who principal))
  (default-to u0 (map-get? hop-credits who)))
