/** Inline HTML template for the globe.gl WebView. Replace __CONFIG__ before use. */
export const GLOBE_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#050e1f}
#g{width:100vw;height:calc(100vh - 56px)}
#ctrl{
  position:fixed;bottom:0;left:0;right:0;height:56px;
  background:rgba(8,14,34,0.92);backdrop-filter:blur(8px);
  display:flex;align-items:center;padding:0 20px;gap:14px;
  border-top:1px solid rgba(255,255,255,0.08);
}
#ctrl label{color:#6b7a99;font-size:11px;font-family:-apple-system,sans-serif;white-space:nowrap;text-transform:uppercase;letter-spacing:.04em}
#ctrl input[type=range]{flex:1;height:4px;-webkit-appearance:none;appearance:none;border-radius:2px;background:rgba(255,255,255,0.15);outline:none;cursor:pointer}
#ctrl input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#5B7BF0;box-shadow:0 0 6px rgba(91,123,240,0.6)}
#pct{color:#fff;font-size:13px;font-family:-apple-system,sans-serif;font-weight:700;min-width:38px;text-align:right}
</style>
</head>
<body>
<div id="g"></div>
<div id="ctrl">
  <label>Progress</label>
  <input id="sl" type="range" min="0" max="100" value="0">
  <span id="pct">0%</span>
</div>
<script src="https://cdn.jsdelivr.net/npm/globe.gl@2.32.0/dist/globe.gl.min.js"></script>
<script>
var BERLIN={lat:52.52,lng:13.405};
var DESTS={
  pt:{lat:38.716,lng:-9.139,color:'#1BCAA0',name:'Lissabon'},
  es:{lat:40.416,lng:-3.703,color:'#F5A623',name:'Madrid'},
  ch:{lat:46.948,lng:7.447,color:'#F87171',name:'Bern'},
};

function slerp(la1,ln1,la2,ln2,t){
  var r=Math.PI/180,deg=180/Math.PI;
  var p1=la1*r,l1=ln1*r,p2=la2*r,l2=ln2*r;
  var x1=Math.cos(p1)*Math.cos(l1),y1=Math.cos(p1)*Math.sin(l1),z1=Math.sin(p1);
  var x2=Math.cos(p2)*Math.cos(l2),y2=Math.cos(p2)*Math.sin(l2),z2=Math.sin(p2);
  var dot=Math.max(-1,Math.min(1,x1*x2+y1*y2+z1*z2));
  var o=Math.acos(dot);
  if(o<1e-10)return{lat:la1,lng:ln1};
  var s=Math.sin(o);
  var s1=Math.sin((1-t)*o)/s,s2=Math.sin(t*o)/s;
  var x=s1*x1+s2*x2,y=s1*y1+s2*y2,z=s1*z1+s2*z2;
  return{lat:deg*Math.atan2(z,Math.sqrt(x*x+y*y)),lng:deg*Math.atan2(y,x)};
}

var cfg=__CONFIG__;

function arcs(){
  var d=DESTS[cfg.country],a=[];
  var prs=Math.max(0,Math.min(1,cfg.progress));
  if(prs>0.01){
    var m=slerp(BERLIN.lat,BERLIN.lng,d.lat,d.lng,prs);
    a.push({sLat:BERLIN.lat,sLng:BERLIN.lng,eLat:m.lat,eLng:m.lng,
      col:[d.color,d.color],sw:2.5,dl:1,dg:0.01});
    a.push({sLat:m.lat,sLng:m.lng,eLat:d.lat,eLng:d.lng,
      col:[d.color+'55',d.color+'55'],sw:1.5,dl:0.35,dg:0.65});
  } else {
    a.push({sLat:BERLIN.lat,sLng:BERLIN.lng,eLat:d.lat,eLng:d.lng,
      col:[d.color+'55',d.color+'55'],sw:1.5,dl:0.35,dg:0.65});
  }
  return a;
}

function points(){
  var d=DESTS[cfg.country],pts=[],prs=Math.max(0,Math.min(1,cfg.progress));
  // Origin
  pts.push({lat:BERLIN.lat,lng:BERLIN.lng,col:'#5B7BF0',r:0.55,alt:0.01,lbl:'Berlin'});
  // Destination
  pts.push({lat:d.lat,lng:d.lng,col:d.color,r:0.65,alt:0.01,lbl:d.name});
  // Milestones
  var n=Math.max(1,cfg.totalFree||5);
  for(var i=0;i<n;i++){
    var t=(i+1)/(n+1);
    var pos=slerp(BERLIN.lat,BERLIN.lng,d.lat,d.lng,t);
    var done=prs>=t-0.01;
    pts.push({lat:pos.lat,lng:pos.lng,col:done?d.color:'#1e2840',
      r:done?0.32:0.25,alt:done?0.015:0.005,lbl:''+(i+1)});
  }
  // Plane at progress position
  if(prs>0.01&&prs<0.99){
    var pp=slerp(BERLIN.lat,BERLIN.lng,d.lat,d.lng,prs);
    pts.push({lat:pp.lat,lng:pp.lng,col:'#ffffff',r:0.45,alt:0.025,lbl:'',isPlane:true});
  }
  return pts;
}

var g=Globe({animateIn:false})(document.getElementById('g'));
g
  .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
  .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
  .atmosphereColor('#1a5fa0')
  .atmosphereAltitude(0.14)
  .width(window.innerWidth)
  .height(window.innerHeight-56)
  .arcsData(arcs())
  .arcStartLat(function(d){return d.sLat})
  .arcStartLng(function(d){return d.sLng})
  .arcEndLat(function(d){return d.eLat})
  .arcEndLng(function(d){return d.eLng})
  .arcColor(function(d){return d.col})
  .arcStroke(function(d){return d.sw})
  .arcDashLength(function(d){return d.dl})
  .arcDashGap(function(d){return d.dg})
  .arcDashAnimateTime(0)
  .arcAltitudeAutoScale(0.3)
  .pointsData(points())
  .pointLat(function(d){return d.lat})
  .pointLng(function(d){return d.lng})
  .pointColor(function(d){return d.col})
  .pointRadius(function(d){return d.r})
  .pointAltitude(function(d){return d.alt})
  .pointLabel(function(d){return d.lbl||''});

// Center on Europe with slight tilt toward routes
g.pointOfView({lat:49,lng:5,altitude:1.85},1800);
var ctrl=g.controls();
ctrl.autoRotate=false;
ctrl.enableZoom=true;
ctrl.minDistance=220;
ctrl.maxDistance=900;
ctrl.enablePan=false;

function refresh(){g.arcsData(arcs()).pointsData(points())}

window.updateGlobe=function(c){Object.assign(cfg,c);refresh();};

// Demo slider
var sl=document.getElementById('sl');
var pctEl=document.getElementById('pct');
sl.value=Math.round(cfg.progress*100);
pctEl.textContent=sl.value+'%';
sl.addEventListener('input',function(){
  pctEl.textContent=sl.value+'%';
  cfg.progress=parseInt(sl.value)/100;
  refresh();
});
</script>
</body>
</html>`;

export function buildGlobeHtml(config: {
  country: string;
  progress: number;
  doneCount: number;
  totalFree: number;
}): string {
  return GLOBE_HTML_TEMPLATE.replace('__CONFIG__', JSON.stringify(config));
}
