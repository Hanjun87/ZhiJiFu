import { Page } from '../types';

export type TransitionKind = 'tab' | 'tab_home' | 'push' | 'immersive' | 'sheet' | 'replace';

export interface NavigationTransition {
  direction: number;
  kind: TransitionKind;
}

const tabPages: Page[] = ['home', 'records', 'community', 'profile'];

const pageDepth: Record<Page, number> = {
  home: 0,
  records: 0,
  community: 0,
  profile: 0,
  camera: 1,
  analysis: 2,
  result: 2,
  record_detail: 1,
  consultations: 1,
  appointments: 1,
  settings: 1,
  about: 1,
  community_post_detail: 1,
  community_expert: 1,
  community_create: 1,

  history: 1,
};

const immersivePages = new Set<Page>(['camera', 'analysis', 'result']);
const sheetPages = new Set<Page>(['community_create', 'consultations', 'appointments', 'settings', 'about']);

export const pagePresenceMode = 'sync';

export function isTabPage(page: Page) {
  return tabPages.includes(page);
}

export function getPageDepth(page: Page) {
  return pageDepth[page] ?? 0;
}

export function resolveTransition(from: Page, to: Page): NavigationTransition {
  if (from === to) {
    return { direction: 0, kind: 'replace' };
  }

  if (isTabPage(from) && isTabPage(to)) {
    return {
      direction: Math.sign(tabPages.indexOf(to) - tabPages.indexOf(from)) || 1,
      kind: to === 'home' || from === 'home' ? 'tab_home' : 'tab',
    };
  }

  if (immersivePages.has(from) || immersivePages.has(to)) {
    const direction = getPageDepth(to) >= getPageDepth(from) ? 1 : -1;
    return {
      direction,
      kind: 'immersive',
    };
  }

  if (sheetPages.has(from) || sheetPages.has(to)) {
    return {
      direction: getPageDepth(to) >= getPageDepth(from) ? 1 : -1,
      kind: 'sheet',
    };
  }

  const depthDiff = getPageDepth(to) - getPageDepth(from);
  if (depthDiff !== 0) {
    return {
      direction: depthDiff > 0 ? 1 : -1,
      kind: 'push',
    };
  }

  return {
    direction: 1,
    kind: 'replace',
  };
}

export function getPageTransition(kind: TransitionKind, direction: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: { x: direction * 20 },
      animate: {
        x: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      exit: {
        x: direction * -20,
        transition: { duration: 0.2, ease: 'easeIn' },
      },
    };
  }

  // 底部导航 Tab 切换动画 - 平滑流畅
  const tabTransition = {
    initial: { x: direction * 100 },
    animate: {
      x: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: direction * -100,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Home Tab 特殊处理 - 更快更灵敏
  const homeTabTransition = {
    initial: { x: direction * 100 },
    animate: {
      x: 0,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: direction * -100,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Push 动画 - 从右边划入，返回时向右边划出
  const pushTransition = {
    initial: { x: '100%' },
    animate: {
      x: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: '100%',
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // 沉浸式页面动画 - 从右边划入，返回时向右边划出
  const immersiveTransition = {
    initial: { x: '100%' },
    animate: {
      x: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: '100%',
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Sheet 动画 - 从右边划入，返回时向右边划出
  const sheetTransition = {
    initial: { x: '100%' },
    animate: {
      x: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: '100%',
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (kind === 'push') {
    return pushTransition;
  }
  if (kind === 'tab_home') {
    return homeTabTransition;
  }
  if (kind === 'immersive') {
    return immersiveTransition;
  }
  if (kind === 'sheet') {
    return sheetTransition;
  }
  if (kind === 'replace') {
    return {
      initial: { x: direction * 20 },
      animate: {
        x: 0,
        transition: { duration: 0.25, ease: 'easeOut' },
      },
      exit: {
        x: direction * -20,
        transition: { duration: 0.25, ease: 'easeIn' },
      },
    };
  }
  return tabTransition;
}
