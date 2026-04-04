import { Action, DEFAULT_CONTEXT, ENCRYPTION_TYPES } from '../constants';
import {
  historyReducer,
  appReducer,
  draftReducer,
  settingsReducer,
} from './reducers';
import { AppType, DraftType, HistoryType, SettingsType } from '../contexts/AppContext';

// Mock Chrome storage so reducers that call setSyncItem/deleteSyncItem don't throw
jest.mock('../chrome/utils/storage', () => ({
  setSyncItem: jest.fn(),
  deleteSyncItem: jest.fn(),
}));

// ─── historyReducer ────────────────────────────────────────────────────────────

describe('historyReducer', () => {
  const emptyState: HistoryType[] = [];
  const item: HistoryType = {
    id: 'abc',
    pastebinlink: 'https://pastebin.com/abc',
    enc_text: '{}',
    key: 'k',
    enc_mode: 'AES-GCM',
    key_length: 16,
    date: Date.now(),
  };

  it('SET_HISTORY replaces state', () => {
    const result = historyReducer(emptyState, {
      type: Action.SET_HISTORY,
      payload: [item] as any,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc');
  });

  it('ADD_TO_HISTORY appends item', () => {
    const result = historyReducer(emptyState, {
      type: Action.ADD_TO_HISTORY,
      payload: item as any,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc');
  });

  it('REMOVE_ITEM_FROM_HISTORY removes by id', () => {
    const result = historyReducer([item], {
      type: Action.REMOVE_ITEM_FROM_HISTORY,
      payload: { id: 'abc' } as any,
    });
    expect(result).toHaveLength(0);
  });

  it('CLEAR_HISTORY returns empty array', () => {
    const result = historyReducer([item], { type: Action.CLEAR_HISTORY });
    expect(result).toHaveLength(0);
  });

  it('unknown action returns existing state unchanged', () => {
    const state = [item];
    const result = historyReducer(state, { type: 'UNKNOWN' } as any);
    expect(result).toBe(state);
  });
});

// ─── appReducer ───────────────────────────────────────────────────────────────

describe('appReducer', () => {
  const initialState: AppType = {
    location: '/',
    dialog_id: null,
    subheader: null,
  };

  it('OPEN_DIALOG sets dialog_id', () => {
    const result = appReducer(initialState, {
      type: Action.OPEN_DIALOG,
      payload: { dialog_id: 'enc_form' },
    });
    expect(result.dialog_id).toBe('enc_form');
  });

  it('CLOSE_DIALOG clears dialog_id', () => {
    const result = appReducer(
      { ...initialState, dialog_id: 'enc_form' },
      { type: Action.CLOSE_DIALOG }
    );
    expect(result.dialog_id).toBeNull();
  });

  it('SET_SUBHEADER updates subheader', () => {
    const subheader = {
      back_button: true,
      primary: 'Test',
      secondary: null,
      custom_button: null,
    };
    const result = appReducer(initialState, {
      type: Action.SET_SUBHEADER,
      payload: { subheader },
    });
    expect(result.subheader).toEqual(subheader);
  });

  it('UPDATE_NAVIGATION clears subheader', () => {
    const result = appReducer(
      { ...initialState, subheader: { back_button: true, primary: 'X', secondary: null, custom_button: null } },
      { type: Action.UPDATE_NAVIGATION, payload: { location: '/home' } as any }
    );
    expect(result.subheader).toBeNull();
  });
});

// ─── draftReducer ─────────────────────────────────────────────────────────────

describe('draftReducer', () => {
  const initialState: DraftType = {
    action: Action.ENCRYPT,
    plaintext: '',
    enc_text: '',
    key: '',
    buttonEnabled: false,
  };

  it('UPDATE_PLAINTEXT updates plaintext and action', () => {
    const result = draftReducer(initialState, {
      type: Action.UPDATE_PLAINTEXT,
      payload: {
        plaintext: 'hello',
        action: Action.ENCRYPT,
        buttonEnabled: true,
      },
    });
    expect(result.plaintext).toBe('hello');
    expect(result.buttonEnabled).toBe(true);
  });

  it('SET_KEY updates the key', () => {
    const result = draftReducer(initialState, {
      type: Action.SET_KEY,
      payload: { key: 'mypasskey' },
    });
    expect(result.key).toBe('mypasskey');
  });

  it('SET_ACTION updates the action', () => {
    const result = draftReducer(initialState, {
      type: Action.SET_ACTION,
      payload: { action: Action.DECRYPT },
    });
    expect(result.action).toBe(Action.DECRYPT);
  });

  it('RESET_DRAFT clears key, plaintext, and buttonEnabled', () => {
    const filled: DraftType = {
      ...initialState,
      key: 'key',
      plaintext: 'text',
      buttonEnabled: true,
    };
    const result = draftReducer(filled, {
      type: Action.RESET_DRAFT,
      payload: null,
    });
    expect(result.key).toBe('');
    expect(result.plaintext).toBe('');
    expect(result.buttonEnabled).toBe(false);
  });

  it('UPDATE_ENC_MENU updates action and buttonEnabled', () => {
    const result = draftReducer(initialState, {
      type: Action.UPDATE_ENC_MENU,
      payload: { action: Action.ENCRYPT_PASTEBIN, buttonEnabled: true },
    });
    expect(result.action).toBe(Action.ENCRYPT_PASTEBIN);
    expect(result.buttonEnabled).toBe(true);
  });
});

// ─── settingsReducer ──────────────────────────────────────────────────────────

describe('settingsReducer', () => {
  const initialState: SettingsType = {
    api_key: '',
    enc_mode: ENCRYPTION_TYPES.AES_GCM,
    encryption: false,
    key_length: 16,
    theme: false,
    sync_theme: true,
  };

  it('UPDATE_THEME toggles theme and persists', () => {
    const result = settingsReducer(initialState, {
      type: Action.UPDATE_THEME,
      payload: { theme: true },
    });
    expect(result.theme).toBe(true);
  });

  it('SET_THEME sets theme from stored value', () => {
    const result = settingsReducer(initialState, {
      type: Action.SET_THEME,
      payload: { theme: true },
    });
    expect(result.theme).toBe(true);
  });

  it('UPDATE_SETTINGS updates api_key and persists settings', () => {
    const result = settingsReducer(initialState, {
      type: Action.UPDATE_SETTINGS,
      payload: { api_key: 'newkey' },
    });
    expect(result.api_key).toBe('newkey');
  });

  it('UPDATE_SETTINGS preserves encryption flag when omitted', () => {
    const withEnc = { ...initialState, encryption: true };
    const result = settingsReducer(withEnc, {
      type: Action.UPDATE_SETTINGS,
      payload: { api_key: 'k' },
    });
    expect(result.encryption).toBe(true);
  });

  it('UPDATE_SETTINGS can explicitly disable encryption', () => {
    const withEnc = { ...initialState, encryption: true };
    const result = settingsReducer(withEnc, {
      type: Action.UPDATE_SETTINGS,
      payload: { encryption: false },
    });
    expect(result.encryption).toBe(false);
  });

  it('SET_SETTINGS merges settings without overwriting missing fields', () => {
    const result = settingsReducer(initialState, {
      type: Action.SET_SETTINGS,
      payload: { enc_mode: ENCRYPTION_TYPES.AES_CBC },
    });
    expect(result.enc_mode).toBe(ENCRYPTION_TYPES.AES_CBC);
    expect(result.api_key).toBe('');
  });

  it('RESET_SETTINGS restores defaults', () => {
    const modified = { ...initialState, api_key: 'somekey', theme: true };
    const result = settingsReducer(modified, {
      type: Action.RESET_SETTINGS,
      payload: null,
    });
    expect(result.api_key).toBe(DEFAULT_CONTEXT.api_key);
    expect(result.theme).toBe(DEFAULT_CONTEXT.theme);
  });
});
