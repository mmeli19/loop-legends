const fs=require('fs');
function scriptOf(f){const s=fs.readFileSync(f,'utf8');const a=s.indexOf('<script>')+8;return s.slice(a,s.indexOf('</script>',a));}
function cssOf(f){const s=fs.readFileSync(f,'utf8');const a=s.lastIndexOf('<style>')+7;return s.slice(a,s.indexOf('</style>',a));}
const src='/home/claude/loop-legends/';
let st=scriptOf(src+'student/index.html'); st=st.slice(0,st.indexOf('const KEY='));
const S=new Function(st+'\nreturn {UNITS,BUGS,ORDERS};')();
let te=scriptOf(src+'teacher/index.html'); te=te.slice(0,te.indexOf('const KEY='));
const T=new Function(te+'\nreturn {DOMAINS,Q,CARDS};')();
fs.writeFileSync('lib/student/content.json',JSON.stringify(S,null,1));
fs.writeFileSync('lib/teacher/content.json',JSON.stringify(T,null,1));
fs.writeFileSync('app/students/legacy.css',cssOf(src+'student/index.html'));
fs.writeFileSync('app/teachers/legacy.css',cssOf(src+'teacher/index.html'));
console.log('units',S.UNITS.length,'qs',S.UNITS.reduce((a,u)=>a+u.qs.length,0),'bugs',S.BUGS.length,'orders',S.ORDERS.length,'| T q',T.Q.length,'cards',T.CARDS.length,'domains',Object.keys(T.DOMAINS));
console.log('unit keys',Object.keys(S.UNITS[0]),'lesson keys',[...new Set(S.UNITS.flatMap(u=>u.lesson.flatMap(Object.keys)))],'q keys',[...new Set(S.UNITS.flatMap(u=>u.qs.flatMap(Object.keys)))]);
console.log('bug sample',JSON.stringify(S.BUGS[0]).slice(0,400));console.log('order sample',JSON.stringify(S.ORDERS[0]).slice(0,300));
console.log('Q keys',[...new Set(T.Q.flatMap(Object.keys))],'card keys',Object.keys(T.CARDS[0]),'domain',JSON.stringify(T.DOMAINS[1]));
const q=S.UNITS.flatMap(u=>u.qs).find(q=>typeof q.c==='object'&&!Array.isArray(q.c));console.log('lang q sample',JSON.stringify(q).slice(0,300));
