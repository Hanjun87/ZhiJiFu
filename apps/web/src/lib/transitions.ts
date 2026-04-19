import { Page } from '../types';
import type { Easing } from 'motion/react';

export type TransitionKind = 'push';

export interface NavigationTransition {
  direction: number;
  kind: TransitionKind;
}

const pageDepth: Record<Page, number> = {
  home: 0,
  records: 0,
  community: 0,
  profile: 0,
  camera: 1,
  analysis: 2,
  result: 2,
  record_detail: 1,
  diary_detail: 1,
  consultations: 1,
  appointments: 1,
  settings: 1,
  about: 1,
  community_post_detail: 1,
  community_expert: 1,
  community_create: 1,
  community_contacts: 1,
  community_chat: 2,
  history: 1,
  hospital: 0,
  profile_edit: 1,
  skin_record_analysis: 2,
  skin_record_result: 2,
  disease_trend_test: 1,
  login: 0,
  register_user: 0,
  register_doctor: 0,
};

export const pagePresenceMode = 'sync';

export function getPageDepth(page: Page) {
  return pageDepth[page] ?? 0;
}

export function resolveTransition(from: Page, to: Page): NavigationTransition {
  // 统一使用 push 过渡
  const depthDiff = getPageDepth(to) - getPageDepth(from);
  return {
    direction: depthDiff >= 0 ? 1 : -1,
    kind: 'push',
  };
}

// 定义缓动函数
const easeOut: Easing = [0.0, 0.0, 0.58, 1.0];
const easeIn: Easing = [0.42, 0.0, 1.0, 1.0];
const easeOutCubic: Easing = [0.22, 1, 0.36, 1];

export function getPageTransition(kind: TransitionKind, direction: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: { x: direction * 20 },
      animate: {
        x: 0,
        transition: { duration: 0.2, ease: easeOut },
      },
      exit: {
        x: direction * 20,
        transition: { duration: 0.2, ease: easeIn },
      },
    };
  }

  // iOS 风格动画：
  // direction > 0 (进入更深层): 新页面从右划入
  // direction < 0 (返回更浅层): 新页面从左划入，旧页面向右退出
  if (direction > 0) {
    // 进入更深层页面
    return {
      initial: { x: '100%' },
      animate: {
        x: 0,
        transition: { duration: 0.35, ease: easeOutCubic },
      },
      exit: {
        x: '100%',
        transition: { duration: 0.35, ease: easeOutCubic },
      },
    };
  } else {
    // 返回更浅层页面
    return {
      initial: { x: '-30%' },
      animate: {
        x: 0,
        transition: { duration: 0.35, ease: easeOutCubic },
      },
      exit: {
        x: '100%',
        transition: { duration: 0.35, ease: easeOutCubic },
      },
    };
  }
}
