const allowed=/^[A-Z0-9.\-^=]{1,20}$/i;
const yahooHosts=['query1.finance.yahoo.com','query2.finance.yahoo.com'];

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
async function fetchJson(url,headers={},timeout=2200){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{const res=await fetch(url,{headers,signal:controller.signal});if(!res.ok)throw new Error(`upstream ${res.status}`);return await res.json()}finally{clearTimeout(timer)}
}
async function fetchYahooChart(symbol,host){
  const url=`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
  return fetchJson(url,{'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*','Accept-Language':'zh-TW,zh;q=0.9,en;q=0.7'},2200);
}
async function yahooQuote(symbol){
  let data,lastError;
  for(const host of yahooHosts){try{data=await fetchYahooChart(symbol,host);break}catch(e){lastError=e}}
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
  const url=`https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(ex)}&json=1&delay=0`;
  const data=await fetchJson(url,{'User-Agent':'Mozilla/5.0','Accept':'application/json,text/plain,*/*','Referer':`https://mis.twse.com.tw/stock/fibest.jsp?stock=${info.code}`,'Accept-Language':'zh-TW,zh;q=0.9'},2000);
  const row=data?.msgArray?.[0];if(!row)throw new Error('no twse quote');
  const previousClose=Number(row.y),candidate=[row.z,row.a?.split('_')?.[0],row.b?.split('_')?.[0]].map(Number).find(Number.isFinite);
  const price=Number(candidate);if(!Number.isFinite(price)||price<=0)throw new Error('invalid twse price');
  const change=Number.isFinite(previousClose)?price-previousClose:0;
  let spark=[];try{spark=(await yahooQuote(symbol)).spark||[]}catch{}
  return {symbol,price,previousClose:Number.isFinite(previousClose)?previousClose:null,change,changePercent:previousClose?(change/previousClose)*100:0,currency:'TWD',marketState:'REGULAR',spark,updatedAt:parseTwseTime(row.d,row.t),feed:'twse-mis'};
}
async function getQuote(symbol){
  const work=(async()=>{if(taiwanInfo(symbol)){try{return await twseQuote(symbol)}catch{}}return yahooQuote(symbol)})();
  return Promise.race([work,new Promise((_,reject)=>setTimeout(()=>reject(new Error('deadline')),6200))]);
}
export default async function handler(req,res){
  const raw=String(req.query?.symbols||'2330.TW,0050.TW,NVDA,BTC-USD'),symbols=[...new Set(raw.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean))].slice(0,12);
  if(!symbols.length||symbols.some(s=>!allowed.test(s)))return res.status(400).json({error:'invalid symbols'});
  res.setHeader('Cache-Control','s-maxage=12, stale-while-revalidate=45');
  const settled=await Promise.allSettled(symbols.map(getQuote));
  const quotes=settled.map((r,i)=>r.status==='fulfilled'?r.value:{symbol:symbols[i],error:'unavailable'});
  const feeds=[...new Set(quotes.map(q=>q.feed).filter(Boolean))];
  res.status(200).json({quotes,fetchedAt:Date.now(),source:feeds.join('+')||'unavailable'});
}
