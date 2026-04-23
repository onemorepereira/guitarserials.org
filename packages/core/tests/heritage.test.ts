import { describe, expect, it } from 'vitest';
import { matchSerial } from '../src/index.js';

describe('Heritage serials', () => {
  it('single letter B = 1985', () => {
    const r = matchSerial('B12345', 'Heritage');
    expect(r!.decodedYear).toBe(1985);
    expect(r!.brandFormat).toBe('heritage_single');
  });

  it('single letter Z = 2009', () => {
    const r = matchSerial('Z12345', 'Heritage');
    expect(r!.decodedYear).toBe(2009);
    expect(r!.brandFormat).toBe('heritage_single');
  });

  it('single letter H = 1991', () => {
    const r = matchSerial('H12345', 'Heritage');
    expect(r!.decodedYear).toBe(1991);
  });

  it('double letter AA = 2010', () => {
    const r = matchSerial('AA12345', 'Heritage');
    expect(r!.decodedYear).toBe(2010);
    expect(r!.brandFormat).toBe('heritage_double');
  });

  it('double letter AB = 2011', () => {
    const r = matchSerial('AB12345', 'Heritage');
    expect(r!.decodedYear).toBe(2011);
    expect(r!.brandFormat).toBe('heritage_double');
  });

  it('double letter AF = 2015', () => {
    const r = matchSerial('AF09403', 'Heritage');
    expect(r!.decodedYear).toBe(2015);
    expect(r!.brandFormat).toBe('heritage_double');
  });

  it('double letter AG = 2016', () => {
    const r = matchSerial('AG05102', 'Heritage');
    expect(r!.decodedYear).toBe(2016);
  });

  it('double letter AH = 2017', () => {
    const r = matchSerial('AH01609', 'Heritage');
    expect(r!.decodedYear).toBe(2017);
  });

  it('double letter AI = 2018', () => {
    const r = matchSerial('AI00001', 'Heritage');
    expect(r!.decodedYear).toBe(2018);
  });

  it('double letter AJ = 2019', () => {
    const r = matchSerial('AJ32413', 'Heritage');
    expect(r!.decodedYear).toBe(2019);
  });

  it('double letter AM = 2022', () => {
    const r = matchSerial('AM12345', 'Heritage');
    expect(r!.decodedYear).toBe(2022);
  });

  it('double letter AP = 2025', () => {
    const r = matchSerial('AP00042', 'Heritage');
    expect(r!.decodedYear).toBe(2025);
  });

  it('MM not valid', () => {
    const r = matchSerial('MM12345', 'Heritage');
    if (r !== null) {
      expect(r.brandFormat).not.toBe('heritage_double');
    }
  });

  it('bare 6-digit Kalamazoo', () => {
    const r = matchSerial('007704', 'Heritage');
    expect(r).not.toBeNull();
    expect(r!.brandFormat).toBe('heritage_numeric_6');
    expect(r!.decodedYear).toBeNull();
  });

  it('numeric 2020s 1YYXXXX', () => {
    const r = matchSerial('1201234', 'Heritage');
    expect(r!.decodedYear).toBe(2020);
    expect(r!.brandFormat).toBe('heritage_standard');
  });

  it('numeric 2023', () => {
    const r = matchSerial('1231234', 'Heritage');
    expect(r!.decodedYear).toBe(2023);
  });

  it('invalid letter A rejected', () => {
    expect(matchSerial('A12345', 'Heritage')).toBeNull();
  });
});
