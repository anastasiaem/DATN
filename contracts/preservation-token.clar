;; Preservation Token Contract

(define-fungible-token preservation-token)

(define-public (mint (amount uint) (recipient principal))
  (ft-mint? preservation-token amount recipient)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (ft-transfer? preservation-token amount sender recipient)
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance preservation-token account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply preservation-token))
)

