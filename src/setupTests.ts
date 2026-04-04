import '@testing-library/jest-dom';

// Chrome API stub for Jest (no real extension runtime in tests)
const chromeMock = {
  storage: {
    sync: {
      get: jest.fn((keys: any, callback: (items: any) => void) => {
        callback({});
      }),
      set: jest.fn((_items: any, callback?: () => void) => {
        callback?.();
      }),
      remove: jest.fn((_keys: any, callback?: () => void) => {
        callback?.();
      }),
    },
    local: {
      get: jest.fn((keys: any, callback: (items: any) => void) => {
        callback({});
      }),
      set: jest.fn((_items: any, callback?: () => void) => {
        callback?.();
      }),
      remove: jest.fn((_keys: any, callback?: () => void) => {
        callback?.();
      }),
    },
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onConnect: { addListener: jest.fn() },
    onStartup: { addListener: jest.fn() },
    onSuspend: { addListener: jest.fn() },
  },
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn((_cb?: () => void) => {}),
    onClicked: { addListener: jest.fn() },
  },
  tabs: {
    query: jest.fn(),
  },
};

(global as any).chrome = chromeMock;
