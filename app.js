
const fmt=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0);
const initial=[
 {id:'cofre',name:'Primeiro Cofre',target:500,level:1,theme:'O começo de tudo',duration:13,frequency:'daily',deposits:[25,25,30,30,35,35,40,40,45,45,50,50,50]},
 {id:'disciplina',name:'Disciplina',target:1000,level:1,theme:'Consistência acima de tudo',duration:13,frequency:'daily',deposits:[50,50,60,60,70,70,80,80,90,90,100,100,100]},
 {id:'2500',name:'Construindo Fortuna',target:2500,level:2,theme:'O desafio clássico',duration:15,frequency:'daily',deposits:[130,135,140,145,150,155,160,165,170,175,180,185,190,195,225]},
 {id:'5000',name:'Mentalidade de Magnata',target:5000,level:3,theme:'Suba o padrão',duration:14,frequency:'daily',deposits:[200,250,250,300,300,350,350,400,400,450,450,500,500,300]},
 {id:'10000',name:'Grande Patrimônio',target:10000,level:4,theme:'Visão de longo prazo',duration:16,frequency:'daily',deposits:[250,300,350,400,450,500,550,600,650,700,750,800,900,1000,1100,700]},
 {id:'30dias',name:'Constância 30 dias',target:900,level:2,theme:'Um passo por dia',duration:30,frequency:'daily',deposits:Array(30).fill(30)},
 {id:'60dias',name:'Reserva em 60 dias',target:1800,level:2,theme:'Ritmo semanal',duration:60,frequency:'weekly',deposits:Array(9).fill(200)},
 {id:'90dias',name:'Projeto 90 dias',target:2700,level:3,theme:'Construção consistente',duration:90,frequency:'monthly',deposits:[900,900,900]},
 {id:'180dias',name:'Reserva de 6 meses',target:6000,level:4,theme:'Visão de longo prazo',duration:180,frequency:'monthly',deposits:[1000,1000,1000,1000,1000,1000]}
];
let data;try{data=JSON.parse(localStorage.getItem('fortuna-v1'))||null}catch(e){}
if(!data)data={challenges:initial.map(ch=>({...ch,deposits:ch.deposits.map(value=>({value,done:false}))})),active:'2500',completed:[]};
else data.challenges=data.challenges.map(ch=>({...ch,deposits:ch.deposits.map(d=>typeof d==='number'?({value:d,done:false}):d)}));
if(!Array.isArray(data.transactions))data.transactions=[];
if(!data.monthlyBudgets||typeof data.monthlyBudgets!=='object')data.monthlyBudgets={};
if(!Array.isArray(data.recurringBills))data.recurringBills=[];
if(!data.plan||typeof data.plan!=='object')data.plan={target:'',current:'',monthly:''};
if(!Array.isArray(data.openFinanceChecks))data.openFinanceChecks=[false,false,false,false];
function save(){localStorage.setItem('fortuna-v1',JSON.stringify(data));render()}
function amount(ch){return ch.deposits.reduce((s,d)=>s+d.value*(d.done?1:0),0)}
function pct(ch){return Math.min(100,Math.round(amount(ch)/ch.target*100))}
function selected(){return data.challenges.find(x=>x.id===data.active)||data.challenges[0]}
function totalSaved(){return data.challenges.reduce((s,ch)=>s+amount(ch),0)}
function render(){
 const ch=selected();const saved=amount(ch),p=pct(ch);
 document.getElementById('totalSaved').textContent=fmt(totalSaved());
 document.getElementById('completedCount').textContent=data.challenges.filter(x=>amount(x)>=x.target).length;
 const sumTarget=data.challenges.reduce((s,x)=>s+x.target,0),allp=Math.min(100,Math.round(totalSaved()/sumTarget*100));
 document.getElementById('overallPct').textContent=allp+'%';document.getElementById('overallBar').style.width=allp+'%';
 document.getElementById('overallText').textContent=fmt(totalSaved())+' acumulados em '+data.challenges.length+' metas cadastradas.';
 const levelInfo=[['O Primeiro Cofre','Acumule seus primeiros valores','₿'],['Mentalidade de Magnata','Aumente suas metas e consistência','♜'],['Wall Street','Pense grande, planeje melhor','↗'],['Legado','Construa pensando no longo prazo','✦']];
 document.getElementById('levels').innerHTML=levelInfo.map((l,i)=>`<article class="level ${ch.level===i+1?'active':''}"><div class="level-art">${l[2]}</div><div class="level-copy"><b>Nível 0${i+1} · ${l[0]}</b><small>${l[1]}</small></div><button data-level="${i+1}">Ver metas</button></article>`).join('');
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{let target=data.challenges.find(x=>x.level===+b.dataset.level);if(target){data.active=target.id;save();document.getElementById('activeChallenge').scrollIntoView({behavior:'smooth'})}else toast('Crie uma meta para este nível.')});
 document.getElementById('challengeList').innerHTML=data.challenges.map(x=>`<button class="level" data-ch="${x.id}" style="width:100%;text-align:left"><div class="level-art">${x.level===1?'₿':x.level===2?'♜':x.level===3?'↗':'✦'}</div><div class="level-copy"><b>${x.name}</b><small>${fmt(x.target)} · ${x.duration||x.deposits.length} dias · ${pct(x)}% concluído</small></div><span style="color:var(--gold2);font-size:20px">›</span></button>`).join('');
 document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{data.active=b.dataset.ch;save();document.getElementById('activeChallenge').scrollIntoView({behavior:'smooth'})});
 document.getElementById('activeHeading').textContent=ch.name;document.getElementById('activeName').textContent=ch.name;
 document.getElementById('activeLevel').textContent=`NÍVEL 0${ch.level} · ${['INICIANTE','DISCIPLINA','AVANÇADO','ELITE'][ch.level-1]||'PERSONALIZADO'}`;
 document.getElementById('activeStatus').textContent=p>=100?'CONCLUÍDO':'EM ANDAMENTO';
 document.getElementById('activeTarget').textContent=fmt(ch.target);
 document.getElementById('activeSchedule').textContent=`Prazo de ${ch.duration||ch.deposits.length} dias · ${({daily:'depósitos diários',weekly:'depósitos semanais',monthly:'depósitos mensais'}[ch.frequency]||'depósitos personalizados')}. Marque quando guardar.`;
 document.getElementById('activeProgressText').textContent=fmt(saved)+' de '+fmt(ch.target);
 document.getElementById('activePct').textContent=p+'%';document.getElementById('activeBar').style.width=p+'%';
 document.getElementById('activeSaved').textContent=fmt(saved);document.getElementById('activeRemaining').textContent=fmt(Math.max(0,ch.target-saved));
 document.getElementById('depositCount').textContent=ch.deposits.filter(d=>d.done).length+' de '+ch.deposits.length+' depósitos';
 document.getElementById('depositGrid').innerHTML=ch.deposits.map((d,i)=>`<button class="deposit ${d.done?'done':''}" data-dep="${i}"><span class="circle">${d.done?'✓':''}</span><b>${fmt(d.value)}</b><small>${d.done?'Guardado':'Pendente'}</small></button>`).join('');
 document.querySelectorAll('[data-dep]').forEach(b=>b.onclick=()=>{const d=ch.deposits[+b.dataset.dep];d.done=!d.done;save();if(pct(ch)>=100)toast('Meta concluída! Parabéns.');});
 renderLedger();
 renderRecurring();
 renderBudget();
 renderAssistant();
 
}

