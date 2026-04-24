import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Schecter', () => {
  it('W10052743 = World Korea 2010', () => {
    const r = matchSerial('W10052743', 'Schecter');
    expect(r).not.toBeNull();
    expect(r!.decodedYear).toBe(2010);
    expect(r!.brandFormat).toBe('schecter_factory');
    expect(r!.confidenceTier).toBe('high');
  });

  it('IW18012345 = Indonesia World 2018', () => {
    const r = matchSerial('IW18012345', 'Schecter');
    expect(r!.decodedYear).toBe(2018);
    expect(r!.brandFormat).toBe('schecter_factory');
  });

  it('IC12123456 = Cort Indonesia 2012', () => {
    const r = matchSerial('IC12123456', 'Schecter');
    expect(r!.decodedYear).toBe(2012);
  });

  it('0236758 = 2002 no-prefix', () => {
    const r = matchSerial('0236758', 'Schecter');
    expect(r!.decodedYear).toBe(2002);
    expect(r!.brandFormat).toBe('schecter_numeric');
  });

  it('year outside 00-29 rejected', () => {
    expect(matchSerial('W85012345', 'Schecter')).toBeNull();
  });
});
