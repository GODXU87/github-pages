import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=fileURLToPath(new URL('.',import.meta.url));
const PORT=Number(process.env.PORT||3000);
const allowed=/^[A-Z0-9.\-^=]{1,20}$/i;
const yahooHosts=['query1.finance.yahoo.com','query2.finance.yahoo.com'];
let stockUniverseCache={stocks:[],at:0,complete:false};

function taiwanInfo(symbol){
  const m=String(symbol).toUpperCase().match(/^(\d{4,6})\.(TW|TWO)$/);
  if(!m)return null;
  return {code:m[1],board:m[2]==='TWO'?'otc':'tse'};
}
function parseTwseTime(date,time){
  if(!/^\d{8}$/.test(date||'')||!/^\d{2}:\d{2}:\d{2}/.test(time||''))return Date.now();
  const iso=`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T${time.slice(0,8)}+08:00`;
  const t=Date.parse(iso);return Number.isFinite(t)?t:Date.now();
}
async function fetchJson(url,headers={},timeout=2400){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{const res=await fetch(url,{headers,signal:controller.signal});if(!res.ok)throw new Error(`upstream ${res.status}`);return await res.json()}finally{clearTimeout(timer)}
}
async function yahooQuote(symbol){
  let data,lastError;
  for(const host of yahooHosts){
    try{
      data=await fetchJson(`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`,{'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*','Accept-Language':'zh-TW,zh;q=0.9,en;q=0.7'},2400);
      break;
    }catch(e){lastError=e}
  }
  if(!data)throw lastError||new Error('unavailable');
  const result=data?.chart?.result?.[0];if(!result)throw new Error('no quote');
  const meta=result.meta||{},closes=(result.indicators?.quote?.[0]?.close||[]).filter(n=>typeof n==='number'&&Number.isFinite(n));
  const price=Number(meta.regularMarketPrice??closes[closes.length-1]),previousClose=Number(meta.chartPreviousClose??meta.previousClose??closes[0]);
  if(!Number.isFinite(price))throw new Error('invalid price');
  const change=Number.isFinite(previousClose)?price-previousClose:0;
  return {symbol,price,previousClose:Number.isFinite(previousClose)?previousClose:null,change,changePercent:previousClose?(change/previousClose)*100:0,currency:meta.currency||'',marketState:meta.marketState||'',spark:closes.slice(-30),updatedAt:Number(meta.regularMarketTime)?Number(meta.regularMarketTime)*1000:Date.now(),feed:'chart'};
}
async function twseQuote(symbol){
  const info=taiwanInfo(symbol);if(!info)throw new Error('not taiwan');
  const ex=`${info.board}_${info.code}.tw`;
  const data=await fetchJson(`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(ex)}&json=1&delay=0`,{'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*','Referer':`https://mis.twse.com.tw/stock/fibest.jsp?stock=${info.code}`,'Accept-Language':'zh-TW,zh;q=0.9'},2200);
  const row=data?.msgArray?.[0];if(!row)throw new Error('no twse quote');
  const previousClose=Number(row.y),candidate=[row.z,row.a?.split('_')?.[0],row.b?.split('_')?.[0]].map(Number).find(Number.isFinite);
  const price=Number(candidate);if(!Number.isFinite(price)||price<=0)throw new Error('invalid twse price');
  const change=Number.isFinite(previousClose)?price-previousClose:0;
  let spark=[];try{spark=(await yahooQuote(symbol)).spark||[]}catch{}
  return {symbol,price,previousClose:Number.isFinite(previousClose)?previousClose:null,change,changePercent:previousClose?(change/previousClose)*100:0,currency:'TWD',marketState:'REGULAR',spark,updatedAt:parseTwseTime(row.d,row.t),feed:'twse-mis'};
}
async function getQuote(symbol){
  const work=(async()=>{if(taiwanInfo(symbol)){try{return await twseQuote(symbol)}catch{}}return yahooQuote(symbol)})();
  return Promise.race([work,new Promise((_,reject)=>setTimeout(()=>reject(new Error('deadline')),6500))]);
}

