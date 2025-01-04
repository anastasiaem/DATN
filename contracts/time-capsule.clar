;; Time Capsule Contract

(define-data-var capsule-count uint u0)

(define-map capsules uint
  {
    owner: principal,
    data: (string-utf8 1024),
    release-height: uint
  }
)

(define-non-fungible-token time-capsule uint)

(define-public (create-capsule (data (string-utf8 1024)) (release-height uint))
  (let
    (
      (capsule-id (+ (var-get capsule-count) u1))
    )
    (try! (nft-mint? time-capsule capsule-id tx-sender))
    (map-set capsules capsule-id
      {
        owner: tx-sender,
        data: data,
        release-height: release-height
      }
    )
    (var-set capsule-count capsule-id)
    (ok capsule-id)
  )
)

(define-public (transfer-capsule (capsule-id uint) (recipient principal))
  (let
    (
      (owner (unwrap! (nft-get-owner? time-capsule capsule-id) (err u404)))
    )
    (asserts! (is-eq tx-sender owner) (err u403))
    (try! (nft-transfer? time-capsule capsule-id tx-sender recipient))
    (ok true)
  )
)

(define-read-only (get-capsule (capsule-id uint))
  (match (map-get? capsules capsule-id)
    capsule (ok capsule)
    (err u404)
  )
)

(define-read-only (get-capsule-count)
  (ok (var-get capsule-count))
)