function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderLedger(){
 const personal=data.transactions.filter(t=>t.accountScope!=='business');
 const income=personal.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=personal.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 document.getElementById('ledgerIncome').textContent=fmt(income);
 document.getElementById('ledgerExpense').textContent=fmt(expense);
 document.getElementById('ledgerBalance').textContent=fmt(income-expense);
 document.getElementById('txCount').textContent=personal.length+' lançamentos';
 const list=document.getElementById('transactionList');
 if(!personal.length){list.innerHTML='<div class="finance-empty">Nenhum lançamento pessoal ainda. Registre sua primeira receita ou despesa.</div>'}
 else{
  list.innerHTML=[...personal].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).map(t=>`
   <div class="transaction">
    <div class="tx-icon">${t.type==='income'?'↗':'↘'}</div>
    <div class="tx-main"><b>${escapeHTML(t.description)}</b><small>${escapeHTML(t.category)} · ${new Date(t.date+'T12:00:00').toLocaleDateString('pt-BR')}</small></div>
    <div class="tx-value ${t.type}">${t.type==='income'?'+':'−'} ${fmt(t.amount)}</div>
    <button class="tx-delete" data-delete-tx="${t.id}" aria-label="Excluir lançamento">×</button>
   </div>`).join('');
 }
 document.querySelectorAll('[data-delete-tx]').forEach(b=>b.onclick=()=>{
  if(!confirm('Excluir este lançamento pessoal?'))return;
  data.transactions=data.transactions.filter(t=>String(t.id)!==b.dataset.deleteTx);save();toast('Lançamento excluído.');
 });

}


