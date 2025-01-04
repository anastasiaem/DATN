import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type UIntCV = number;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  balances: new Map<Principal, number>(),
  totalSupply: 0,
};

function mint(amount: number, recipient: Principal): Response<boolean, number> {
  const currentBalance = mockContractCalls.balances.get(recipient) || 0;
  mockContractCalls.balances.set(recipient, currentBalance + amount);
  mockContractCalls.totalSupply += amount;
  return { ok: true };
}

function transfer(amount: number, sender: Principal, recipient: Principal): Response<boolean, number> {
  const senderBalance = mockContractCalls.balances.get(sender) || 0;
  if (senderBalance < amount) return { err: 1 };
  
  mockContractCalls.balances.set(sender, senderBalance - amount);
  const recipientBalance = mockContractCalls.balances.get(recipient) || 0;
  mockContractCalls.balances.set(recipient, recipientBalance + amount);
  return { ok: true };
}

function getBalance(account: Principal): Response<number, never> {
  return { ok: mockContractCalls.balances.get(account) || 0 };
}

function getTotalSupply(): Response<number, never> {
  return { ok: mockContractCalls.totalSupply };
}

describe('Preservation Token Contract', () => {
  beforeEach(() => {
    mockContractCalls.balances.clear();
    mockContractCalls.totalSupply = 0;
  });
  
  it('should mint tokens', () => {
    const result = mint(1000, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(getBalance('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toEqual({ ok: 1000 });
    expect(getTotalSupply()).toEqual({ ok: 1000 });
  });
  
  it('should transfer tokens', () => {
    mint(1000, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const result = transfer(500, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(getBalance('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toEqual({ ok: 500 });
    expect(getBalance('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toEqual({ ok: 500 });
  });
  
  it('should fail to transfer more tokens than available', () => {
    mint(1000, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const result = transfer(1500, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 1 });
  });
  
  it('should return correct total supply', () => {
    mint(1000, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    mint(500, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(getTotalSupply()).toEqual({ ok: 1500 });
  });
});
