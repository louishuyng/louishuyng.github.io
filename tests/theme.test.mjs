import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8')
  .match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function browser(saved, dark = false, blocked = false) {
  const events = {};
  const root = { dataset: {} };
  const toggle = {
    hidden: true,
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, callback) { events[name] = callback; },
  };
  const system = { matches: dark, addEventListener(name, callback) { events[name] = callback; } };
  runInNewContext(script, {
    window: { matchMedia: () => system },
    document: {
      documentElement: root,
      getElementById: () => toggle,
      addEventListener(name, callback) { events[name] = callback; },
    },
    localStorage: {
      getItem() { if (blocked) throw Error('Storage blocked'); return saved; },
      setItem(key, value) { if (blocked) throw Error('Storage blocked'); saved = value; },
    },
  });
  assert.equal(root.dataset.theme, saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light');
  events.DOMContentLoaded();
  assert.equal(toggle.hidden, false);
  return { root, toggle, system, events, saved: () => saved };
}

const auto = browser(null, true);
auto.system.matches = false;
auto.events.change();
assert.equal(auto.root.dataset.theme, 'light');
auto.events.click();
assert.equal(auto.root.dataset.theme, 'dark');
assert.equal(auto.toggle['aria-pressed'], 'true');
assert.equal(auto.saved(), 'dark');
auto.events.change();
assert.equal(auto.root.dataset.theme, 'dark');
browser(auto.saved());
browser('invalid', true);
browser('light', true);
const blocked = browser(null, false, true);
blocked.events.click();
assert.equal(blocked.root.dataset.theme, 'dark');
console.log('Theme checks passed: system preference, toggle, persistence, invalid and blocked storage.');