function monthKeyFor(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')}
function dueDateFor(bill,year,monthIndex){
 const last=new Date(year,monthIndex+1,0).getDate();
 return new Date(year,monthIndex,Math.min(Number(bill.day)||1,last),12,0,0);
}
function billPaid(bill,key){return Array.isArray(bill.paidMonths)&&bill.paidMonths.includes(key)}
function renderRecurring(){
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
 const key=monthKeyFor(now),personal=data.transactions.filter(t=>t.accountScope!=='business');
 const base=personal.filter(t=>String(t.date||'').slice(0,7)===key&&String(t.date||'')<=today.toISOString().slice(0,10)).reduce((sum,t)=>sum+(t.type==='income'?t.amount:-t.amount),0);
 let upcomingIncome=0,upcomingExpense=0;
 const events=[];
 data.recurringBills.forEach(b=>{
  if(b.active===false)return;
  const due=dueDateFor(b,now.getFullYear(),now.getMonth()),paid=billPaid(b,key);
  if(!paid){
   events.push({bill:b,due,key});
   if(b.type==='income')upcomingIncome+=b.amount;else upcomingExpense+=b.amount;
  }
 });
 const projected=base+upcomingIncome-upcomingExpense;
 document.getElementById('forecastBalance').textContent=fmt(projected);
 document.getElementById('forecastBalance').style.color=projected>=0?'var(--green)':'#e58d7e';
 document.getElementById('forecastIncome').textContent=fmt(upcomingIncome);
 document.getElementById('forecastExpense').textContent=fmt(upcomingExpense);
 document.getElementById('forecastNote').textContent=`Saldo registrado até agora: ${fmt(base)}. A previsão considera somente recorrências ainda não marcadas como pagas/recebidas neste mês.`;
 // Next 30 days, including this month and next month
 const horizon=new Date(today);horizon.setDate(horizon.getDate()+30);
 data.recurringBills.forEach(b=>{
  if(b.active===false)return;
  for(let offset=0;offset<=1;offset++){
   const monthIndex=now.getMonth()+offset,year=now.getFullYear()+Math.floor(monthIndex/12),mi=monthIndex%12;
   const due=dueDateFor(b,year,mi),monthKey=monthKeyFor(due);
   if(due<=horizon&&!billPaid(b,monthKey)&&(due>=today||monthKey===key))events.push({bill:b,due,key:monthKey});
  }
 });
 events.sort((a,b)=>a.due-b.due);
 const unique=events.filter((e,i,arr)=>arr.findIndex(x=>x.bill.id===e.bill.id&&x.key===e.key)===i);
 document.getElementById('billCount').textContent=unique.length+' próximos';
 const list=document.getElementById('recurringList');
 if(!unique.length){list.innerHTML='<div class="finance-empty">Nenhum vencimento pendente nos próximos 30 dias.</div>'}
 else{
  list.innerHTML=unique.map(e=>{
   const b=e.bill,day=e.due.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}),overdue=e.due<today;
   return `<div class="transaction"><div class="tx-icon">${b.type==='income'?'↗':'↘'}</div><div class="tx-main"><b>${escapeHTML(b.name)}</b><small>${overdue?'VENCIDA · ':''}${day} · ${escapeHTML(b.category)} · ${b.type==='income'?'Entrada':'Despesa'}</small></div><div class="tx-value ${b.type}">${b.type==='income'?'+':'−'} ${fmt(b.amount)}</div><button class="outline" data-delete-bill="${b.id}" title="Excluir recorrência" style="padding:7px 8px;font-size:11px">×</button><button class="outline" data-paid-bill="${b.id}" data-paid-month="${e.key}" style="padding:7px 9px;font-size:11px">${b.type==='income'?'Recebido':'Paga'}</button></div>`;
  }).join('');
 }
 document.querySelectorAll('[data-paid-bill]').forEach(btn=>btn.onclick=()=>{
  const bill=data.recurringBills.find(x=>String(x.id)===btn.dataset.paidBill);
  if(!bill)return;
  const month=btn.dataset.paidMonth;
  if(!bill.paidMonths)bill.paidMonths=[];
  if(bill.paidMonths.includes(month))return;
  if(!confirm(`${bill.type==='income'?'Marcar como recebida':'Marcar como paga'}: ${bill.name}? Isso também registrará o lançamento no financeiro.`))return;
  bill.paidMonths.push(month);
  const due=dueDateFor(bill,Number(month.slice(0,4)),Number(month.slice(5,7))-1);
  data.transactions.push({id:Date.now()+Math.floor(Math.random()*1000),type:bill.type,amount:bill.amount,description:bill.name,category:bill.category,date:due.toISOString().slice(0,10),source:'recurring',recurringId:bill.id});
  save();toast('Recorrência atualizada!');
 });
 document.querySelectorAll('[data-delete-bill]').forEach(btn=>btn.onclick=()=>{
  if(!confirm('Excluir esta recorrência? Os lançamentos já registrados serão mantidos.'))return;
  data.recurringBills=data.recurringBills.filter(x=>String(x.id)!==btn.dataset.deleteBill);save();
 });
}

function currentMonthKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function monthTransactions(key){return data.transactions.filter(t=>t.accountScope!=='business'&&String(t.date||'').slice(0,7)===key)}
function renderBudget(){
 const key=currentMonthKey(),tx=monthTransactions(key);
 const income=tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 document.getElementById('budgetMonth').textContent=new Date(key+'-02T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 document.getElementById('monthSpend').textContent=fmt(expense);
 document.getElementById('monthIncome').textContent=fmt(income);
 document.getElementById('monthExpense').textContent=fmt(expense);
 const net=income-expense;
 document.getElementById('monthNet').textContent='Saldo do mês: '+fmt(net);
 document.getElementById('monthNet').style.color=net>=0?'var(--green)':'#e58d7e';
 const spent={};tx.filter(t=>t.type==='expense').forEach(t=>spent[t.category]=(spent[t.category]||0)+t.amount);
 const budgets=data.monthlyBudgets[key]||{};
 const cats=Object.keys(budgets);
 document.getElementById('budgetCount').textContent=cats.length+' categorias';
 document.getElementById('budgetList').innerHTML=cats.length?cats.map(cat=>{
  const limit=budgets[cat],used=spent[cat]||0,p=limit>0?Math.min(100,Math.round(used/limit*100)):0,over=used>limit;
  return `<div class="budget-row"><div class="budget-row-top"><span>${escapeHTML(cat)}</span><b>${fmt(used)} / ${fmt(limit)}</b></div><div class="budget-track"><i class="${over?'over':''}" style="width:${p}%"></i></div><div class="budget-meta">${over?'Limite ultrapassado em '+fmt(used-limit):'Restam '+fmt(limit-used)} · ${Math.round(used/limit*100)}%</div></div>`;
 }).join(''):'<div class="finance-empty">Defina um limite para acompanhar seus gastos.</div>';
 const months=[];
 const now=new Date();
 for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'))}
 const values=months.map(k=>{const a=monthTransactions(k);return {key:k,income:a.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),expense:a.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)}});
 const max=Math.max(1,...values.flatMap(v=>[v.income,v.expense]));
 document.getElementById('monthlyChart').innerHTML=values.map(v=>`<div class="chart-col"><div class="chart-pair"><i class="chart-bar" style="height:${Math.max(v.income?3:0,v.income/max*95)}px"></i><i class="chart-bar out" style="height:${Math.max(v.expense?3:0,v.expense/max*95)}px"></i></div><small>${v.key.slice(5)}</small></div>`).join('');
 const insight=document.getElementById('financeInsight');
 if(!data.transactions.length){insight.textContent='Registre receitas e despesas para começar a receber análises sobre seu comportamento financeiro.'}
 else if(expense===0){insight.textContent='Você ainda não registrou despesas neste mês. Continue registrando seus movimentos para acompanhar seu orçamento.'}
 else if(income===0){insight.textContent='Você registrou despesas, mas ainda não registrou receitas neste mês. Adicione suas entradas para calcular o saldo mensal.'}
 else{
  const rate=expense/income*100;
  const top=Object.entries(spent).sort((a,b)=>b[1]-a[1])[0];
  insight.textContent=`Neste mês, suas despesas representam ${rate.toFixed(1).replace('.',',')}% das receitas registradas. A maior categoria de gasto é ${top?top[0]:'—'} (${top?fmt(top[1]):fmt(0)}). ${net>=0?'O saldo registrado está positivo.':'As despesas registradas superam as receitas.'}`;
 }
}


