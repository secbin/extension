import {
  openLinkInNewWindow,
  printDateInCorrectFormat,
  copyTextClipboard,
} from './utils';

describe('openLinkInNewWindow', () => {
  it('calls window.open with the given URL', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(() => null);
    openLinkInNewWindow('https://example.com');
    expect(spy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    );
    spy.mockRestore();
  });
});

describe('printDateInCorrectFormat', () => {
  it('returns relative time for recent dates', () => {
    const recent = Date.now() - 60 * 1000; // 1 minute ago
    const result = printDateInCorrectFormat(recent);
    expect(result).toMatch(/ago|minute|just now/i);
  });

  it('returns absolute date for old dates', () => {
    // Use explicit local time (not UTC string) to avoid timezone offset issues
    const old = new Date(2020, 0, 15).getTime(); // Jan 15 2020 local time
    const result = printDateInCorrectFormat(old);
    expect(result).toBe('January 15, 2020');
  });

  it('accepts a Date object', () => {
    const old = new Date(2021, 5, 1); // June 1 2021 local time
    const result = printDateInCorrectFormat(old);
    expect(result).toBe('June 1, 2021');
  });
});

describe('copyTextClipboard', () => {
  it('does nothing when text is undefined', () => {
    const appendSpy = jest.spyOn(document.body, 'appendChild');
    copyTextClipboard(undefined);
    expect(appendSpy).not.toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it('does nothing when text is empty string', () => {
    const appendSpy = jest.spyOn(document.body, 'appendChild');
    copyTextClipboard('');
    expect(appendSpy).not.toHaveBeenCalled();
    appendSpy.mockRestore();
  });

  it('appends and removes a textarea when copying', () => {
    // document.execCommand is not defined in jsdom — mock it on the object directly
    Object.defineProperty(document, 'execCommand', {
      value: jest.fn(() => true),
      writable: true,
      configurable: true,
    });

    copyTextClipboard('hello world');

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    // textarea should have been removed from DOM
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });
});
