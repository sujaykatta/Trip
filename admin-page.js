/* Admin UI uses the authenticated adminReport response, never a selected name. */
var adminReportData = null, adminLoading = false, adminError = '', adminGeneration = 0;
var adminFilters = { member: 'sujay', category: '', from: '', to: '', relationship: 'involved', search: '' };
function resetAdminReport() {
  adminReportData = null; adminLoading = false; adminError = ''; adminGeneration++;
  adminFilters = { member: 'sujay', category: '', from: '', to: '', relationship: 'involved', search: '' };
}
async function loadAdminReport() {
  if (!data || data.me.role !== 'admin') throw new Error('Only the trip admin can open this page.');
  if (adminLoading) return;
  const generation = ++adminGeneration;
  adminLoading = true; adminError = ''; render();
  try {
    const report = await TripAPI.call('adminReport');
    if (generation !== adminGeneration) return;
    if (report.me?.id !== data?.me.id || report.me?.role !== 'admin') throw new Error('Admin access is required.');
    data = report; adminReportData = report;
  } catch (error) {
    if (generation === adminGeneration) { adminReportData = null; adminError = error.message; }
  } finally {
    if (generation === adminGeneration) { adminLoading = false; if (page === 'admin' && data) render(); }
  }
}
async function navigatePage(nextPage) {
  if (nextPage === 'admin' && data?.me.role !== 'admin') throw new Error('Only the trip admin can open this page.');
  page = nextPage; render(); window.scrollTo(0,0);
  if (page === 'admin') await loadAdminReport();
}
function adminModel() { return TripAdmin.report(adminReportData,adminFilters); }
function adminView() {
  if (data.me.role !== 'admin') return empty('Admin access required','This page is available to the trip organizer.','','','shield');
  const top = heading('SUJAY’S ADMIN WORKSPACE','Every traveler. Every expense.','A clear view of what each person paid, shared, and still needs to settle.',
    btn(icon('refresh')+'Refresh','admin-refresh',adminLoading?'disabled':'','button secondary')+btn(icon('edit')+'Trip settings','settings','','button secondary'));
  if (adminLoading) return top+'<div class="loading-skeleton" role="status" aria-label="Loading admin report"><div></div><section></section><aside><i></i><i></i><i></i><i></i></aside></div>';
  if (!adminReportData) return top+`<section class="panel admin-unavailable">${icon('shield')}<h2>We couldn’t load the admin report.</h2><p>${esc(adminError || 'Refresh to retrieve the latest financial report.')}</p>${btn('Try again','admin-refresh','','button secondary')}</section>`;
  let report;
  try { report = adminModel(); } catch (error) {
    return top+adminScopeFilters()+`<div class="form-error" role="alert">${esc(error.message)}</div>`;
  }
  const member = report.members.find(m => m.id === adminFilters.member) || report.members[0];
  const list = TripAdmin.memberExpenses(report,member.id,adminFilters.relationship,adminFilters.search);
  return top+`<div class="admin-access-note"><span>${icon('shield')} Admin access · ${esc(data.me.name)}</span><span>${icon('clock')} Updated ${new Date(adminReportData.syncedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span></div>`+
    adminScopeFilters()+`<section class="metric-grid admin-metrics" aria-label="Admin spending overview">
      <article class="metric"><div><span>Group spending</span>${icon('wallet')}</div><h2>${money(report.totalMinor)}</h2><p>${report.expenses.length} expenses ${report.scoped?'in this scope':'across the trip'}</p></article>
      <article class="metric balance-metric"><div><span>Outstanding to settle</span>${icon('arrow')}</div><h2>${money(report.outstandingMinor)}</h2><p>${report.scoped?'Balance within selected filters':'After confirmed repayments'}</p></article>
      <article class="metric"><div><span>Pending repayments</span>${icon('clock')}</div><h2>${money(report.pendingMinor)}</h2><p>${report.includesRepayments?report.pendingCount+' awaiting confirmation':'Repayments have no category'}</p></article>
      <article class="metric"><div><span>Travelers</span>${icon('user')}</div><h2>${report.members.length}</h2><p>${report.members.filter(m=>m.status==='active').length} active accounts · Sujay is admin</p></article>
    </section><div class="admin-section-heading"><div><h2>Choose a traveler</h2><p>See their paid bills and exact share of every expense.</p></div>${btn(icon('download')+'Export group summary','admin-export-summary','','button secondary small')}</div>
    <div class="admin-roster" aria-label="Traveler reports">${report.members.map(m => `<button class="admin-member-card ${m.id===member.id?'selected':''}" data-action="admin-member" data-id="${esc(m.id)}" aria-pressed="${m.id===member.id}"><div>${avatar(m.id)}<span><strong>${esc(m.name)}</strong><small>${m.role==='admin'?'Admin':m.status==='active'?'Traveler':'Inactive account'}</small></span>${m.id===member.id?icon('check'):icon('chevron')}</div><dl><div><dt>Paid</dt><dd>${money(m.paid)}</dd></div><div><dt>Share</dt><dd>${money(m.share)}</dd></div></dl><span class="member-net ${m.net<0?'debit':'credit'}">${m.net===0?'All settled':money(Math.abs(m.net))+(m.net>0?' to receive':' to pay')}</span></button>`).join('')}</div>
    <section class="panel admin-individual"><div class="admin-member-heading"><div>${avatar(member.id)}<span><span class="eyebrow">INDIVIDUAL EXPENSE REPORT</span><h2>${esc(member.name)}’s expenses</h2></span></div>${btn(icon('download')+'Export '+esc(member.name)+'’s expenses','admin-export-member','','button secondary small')}</div>
    <div class="admin-personal-totals"><div><span>Personally paid</span><strong>${money(member.paid)}</strong><small>${member.paidCount} bills paid</small></div><div><span>Allocated share</span><strong>${money(member.share)}</strong><small>Across shared and individual bills</small></div><div><span>Repayments sent / received</span><strong>${money(member.sent)} / ${money(member.received)}</strong><small>${report.includesRepayments?'Confirmed payments only':'Excluded in category views'}</small></div><div><span>${member.net<0?'Still to pay':'Amount to receive'}</span><strong class="${member.net<0?'debit':'credit'}">${money(Math.abs(member.net))}</strong><small>${report.scoped?'Within the selected scope':'Overall trip balance'}</small></div></div>
    <div class="admin-individual-filters"><label class="search-field">${icon('search')}<input id="admin-search" aria-label="Search individual expenses" placeholder="Find an expense…" value="${esc(adminFilters.search)}"></label>${select('Show','admin-relationship',[{value:'involved',label:'All their expenses'},{value:'paid',label:'Paid by '+member.name},{value:'shared',label:'Shared with '+member.name},{value:'recorded',label:'Recorded by '+member.name}],adminFilters.relationship)}<span>${list.length} ${list.length===1?'expense':'expenses'}</span></div>
    ${list.length?`<div class="table-scroll"><table class="admin-expense-table"><thead><tr><th>Expense</th><th>Paid by</th><th>Bill total</th><th>${esc(member.name)} paid</th><th>${esc(member.name)}’s share</th><th>Details</th></tr></thead><tbody>${list.map(e=>`<tr><td><strong>${esc(e.title)}</strong><small>${esc(e.category)} · ${dateLabel(e.date)}</small></td><td>${avatar(e.payerId,'tiny')}${esc(names[e.payerId])}</td><td><strong>${money(e.baseMinor)}</strong>${e.currency!=='INR'?`<small>${money(e.originalMinor,e.currency)}</small>`:''}</td><td>${money(e.memberPaid)}</td><td>${money(e.memberShare)}</td><td>${btn('View '+icon('arrow'),'expense-detail',`data-id="${esc(e.id)}" aria-label="View ${esc(e.title)}"`,'text-button')}</td></tr>`).join('')}</tbody></table></div>`:empty('No expenses for this view.','Choose a different traveler or filter. New bills will appear after refresh.','','','wallet')}
    <div class="admin-report-footnote">${icon('shield')} Paid is the bill amount this traveler covered. Share is their allocated cost. Recorded by identifies who entered the bill.</div></section>
    <section class="panel spaced"><div class="panel-heading"><div><h2>Everyone at a glance</h2><p>${report.scoped?'Values reflect the selected dates and category.':'All trip expenses and confirmed repayments.'}</p></div></div><div class="table-scroll"><table class="admin-summary-table"><thead><tr><th>Traveler</th><th>Paid</th><th>Share</th><th>Sent</th><th>Received</th><th>Net balance</th><th>Report</th></tr></thead><tbody>${report.members.map(m=>`<tr><td>${avatar(m.id,'tiny')}${esc(m.name)}</td><td>${money(m.paid)}</td><td>${money(m.share)}</td><td>${money(m.sent)}</td><td>${money(m.received)}</td><td class="${m.net<0?'debit':'credit'}">${m.net<0?'−':m.net>0?'+':''}${money(Math.abs(m.net))}</td><td>${btn('View','admin-member',`data-id="${esc(m.id)}" aria-label="View ${esc(m.name)}’s report"`,'text-button')}</td></tr>`).join('')}</tbody></table></div><p class="hint panel-padding">Positive balances are amounts to receive; negative balances are amounts to pay. ${report.includesRepayments?'Only confirmed repayments affect balances.':'Category views exclude repayments because payments do not belong to a bill category.'} Date filters include only transactions within that period.</p></section>`;
}
function adminScopeFilters() {
  return `<div class="admin-scope-filters">${select('Expense category','admin-category',[{value:'',label:'All categories'},...C.CATEGORIES],adminFilters.category)}${field('From date','admin-from',adminFilters.from,'date')}${field('To date','admin-to',adminFilters.to,'date')}${btn('Clear filters','admin-clear','','button ghost small')}</div>`;
}
function adminExport(kind) {
  C.assert(data?.me.role==='admin' && adminReportData,'Admin access is required.');
  const report=adminModel(),member=report.members.find(m=>m.id===adminFilters.member);
  let rows,filename;
  if (kind==='summary') {
    rows=[['Traveler','Bills paid','Paid INR','Share INR','Confirmed sent INR','Confirmed received INR','Net balance INR','From date','To date','Category'],...report.members.map(m=>[m.name,m.paidCount,amountValue(m.paid),amountValue(m.share),amountValue(m.sent),amountValue(m.received),amountValue(m.net),adminFilters.from,adminFilters.to,adminFilters.category||'All categories'])];
    filename='vietnam-admin-group-summary.csv';
  } else {
    const list=TripAdmin.memberExpenses(report,member.id,adminFilters.relationship,adminFilters.search);
    rows=[['Traveler','Expense ID','Date','Title','Category','Paid by','Recorded by','Original amount','Currency','Saved INR rate','Bill total INR','Traveler paid INR','Traveler share INR','Notes'],...list.map(e=>[member.name,e.id,e.date,e.title,e.category,names[e.payerId],names[e.ownerId],amountValue(e.originalMinor,e.currency),e.currency,e.rate,amountValue(e.baseMinor),amountValue(e.memberPaid),amountValue(e.memberShare),e.notes])];
    filename='vietnam-admin-'+member.id+'-expenses.csv';
  }
  downloadBlob('\uFEFF'+C.csv(rows),filename);toast('Admin report downloaded.');
}