function renderAssistant(){
 const tx=monthTransactions(currentMonthKey());
 const income=tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 const rate=income>0?expense/income*100:null;
 const potential=Math.max(0,income-expense);
 document.getElementById('expenseRate').textContent=rate===null?'—':rate.toFixed(1).replace('.',',')+'%';
 document.getElementById('savingPotential').textContent=income>0?fmt(potential):'—';
 const label=document.getElementById('diagnosisLabel');
 const summary=document.getElementById('assistantSummary');
 if(income===0&&expense===0){
  label.textContent='Aguardando dados';summary.textContent='Registre receitas e despesas do mês para receber um diagnóstico. As análises são calculadas no próprio aparelho e não usam IA externa nem consultam seu banco.'; 
 }else if(income===0){
  label.textContent='Dados incompletos';summary.textContent='Há despesas registradas, mas nenhuma receita neste mês. Registre suas entradas para calcular a taxa de despesas e o potencial de economia.';
 }else{
  label.textContent=rate<=70?'Dentro do planejado':rate<=90?'Atenção ao orçamento':'Gastos elevados';
  summary.textContent=rate<=70?'As despesas registradas consomem até 70% das receitas. Se esses dados estiverem completos, há espaço para direcionar parte do saldo a objetivos.':rate<=90?'Boa parte da receita já está comprometida. Revise gastos variáveis e confira se todos os lançamentos foram registrados.':'As despesas estão consumindo mais de 90% das receitas. Priorize despesas essenciais e evite assumir novos compromissos antes de revisar o orçamento.';
 }
 const totals={};data.transactions.filter(t=>t.accountScope!=='business'&&t.type==='expense').forEach(t=>totals[t.category]=(totals[t.category]||0)+t.amount);
 const cats=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
 document.getElementById('categoryCount').textContent=cats.length+' categorias';
 document.getElementById('categoryAnalysis').innerHTML=cats.length?cats.map(([cat,val])=>`<div class="ai-item"><span>${escapeHTML(cat)}</span><b>${fmt(val)}</b></div>`).join(''):'<div class="finance-empty">Ainda não há despesas suficientes para analisar.</div>';
 document.getElementById('planTarget').value=data.plan.target??'';
 document.getElementById('planCurrent').value=data.plan.current??'';
 document.getElementById('planMonthly').value=data.plan.monthly??'';
}







