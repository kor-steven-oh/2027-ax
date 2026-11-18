// The facade is traced in the photograph's 850 × 478 coordinate system.
function createBillboard(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const aperture = new Path2D('M110 148 L482 20 Q529 3 563 27 L680 139 L686 298 L616 317 Q564 301 503 303 L110 317 Z');
  const a = [[0,64],[29,0],[49,0],[78,64],[57,64],[52,52],[25,52],[20,64]];
  const counter = [[31,38],[46,38],[38.5,19]];
  const x = [[78,0],[102,0],[119,20],[136,0],[160,0],[131,32],[160,64],[136,64],[119,44],[102,64],[78,64],[107,32]];

  function trace(points) {
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
  }
  function panel(points,fill) {
    ctx.fillStyle=fill; ctx.beginPath(); trace(points); ctx.fill();
  }
  function gradient(x1,y1,x2,y2,stops) {
    const paint=ctx.createLinearGradient(x1,y1,x2,y2);
    stops.forEach(([position,color])=>paint.addColorStop(position,color));
    return paint;
  }
  function render(mx=0,my=0) {
    ctx.setTransform(canvas.width/850,0,0,canvas.height/478,0,0);
    ctx.clearRect(0,0,850,478);
    ctx.save(); ctx.clip(aperture);
    ctx.fillStyle='#1028ac'; ctx.fillRect(90,0,610,330);
    const vx=400-mx*13, vy=160-my*9;
    panel([[100,145],[520,7],[686,137],[vx+158,vy-64],[vx-186,vy-13]],
      gradient(250,52,315,162,[[0,'#455fff'],[.48,'#1936e3'],[1,'#09166b']]));
    panel([[100,145],[vx-186,vy-13],[vx-186,vy+78],[100,321]],
      gradient(103,180,221,180,[[0,'#2a45ef'],[1,'#101b83']]));
    panel([[vx-186,vy-13],[vx+158,vy-64],[vx+158,vy+71],[vx-186,vy+78]],
      gradient(256,105,470,245,[[0,'#132394'],[.52,'#09135e'],[1,'#172da7']]));
    panel([[vx+158,vy-64],[686,134],[692,307],[vx+158,vy+71]],
      gradient(540,152,683,194,[[0,'#0a197a'],[1,'#3449f2']]));
    panel([[100,321],[vx-186,vy+78],[vx+158,vy+71],[692,301],[635,327],[100,327]],
      gradient(360,228,382,314,[[0,'#172795'],[.52,'#2f45df'],[1,'#5271ff']]));

    // Perspective projection of extruded glyph outlines. The camera moves around their centre.
    const yaw=-.29+mx*.23, pitch=.075+my*.13;
    function project([u,v],z) {
      const px=(u-80)*2.05, py=(v-32)*2.05;
      const rx=px*Math.cos(yaw)+z*Math.sin(yaw);
      const rz=z*Math.cos(yaw)-px*Math.sin(yaw);
      const ry=py*Math.cos(pitch)-rz*Math.sin(pitch);
      const depth=rz*Math.cos(pitch)+py*Math.sin(pitch);
      const zoom=620/(620-depth);
      return [417+rx*zoom+mx*5,182+(ry-.085*rx)*zoom+my*3];
    }
    const rings=[a,counter,x];
    ctx.save(); ctx.filter='blur(7px)'; ctx.fillStyle='#02092d'; ctx.globalAlpha=.72;
    ctx.beginPath();
    for(const ring of rings) trace(ring.map(p=>{const [sx,sy]=project(p,-52);return [sx+15-mx*5,sy+14-my*4]}));
    ctx.fill('evenodd'); ctx.restore();
    const faces=[];
    for(const ring of rings) {
      for(let i=0;i<ring.length;i++) {
        const p=ring[i], q=ring[(i+1)%ring.length];
        const dx=q[0]-p[0], dy=q[1]-p[1];
        const light=(.5*dy-.85*dx)/Math.hypot(dx,dy);
        faces.push({depth:-(p[0]+q[0]-160)*Math.sin(yaw)+(p[1]+q[1]-64)*Math.sin(pitch),
          color:'hsl(231 68% '+(45+14*light)+'%)',
          points:[project(p,-43),project(q,-43),project(q,6),project(p,6)]});
      }
    }
    faces.sort((l,r)=>l.depth-r.depth).forEach(f=>panel(f.points,f.color));
    ctx.beginPath(); for(const ring of rings) trace(ring.map(p=>project(p,6)));
    ctx.fillStyle=gradient(280,100,510,265,[[0,'#fffffa'],[.58,'#ebefff'],[1,'#c5d0ff']]); ctx.fill('evenodd');
    ctx.fillStyle='#f8fbff'; ctx.textAlign='center';
    ctx.save(); ctx.transform(1,-.095,0,1,0,0); ctx.font='bold 24px Arial'; ctx.fillText('S.LSI',414,131); ctx.restore();
    ctx.save(); ctx.transform(1,-.022,0,1,0,0); ctx.font='bold 22px Arial'; ctx.fillText('Challenge 2027',420,291); ctx.restore();
    // A fixed LED pitch sits on the facade, independently of the virtual camera.
    ctx.fillStyle='rgba(9,19,75,.075)';
    for(let row=10; row<321; row+=1.6) ctx.fillRect(100,row,600,.36);
    ctx.restore();
  }
  render();
  return render;
}
