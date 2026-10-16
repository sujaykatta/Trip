/* Shared, dependency-free accounting and validation. Synced to backend/Core.gs. */
var TripCore = (() => {
  const MEMBERS = ['Sujay', 'Niyanth', 'Vishnu', 'Pujitha', 'Vedavathi'].map((name, i) => ({ id: i === 2 ? 'vishanu' : name.toLowerCase(), name, role: i ? 'member' : 'admin' }));
  const CURRENCIES = { INR: 2, VND: 0, USD: 2, EUR: 2, GBP: 2, SGD: 2, THB: 2, JPY: 0 };
  const CATEGORIES = ['Food & drinks', 'Stay', 'Transport', 'Experiences', 'Shopping', 'Other'];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const text = (value, max = 200, required = true) => {
    const s = String(value == null ? '' : value).trim();
    assert((!required || s.length > 0) && s.length <= max, `Enter ${required ? '1–' : 'up to '}${max} characters.`);
    return s;
  };
  function decimal(value, places) {
    const s = String(value).trim();
    assert(new RegExp('^\\d{1,10}(?:\\.\\d{1,' + places + '})?$').test(s) && (places > 0 || !s.includes('.')), 'Enter a valid amount with the correct currency precision.');
    const [whole, fraction = ''] = s.split('.');
    const result = Number(whole) * 10 ** places + Number(fraction.padEnd(places, '0'));
    assert(Number.isSafeInteger(result) && result <= 1000000000000, 'Amount is too large.');
    return result;
  }
  function minor(value, currency) {
    assert(Object.prototype.hasOwnProperty.call(CURRENCIES, currency), 'Unsupported currency.');
    if (CURRENCIES[currency] === 0) { assert(/^\d{1,10}$/.test(String(value)), 'This currency requires whole amounts.'); return Number(value); }
    return decimal(value, CURRENCIES[currency]);
  }
  function convert(amount, currency, rate) {
    const fixed = decimal(rate, 8);
    assert(fixed > 0, 'Exchange rate must be positive.');
    assert(currency !== 'INR' || fixed === 100000000, 'INR exchange rate must be 1.');
    const numerator = BigInt(amount) * BigInt(fixed) * BigInt(100);
    const denominator = BigInt(10 ** CURRENCIES[currency]) * BigInt(100000000);
    const result = Number((numerator + denominator / BigInt(2)) / denominator);
    assert(Number.isSafeInteger(result) && result > 0 && result <= 1000000000000, 'Converted amount must be between ₹0.01 and ₹10 billion.');
    return result;
  }
  function allocate(total, weights) {
    const sum = weights.reduce((a, x) => a + x.weight, 0);
    assert(Number.isSafeInteger(sum) && sum > 0, 'Split total must be positive.');
    const parts = weights.map(x => { const product = BigInt(total) * BigInt(x.weight); return { userId: x.userId, amountMinor: Number(product / BigInt(sum)), remainder: product % BigInt(sum) }; });
    let left = total - parts.reduce((a, x) => a + x.amountMinor, 0);
    const ranked = [...parts].sort((a, b) => a.remainder === b.remainder ? a.userId.localeCompare(b.userId) : a.remainder > b.remainder ? -1 : 1);
    for (let i = 0; i < left; i++) ranked[i].amountMinor++;
    return parts.map(({ userId, amountMinor }) => ({ userId, amountMinor }));
  }
  function date(value) {
    const s = String(value || '');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s, 'Enter a valid date.');
    return s;
  }
  function members(ids) {
    assert(Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length && ids.every(id => MEMBERS.some(u => u.id === id)), 'Choose valid, unique travelers.');
    return ids;
  }
  function expense(input) {
    const originalMinor = minor(input.amount, input.currency);
    assert(originalMinor > 0, 'Expense amount must be positive.');
    const rate = String(input.rate);
    const baseMinor = convert(originalMinor, input.currency, rate);
    const participants = members(input.participants);
    assert(MEMBERS.some(u => u.id === input.payerId), 'Choose a valid payer.');
    assert(CATEGORIES.includes(input.category), 'Choose a category.');
    assert(['equal', 'custom', 'percentage'].includes(input.splitType), 'Choose a split method.');
    const weights = participants.map(userId => ({ userId, weight: input.splitType === 'equal' ? 1 : input.splitType === 'custom' ? minor(input.allocations?.[userId] || '0', input.currency) : decimal(input.allocations?.[userId] || '0', 2) }));
    const sum = weights.reduce((a, x) => a + x.weight, 0);
    assert(input.splitType !== 'custom' || sum === originalMinor, 'Custom amounts must add up to the original bill total.');
    assert(input.splitType !== 'percentage' || sum === 10000, 'Percentages must add up to exactly 100%.');
    return { title: text(input.title, 100), originalMinor, currency: input.currency, rate, baseMinor, category: input.category, date: date(input.date), payerId: input.payerId, notes: text(input.notes, 2000, false), splitType: input.splitType, allocations: input.allocations || {}, splits: allocate(baseMinor, weights) };
  }
  function balances(expenses, splits, settlements = []) {
    const result = Object.fromEntries(MEMBERS.map(u => [u.id, { paid: 0, share: 0, sent: 0, received: 0, net: 0 }]));
    const active = new Set(expenses.filter(e => !e.deleted).map(e => e.id));
    expenses.filter(e => !e.deleted).forEach(e => result[e.payerId].paid += e.baseMinor);
    splits.filter(s => active.has(s.expenseId)).forEach(s => result[s.userId].share += s.amountMinor);
    settlements.filter(s => s.status === 'confirmed').forEach(s => { result[s.fromId].sent += s.amountMinor; result[s.toId].received += s.amountMinor; });
    Object.values(result).forEach(b => b.net = b.paid - b.share + b.sent - b.received);
    return result;
  }
  function settlementPlan(balances) {
    const debt = Object.entries(balances).filter(([, b]) => b.net < 0).map(([id, b]) => ({ id, amount: -b.net })).sort((a,b) => b.amount - a.amount || a.id.localeCompare(b.id));
    const credit = Object.entries(balances).filter(([, b]) => b.net > 0).map(([id, b]) => ({ id, amount: b.net })).sort((a,b) => b.amount - a.amount || a.id.localeCompare(b.id));
    const plan = []; let i = 0, j = 0;
    while (i < debt.length && j < credit.length) { const amountMinor = Math.min(debt[i].amount, credit[j].amount); plan.push({ fromId: debt[i].id, toId: credit[j].id, amountMinor }); debt[i].amount -= amountMinor; credit[j].amount -= amountMinor; if (!debt[i].amount) i++; if (!credit[j].amount) j++; }
    return plan;
  }
  function url(value) { const s = text(value, 1000, false); assert(!s || /^https:\/\/[^\s]+$/i.test(s), 'Links must start with https://.'); return s; }
  function csv(rows) { return rows.map(row => row.map(v => { let s = String(v ?? ''); if (/^[\s]*[=+@-]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n'); }
  return { MEMBERS, CURRENCIES, CATEGORIES, assert, text, decimal, minor, convert, allocate, date, members, expense, balances, settlementPlan, url, csv };
})();
if (typeof module !== 'undefined') module.exports = TripCore;