function toast(msg){let t=document.getElementById('toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2100)}
let editId=null;
function openModal(ch){editId=ch?.id||null;document.getElementById('modalTitle').textContent=ch?'Editar meta':'Nova meta';document.getElementById('fName').value=ch?.name||'';document.getElementById('fTarget').value=ch?.target||'';document.getElementById('fDuration').value=String(ch?.duration||30);document.getElementById('fFrequency').value=ch?.frequency||'weekly';document.getElementById('fDeposits').value=ch?.deposits.map(d=>d.value).join(', ')||'';document.getElementById('fPattern').value=ch?.pattern||'ascending';document.getElementById('modal').classList.add('open')}
function generateProgressiveDeposits(target,count,pattern){
 const total=Math.round(Number(target)*100);count=Math.max(1,Math.floor(count));
 if(pattern==='equal'){const base=Math.floor(total/count),rem=total-base*count;return {values:Array.from({length:count},(_,i)=>(base+(i<rem?1:0))/100),adjusted:false}}
 if(count===1)return {values:[total/100],adjusted:false};
 // Se o total for baixo demais para uma progressão estrita, reduz a quantidade de parcelas.
 let adjusted=false;while(count>1 && total<count*(count+1)/2){count--;adjusted=true;}
 const triangular=count*(count-1)/2;
 const maxStep=Math.floor((total-count)/Math.max(1,triangular));
 const step=Math.max(1,Math.floor(maxStep/2));
 const first=Math.floor((total-step*triangular)/count);
 const remainder=total-(count*first+step*triangular);
 let ascending=Array.from({length:count},(_,i)=>first+step*i+(i>=count-remainder?1:0));
 if(pattern==='descending')ascending.reverse();
 return {values:ascending.map(c=>c/100),adjusted};
}
function closeModal(){document.getElementById('modal').classList.remove('open')}
document.getElementById('newChallenge').onclick=()=>openModal();document.getElementById('navCreate').onclick=()=>openModal();
document.getElementById('cancelModal').onclick=closeModal;
document.getElementById('saveChallenge').onclick=()=>{
 const name=document.getElementById('fName').value.trim(),target=Number(document.getElementById('fTarget').value);
 const duration=Number(document.getElementById('fDuration').value),frequency=document.getElementById('fFrequency').value,pattern=document.getElementById('fPattern').value;
 const rawDeposits=document.getElementById('fDeposits').value.trim();
 let values=rawDeposits?rawDeposits.split(',').map(x=>Number(x.trim())).filter(x=>Number.isFinite(x)&&x>0):[];
 if(!name||target<=0||!Number.isFinite(duration)||duration<1){toast('Preencha nome, meta e prazo válidos.');return}
 if(!values.length){const count=frequency==='daily'?duration:frequency==='weekly'?Math.ceil(duration/7):Math.ceil(duration/30);const generated=generateProgressiveDeposits(target,count,pattern);values=generated.values;if(generated.adjusted)toast('A quantidade de depósitos foi ajustada para manter valores diferentes e progressivos.')}
 if(rawDeposits && Math.abs(values.reduce((a,b)=>a+b,0)-target)>0.009){toast('A soma dos depósitos personalizados precisa ser igual ao valor da meta.');return}
 if(editId){const c=data.challenges.find(x=>x.id===editId);c.name=name;c.target=target;c.duration=duration;c.frequency=frequency;c.pattern=pattern;c.deposits=values.map((v,i)=>({value:v,done:c.deposits[i]?.done||false}))}
 else{const id='custom-'+Date.now();data.challenges.push({id,name,target,duration,frequency,pattern,level:1,theme:'Meta personalizada',deposits:values.map(value=>({value,done:false}))});data.active=id}
 closeModal();save();toast('Meta salva!');
};
document.getElementById('editChallenge').onclick=()=>openModal(selected());
document.getElementById('addDeposit').onclick=()=>{const ch=selected();const value=Number(prompt('Qual valor você guardou hoje? (R$)'));if(Number.isFinite(value)&&value>0){ch.deposits.push({value,done:true});save();toast('Depósito registrado!')}};

document.getElementById('addRecurring').onclick=()=>{
 const name=document.getElementById('billName').value.trim();
 const amount=Number(document.getElementById('billAmount').value);
 const day=Number(document.getElementById('billDay').value);
 const type=document.getElementById('billType').value;
 const category=document.getElementById('billCategory').value;
 if(!name||!Number.isFinite(amount)||amount<=0||!Number.isInteger(day)||day<1||day>31){toast('Confira descrição, valor e dia do vencimento.');return}
 data.recurringBills.push({id:'bill-'+Date.now(),name,amount:Math.round(amount*100)/100,day,type,category,active:true,paidMonths:[]});
 document.getElementById('billName').value='';document.getElementById('billAmount').value='';
 save();toast('Recorrência adicionada!');
};

document.getElementById('txDate').value=new Date().toISOString().slice(0,10);
document.getElementById('saveTransaction').onclick=()=>{
 const type=document.getElementById('txType').value;
 const amount=Number(document.getElementById('txAmount').value);
 const description=document.getElementById('txDescription').value.trim();
 const category=document.getElementById('txCategory').value;
 const date=document.getElementById('txDate').value;
 if(!Number.isFinite(amount)||amount<=0||!description||!date){toast('Informe valor, descrição e data válidos.');return}
 data.transactions.push({id:Date.now(),type,amount:Math.round(amount*100)/100,description,category,date});
 document.getElementById('txAmount').value='';document.getElementById('txDescription').value='';
 save();toast('Lançamento registrado!');
};
document.getElementById('calculatePlan').onclick=()=>{
 const target=Number(document.getElementById('planTarget').value);
 const current=Number(document.getElementById('planCurrent').value||0);
 const monthly=Number(document.getElementById('planMonthly').value);
 if(!Number.isFinite(target)||target<=0||!Number.isFinite(current)||current<0||!Number.isFinite(monthly)||monthly<=0){toast('Preencha valores válidos para calcular.');return}
 data.plan={target,current,monthly};
 const remaining=Math.max(0,target-current),months=Math.ceil(remaining/monthly);
 const result=document.getElementById('planResult');result.hidden=false;
 document.getElementById('planResultText').textContent=remaining===0?'Você já alcançou ou ultrapassou o valor definido para esse objetivo.':`Faltam ${fmt(remaining)}. Guardando ${fmt(monthly)} por mês, você pode alcançar a meta em aproximadamente ${months} ${months===1?'mês':'meses'}, sem considerar rendimentos, inflação ou mudanças nos depósitos.`;
 localStorage.setItem('fortuna-v1',JSON.stringify(data));toast('Projeção calculada.');
};
document.getElementById('saveBudget').onclick=()=>{
 const category=document.getElementById('budgetCategory').value;
 const value=Number(document.getElementById('budgetAmount').value);
 if(!Number.isFinite(value)||value<=0){toast('Informe um limite mensal válido.');return}
 const key=currentMonthKey();if(!data.monthlyBudgets[key])data.monthlyBudgets[key]={};
 data.monthlyBudgets[key][category]=Math.round(value*100)/100;
 document.getElementById('budgetAmount').value='';save();toast('Limite mensal salvo!');
};

document.querySelectorAll('.navbtn[data-scroll]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.navbtn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');let id=b.dataset.scroll;if(id==='top')window.scrollTo({top:0,behavior:'smooth'});else document.getElementById(id==='levels'?'levels':id).scrollIntoView({behavior:'smooth'})});
// Backup local: exportação e restauração com validação básica.
document.getElementById('exportBackup').onclick=()=>{
 try{
  const payload={app:'FORTUNA',version:2,exportedAt:new Date().toISOString(),data};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`fortuna-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  document.getElementById('backupStatus').textContent='Backup criado. Guarde esse arquivo em um local seguro.';
  toast('Backup baixado!');
 }catch(e){document.getElementById('backupStatus').textContent='Não foi possível gerar o backup.'}
};
document.getElementById('importBackupBtn').onclick=()=>document.getElementById('importBackupFile').click();
document.getElementById('importBackupFile').onchange=async ev=>{
 const file=ev.target.files&&ev.target.files[0];if(!file)return;
 const status=document.getElementById('backupStatus');
 try{
  if(file.size>5*1024*1024)throw new Error('Arquivo maior que 5 MB. Verifique o backup.');
  const parsed=JSON.parse(await file.text());
  const candidate=parsed&&parsed.app==='FORTUNA'?parsed.data:parsed;
  if(!candidate||!Array.isArray(candidate.challenges)||!Array.isArray(candidate.transactions)||!candidate.active)throw new Error('Esse arquivo não parece ser um backup válido da FORTUNA.');
  if(!confirm('Restaurar este backup? Os dados atuais deste aparelho serão substituídos.'))return;
  data=candidate;
  if(!Array.isArray(data.transactions))data.transactions=[];
  if(!data.monthlyBudgets||typeof data.monthlyBudgets!=='object')data.monthlyBudgets={};
  if(!Array.isArray(data.recurringBills))data.recurringBills=[];
  if(!data.plan||typeof data.plan!=='object')data.plan={target:'',current:'',monthly:''};
  if(!Array.isArray(data.challenges))throw new Error('O backup não contém desafios válidos.');
  data.challenges=data.challenges.map(ch=>({...ch,deposits:(Array.isArray(ch.deposits)?ch.deposits:[]).map(d=>typeof d==='number'?({value:d,done:false}):d)}));
  if(!data.active||!data.challenges.some(ch=>ch.id===data.active))data.active=data.challenges[0]?.id;
  if(!data.active)throw new Error('O backup não contém uma meta ativa.');
  localStorage.setItem('fortuna-v1',JSON.stringify(data));
  status.textContent='Backup restaurado com sucesso neste aparelho.';
  render();toast('Backup restaurado!');
 }catch(e){status.textContent=e.message||'Não foi possível restaurar o backup.'}
 finally{ev.target.value=''}
};

// Mantém os módulos antigos ocultos para preservar compatibilidade com dados de versões anteriores; a experiência visível é focada em metas.
function hideLegacyBlock(startId,endId){const start=document.getElementById(startId),end=document.getElementById(endId);if(!start)return;let node=start;while(node&&node!==end){const next=node.nextElementSibling;node.style.display='none';node=next;}}
hideLegacyBlock('finances','challengeList');
hideLegacyBlock('budget','challengeList');
hideLegacyBlock('recurring','challengeList');
hideLegacyBlock('assistant','challengeList');

render();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
