import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type UIntCV = number;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  capsules: new Map<number, { owner: Principal; data: string; releaseHeight: number }>(),
  nftOwners: new Map<number, Principal>(),
  capsuleCount: 0,
};

function createCapsule(data: string, releaseHeight: number): Response<number, never> {
  const capsuleId = ++mockContractCalls.capsuleCount;
  mockContractCalls.capsules.set(capsuleId, {
    owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    data,
    releaseHeight,
  });
  mockContractCalls.nftOwners.set(capsuleId, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
  return { ok: capsuleId };
}

function transferCapsule(capsuleId: number, recipient: Principal): Response<boolean, number> {
  const capsule = mockContractCalls.capsules.get(capsuleId);
  if (!capsule) return { err: 404 };
  if (mockContractCalls.nftOwners.get(capsuleId) !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') return { err: 403 };
  
  mockContractCalls.nftOwners.set(capsuleId, recipient);
  return { ok: true };
}

function getCapsule(capsuleId: number): Response<{ owner: Principal; data: string; releaseHeight: number }, number> {
  const capsule = mockContractCalls.capsules.get(capsuleId);
  if (!capsule) return { err: 404 };
  return { ok: capsule };
}

describe('Time Capsule Contract', () => {
  beforeEach(() => {
    mockContractCalls.capsules.clear();
    mockContractCalls.nftOwners.clear();
    mockContractCalls.capsuleCount = 0;
  });
  
  it('should create a new capsule', () => {
    const result = createCapsule('Test data', 100000);
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.capsules.size).toBe(1);
    expect(mockContractCalls.nftOwners.size).toBe(1);
  });
  
  it('should transfer a capsule', () => {
    createCapsule('Test data', 100000);
    const result = transferCapsule(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(mockContractCalls.nftOwners.get(1)).toBe('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
  });
  
  it('should get a capsule', () => {
    createCapsule('Test data', 100000);
    const result = getCapsule(1);
    expect(result).toEqual({
      ok: {
        owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        data: 'Test data',
        releaseHeight: 100000,
      },
    });
  });
  
  it('should fail to transfer a non-existent capsule', () => {
    const result = transferCapsule(999, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 404 });
  });
});
