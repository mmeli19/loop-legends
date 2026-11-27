const fs=require('fs'),postcss=require('postcss'),prefixer=require('postcss-prefix-selector');
function scope(file,cls,out){
  const css=fs.readFileSync(file,'utf8');
  const res=postcss().use(prefixer({prefix:'.'+cls,transform(prefix,sel){
    sel=sel.trim();
    if(sel==='html')return prefix;
    if(sel.startsWith(':root:not([data-theme="light"])'))return prefix+sel.slice(':root:not([data-theme="light"])'.length);
    if(sel.startsWith(':root[data-theme="dark"]'))return prefix+'[data-theme="dark"]'+sel.slice(':root[data-theme="dark"]'.length);
    if(sel.startsWith(':root'))return prefix+sel.slice(5);
    if(sel==='body')return prefix;
    if(sel.startsWith('body'))return prefix+sel.slice(4);
    return prefix+' '+sel;
  }})).process(css).css;
  fs.writeFileSync(out,res);
}
scope('app/students/legacy.css','ll-s','app/students/students.css');
scope('app/teachers/legacy.css','ll-t','app/teachers/teachers.css');
