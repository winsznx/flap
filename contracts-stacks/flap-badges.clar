;; flap-badges — podium + participation + streak NFTs for the daily bounty.
;; All three mint paths are permissionless; the contract simply mints based
;; on the parameters provided.

(define-non-fungible-token flap-badge uint)

(define-constant ERR-NOT-EARNED (err u600))
(define-constant ERR-ALREADY-MINTED (err u601))
(define-constant ERR-NOT-OWNER (err u602))

(define-data-var owner principal tx-sender)
(define-data-var base-uri (string-ascii 96) "https://flap.timjosh507.workers.dev/api/badges/")
(define-data-var next-token-id uint u0)

(define-map minted { user: principal, kind: (string-ascii 16) } bool)

(define-public (claim-podium-badge (season uint) (rank uint))
  (let ((id (var-get next-token-id)))
    (asserts! (> rank u0) ERR-NOT-EARNED)
    (asserts! (is-none (map-get? minted { user: tx-sender, kind: "podium" })) ERR-ALREADY-MINTED)
    (try! (nft-mint? flap-badge id tx-sender))
    (map-set minted { user: tx-sender, kind: "podium" } true)
    (var-set next-token-id (+ id u1))
    (print { event: "claimed", id: id, kind: "podium", season: season, rank: rank })
    (ok id)))

(define-public (claim-participation-badge (season uint))
  (let ((id (var-get next-token-id)))
    (asserts! (is-none (map-get? minted { user: tx-sender, kind: "participation" })) ERR-ALREADY-MINTED)
    (try! (nft-mint? flap-badge id tx-sender))
    (map-set minted { user: tx-sender, kind: "participation" } true)
    (var-set next-token-id (+ id u1))
    (print { event: "claimed", id: id, kind: "participation", season: season })
    (ok id)))

(define-public (claim-streak-badge (streak-length uint))
  (let ((id (var-get next-token-id)))
    (asserts! (>= streak-length u7) ERR-NOT-EARNED)
    (asserts! (is-none (map-get? minted { user: tx-sender, kind: "streak" })) ERR-ALREADY-MINTED)
    (try! (nft-mint? flap-badge id tx-sender))
    (map-set minted { user: tx-sender, kind: "streak" } true)
    (var-set next-token-id (+ id u1))
    (print { event: "claimed", id: id, kind: "streak", length: streak-length })
    (ok id)))

(define-public (set-base-uri (new-uri (string-ascii 96)))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (var-set base-uri new-uri)
    (ok true)))

(define-read-only (get-token-uri (id uint))
  (ok (some (var-get base-uri))))
