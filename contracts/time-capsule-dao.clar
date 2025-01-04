;; Time Capsule DAO Contract

(define-data-var admin principal tx-sender)

(define-map proposals uint
  {
    proposer: principal,
    description: (string-utf8 256),
    votes-for: uint,
    votes-against: uint,
    status: (string-ascii 10)
  }
)

(define-data-var proposal-count uint u0)

(define-public (create-proposal (description (string-utf8 256)))
  (let
    (
      (proposal-id (+ (var-get proposal-count) u1))
    )
    (map-set proposals proposal-id
      {
        proposer: tx-sender,
        description: description,
        votes-for: u0,
        votes-against: u0,
        status: "active"
      }
    )
    (var-set proposal-count proposal-id)
    (ok proposal-id)
  )
)

(define-public (vote-on-proposal (proposal-id uint) (vote bool))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) (err u404)))
    )
    (asserts! (is-eq (get status proposal) "active") (err u403))
    (map-set proposals proposal-id
      (merge proposal {
        votes-for: (if vote (+ (get votes-for proposal) u1) (get votes-for proposal)),
        votes-against: (if (not vote) (+ (get votes-against proposal) u1) (get votes-against proposal))
      })
    )
    (ok true)
  )
)

(define-public (execute-proposal (proposal-id uint))
  (let
    (
      (proposal (unwrap! (map-get? proposals proposal-id) (err u404)))
    )
    (asserts! (is-eq (get status proposal) "active") (err u403))
    (map-set proposals proposal-id
      (merge proposal {
        status: (if (> (get votes-for proposal) (get votes-against proposal)) "passed" "rejected")
      })
    )
    (ok true)
  )
)

(define-public (change-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (var-set admin new-admin)
    (ok true)
  )
)

(define-read-only (get-admin)
  (ok (var-get admin))
)

(define-read-only (get-proposal (proposal-id uint))
  (ok (unwrap! (map-get? proposals proposal-id) (err u404)))
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