function firstNonEmpty(row,keys){
  for(const k of keys){const v=row?.[k];if(v!==undefined&&v!==null&&String(v).trim())return String(v).trim()}
  return '';
}
function findByKey(row,re){
  for(const [k,v] of Object.entries(row||{})){if(re.test(k)&&v!==undefined&&v!==null&&String(v).trim())return String(v).trim()}
  return '';
}
function normalizeStockRows(rows,market){
  const out=[];
  for(const row of Array.isArray(rows)?rows:[]){
    let code=firstNonEmpty(row,['公司代號','證券代號','Code','code','SecuritiesCompanyCode','SecuritiesCode','StockNo','StockCode']);
    if(!code)code=findByKey(row,/(公司代號|證券代號|securities.*code|stock.*(no|code)|^code$)/i);
    code=String(code||'').trim();
    if(!/^\d{4,6}$/.test(code))continue;
    let name=firstNonEmpty(row,['公司簡稱','公司名稱','證券名稱','Name','name','CompanyAbbreviation','CompanyName','SecuritiesCompanyName','StockName']);
    if(!name)name=findByKey(row,/(公司簡稱|公司名稱|證券名稱|company.*(abbr|name)|securities.*name|stock.*name|^name$)/i);
    name=String(name||code).trim();
    out.push({code,name,market,symbol:`${code}.${market==='上櫃'?'TWO':'TW'}`});
  }
  return out;
}
async function fetchAny(urls,headers){
  let last;
  for(const url of urls){try{return await fetchJson(url,headers,7000)}catch(e){last=e}}
  throw last||new Error('unavailable');
}
async function fetchStockUniverse(force=false){
  const now=Date.now();
  if(!force&&stockUniverseCache.complete&&stockUniverseCache.stocks.length&&now-stockUniverseCache.at<6*60*60*1000)return stockUniverseCache.stocks;
  const baseHeaders={'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*','Accept-Language':'zh-TW,zh;q=0.9,en;q=0.7'};
  const [l,o]=await Promise.allSettled([
    fetchAny([
      'https://openapi.twse.com.tw/v1/opendata/t187ap03_L',
      'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'
    ],baseHeaders),
    fetchAny([
      'https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O',
      'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes'
    ],{...baseHeaders,'Referer':'https://www.tpex.org.tw/'})
  ]);
  const listed=l.status==='fulfilled'?normalizeStockRows(l.value,'上市'):[];
  const otc=o.status==='fulfilled'?normalizeStockRows(o.value,'上櫃'):[];
  const map=new Map();
  for(const x of [...listed,...otc])map.set(x.symbol,x);
  const stocks=[...map.values()].sort((a,b)=>Number(a.code)-Number(b.code)||a.name.localeCompare(b.name,'zh-Hant'));
  const complete=listed.length>0&&otc.length>0;
  if(stocks.length){
    if(complete||!stockUniverseCache.stocks.length)stockUniverseCache={stocks,at:now,complete};
    else if(stockUniverseCache.complete)return stockUniverseCache.stocks;
    else stockUniverseCache={stocks,at:now,complete:false};
  }
  if(!stockUniverseCache.stocks.length)throw new Error('stock universe unavailable');
  return stockUniverseCache.stocks;
}
async function stocksHandler(req,res){
  try{
    const stocks=await fetchStockUniverse(false);
    const listed=stocks.filter(x=>x.market==='上市').length,otc=stocks.length-listed;
    res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=300, stale-while-revalidate=21600'});
    res.end(JSON.stringify({stocks,count:stocks.length,listed,otc,complete:stockUniverseCache.complete,fetchedAt:stockUniverseCache.at,source:'TWSE+TPEx official'}));
  }catch{
    res.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    res.end(JSON.stringify({error:'unavailable',stocks:[]}));
  }
}

async function quotesHandler(req,res,url){
  const raw=String(url.searchParams.get('symbols')||'2330.TW,0050.TW,NVDA,BTC-USD');
  const symbols=[...new Set(raw.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean))].slice(0,12);
  if(!symbols.length||symbols.some(s=>!allowed.test(s))){
    res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});return res.end(JSON.stringify({error:'invalid symbols'}));
  }
  const settled=await Promise.allSettled(symbols.map(getQuote));
  const quotes=settled.map((r,i)=>r.status==='fulfilled'?r.value:{symbol:symbols[i],error:'unavailable'});
  const feeds=[...new Set(quotes.map(q=>q.feed).filter(Boolean))];
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=10, stale-while-revalidate=45'});
  res.end(JSON.stringify({quotes,fetchedAt:Date.now(),source:feeds.join('+')||'unavailable'}));
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/quotes')return await quotesHandler(req,res,url);
    if(url.pathname==='/api/tw-stocks')return await stocksHandler(req,res);
    let pathname=url.pathname==='/'?'/index.html':url.pathname;
    pathname=normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const file=join(ROOT,pathname);
    if(!file.startsWith(ROOT)){res.writeHead(403);return res.end('Forbidden')}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
    res.end(data);
  }catch(e){
    try{
      const data=await readFile(join(ROOT,'index.html'));
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(data);
    }catch{res.writeHead(404);res.end('Not found')}
  }
});
server.listen(PORT,'0.0.0.0',()=>{console.log(`NOIRXU work-stock listening on ${PORT}`);fetchStockUniverse(true).then(stocks=>{const l=stocks.filter(x=>x.market==='上市').length,o=stocks.length-l;console.log(`TW stock universe ready: total=${stocks.length} listed=${l} otc=${o} complete=${stockUniverseCache.complete}`)}).catch(e=>console.error('TW stock universe preload failed:',e?.message||e))});
