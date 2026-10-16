/* Financial reporting shared by the admin page and its accounting tests. */
var TripAdmin = (() => {
  const core = typeof TripCore !== 'undefined' ? TripCore : require('./core.js');
  function report(snapshot, filters = {}) {
    core.assert(snapshot.me?.role === 'admin' && Array.isArray(snapshot.adminMembers), 'Admin access is required.');
    const from = filters.from ? core.date(filters.from) : '';
    const to = filters.to ? core.date(filters.to) : '';
    core.assert(!from || !to || from <= to, 'The end date must be on or after the start date.');
    core.assert(!filters.category || core.CATEGORIES.includes(filters.category), 'Choose a valid category.');
    const inPeriod = row => (!from || row.date >= from) && (!to || row.date <= to);
    const expenses = snapshot.expenses.filter(e => !e.deleted && inPeriod(e) && (!filters.category || e.category === filters.category));
    const versions = new Map(expenses.map(e => [e.id, e.version]));
    const splits = snapshot.splits.filter(s => versions.has(s.expenseId) && (s.version == null || versions.get(s.expenseId) == null || s.version === versions.get(s.expenseId)));
    // Repayments have no expense category. Category views show paid minus share,
    // so the same group repayment is never attributed to multiple categories.
    const settlements = filters.category ? [] : snapshot.settlements.filter(inPeriod);
    const balances = core.balances(expenses, splits, settlements);
    const members = snapshot.adminMembers.map(member => {
      const allocated = new Set(splits.filter(s => s.userId === member.id).map(s => s.expenseId));
      return { ...member, ...balances[member.id], paidCount: expenses.filter(e => e.payerId === member.id).length,
        involvedCount: expenses.filter(e => e.payerId === member.id || allocated.has(e.id)).length,
        recordedCount: expenses.filter(e => e.ownerId === member.id).length };
    });
    return { members, expenses, splits, settlements, totalMinor: expenses.reduce((sum,e) => sum + e.baseMinor, 0),
      outstandingMinor: members.reduce((sum,m) => sum + Math.max(0,-m.net),0),
      pendingMinor: settlements.filter(s => s.status === 'pending').reduce((sum,s) => sum + s.amountMinor,0),
      pendingCount: settlements.filter(s => s.status === 'pending').length,
      includesRepayments: !filters.category, scoped: !!(from || to || filters.category) };
  }
  function memberExpenses(report, userId, relationship = 'involved', search = '') {
    core.assert(report.members.some(m => m.id === userId), 'Choose a valid traveler.');
    core.assert(['involved','paid','shared','recorded'].includes(relationship), 'Choose a valid expense filter.');
    const allocated = new Map(report.splits.filter(s => s.userId === userId).map(s => [s.expenseId,s.amountMinor]));
    const query = String(search).trim().toLowerCase();
    return report.expenses.filter(e => {
      const included = relationship === 'paid' ? e.payerId === userId : relationship === 'shared' ? allocated.has(e.id) : relationship === 'recorded' ? e.ownerId === userId : e.payerId === userId || allocated.has(e.id);
      return included && (!query || (e.title + ' ' + e.notes).toLowerCase().includes(query));
    }).sort((a,b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)))
      .map(e => ({ ...e, memberPaid: e.payerId === userId ? e.baseMinor : 0, memberShare: allocated.get(e.id) || 0 }));
  }
  return { report, memberExpenses };
})();
if (typeof module !== 'undefined') module.exports = TripAdmin;
