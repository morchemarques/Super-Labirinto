// Super Labirinto - servidor local de salas. Sem dependências: node server.js
const http=require('http'),fs=require('fs'),os=require('os'),path=require('path');
const PORT=+process.env.PORT||3000,rooms={};
const FILES={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/sw.js':['sw.js','text/javascript'],'/manifest.webmanifest':['manifest.webmanifest','application/manifest+json'],'/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png']};
function send(rm,from,m){const d='data: '+JSON.stringify(m)+'\n\n';for(const k in rm.cl)if(k!==from)rm.cl[k].write(d)}
const srv=http.createServer((q,s)=>{
  const u=new URL(q.url,'http://x'),r=u.searchParams.get('r'),c=u.searchParams.get('c');
  if(u.pathname==='/ev'){
    let rm=rooms[r];
    if(u.searchParams.get('h')){if(rm){s.writeHead(409).end();return}rm=rooms[r]={cl:{},host:c}}
    else if(!rm||Object.keys(rm.cl).length>=8){s.writeHead(404).end();return}
    s.socket.setNoDelay(true);
    s.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});
    s.write('retry: 1000\n\ndata: {"t":"hi"}\n\n');rm.cl[c]=s;
    s.on('close',()=>{delete rm.cl[c];if(rm.host===c){send(rm,c,{t:'end'});delete rooms[r]}else send(rm,c,{t:'bye',c})});
    return}
  if(u.pathname==='/m'&&q.method==='POST'){let b='';
    q.on('data',d=>{b+=d;if(b.length>1e5)q.destroy()});
    q.on('end',()=>{const rm=rooms[r];if(rm&&rm.cl[c]){try{const m=JSON.parse(b);m.f=c;send(rm,c,m)}catch(e){}}s.writeHead(204).end()});return}
  if(u.pathname==='/ip'){const ips=[];for(const l of Object.values(os.networkInterfaces()))for(const i of l)if(i.family==='IPv4'&&!i.internal)ips.push(i.address);
    s.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ips,port:PORT}));return}
  const f=FILES[u.pathname];
  if(f)fs.readFile(path.join(__dirname,f[0]),(e,d)=>e?s.writeHead(404).end():s.writeHead(200,{'Content-Type':f[1]}).end(d));
  else s.writeHead(404).end();
});
srv.listen(PORT,'0.0.0.0',()=>{console.log('Super Labirinto rodando. Abra no anfitrião:');
  console.log('  http://localhost:'+PORT);
  for(const l of Object.values(os.networkInterfaces()))for(const i of l)if(i.family==='IPv4'&&!i.internal)console.log('  Amigos no mesmo Wi-Fi: http://'+i.address+':'+PORT)});
module.exports=srv;
