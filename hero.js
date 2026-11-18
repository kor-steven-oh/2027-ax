(() => {
  const theater = document.querySelector('.theater');
  const picture = document.querySelector('.picture');
  const video = document.querySelector('video');
  const play = document.querySelector('#play');
  const skip = document.querySelector('#skip');
  const sound = document.querySelector('#sound');
  const track = document.querySelector('.track i');
  const clock = document.querySelector('#clock');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const draw = createBillboard(document.querySelector('#board'));
  let parked = false;
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;

  function move() {
    frame = 0;
    x += (targetX-x)*.17;
    y += (targetY-y)*.17;
    draw(x,y);
    if (Math.abs(x-targetX)+Math.abs(y-targetY) > .002) frame=requestAnimationFrame(move);
  }
  function aim(a,b) {
    if (!draw || motion.matches || !theater.classList.contains('live')) return;
    targetX=a; targetY=b;
    if (!frame) frame=requestAnimationFrame(move);
  }
  picture.addEventListener('keydown', e=>{
    const directions={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]};
    if(!directions[e.key]) return;
    e.preventDefault();
    const [dx,dy]=directions[e.key];
    aim(Math.max(-1,Math.min(1,targetX+dx)),Math.max(-1,Math.min(1,targetY+dy)));
  });
  picture.addEventListener('blur',()=>aim(0,0));
  picture.addEventListener('pointermove', e => {
    const bounds=picture.getBoundingClientRect();
    aim(2*(e.clientX-bounds.left)/bounds.width-1,2*(e.clientY-bounds.top)/bounds.height-1);
  });
  picture.addEventListener('pointerleave',()=>aim(0,0));
  picture.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse') aim(0,0)});

  function sync() {
    const time=parked ? 10 : video.currentTime;
    const live=parked || time>=8;
    theater.classList.toggle('live',live);
    theater.classList.toggle('playing',!video.paused);
    play.textContent=parked || video.ended ? '다시 재생' : video.paused ? '영상 재생' : '일시정지';
    picture.tabIndex=live && !motion.matches ? 0 : -1;
    skip.disabled=live;
    skip.textContent=live ? (motion.matches ? '전광판' : '포인터로 둘러보기') : '전광판 보기 ↗';
    clock.textContent='00:'+String(Math.floor(time)).padStart(2,'0')+' / 00:10';
    track.style.transform='scaleX('+Math.min(time/10,1)+')';
    sound.textContent=video.muted ? '소리 켜기' : '소리 끄기';
    sound.setAttribute('aria-pressed',String(!video.muted));
  }
  function park() { video.pause(); parked=true; sync() }
  async function start(restart=false) {
    if (restart || parked || video.ended) {
      parked=false; video.currentTime=0;
      cancelAnimationFrame(frame); frame=0; x=y=targetX=targetY=0; draw?.();
    }
    try { await video.play() } catch { sync() }
  }
  play.addEventListener('click',()=>{if(video.paused) start(); else video.pause()});
  skip.addEventListener('click',park);
  sound.addEventListener('click',()=>{
    video.muted=!video.muted;
    if (!video.muted && (video.paused || video.ended)) start(parked || video.ended);
    sync();
  });
  for(const event of ['timeupdate','pause','play','ended','volumechange','loadedmetadata']) video.addEventListener(event,sync);
  video.addEventListener('error',park);
  function respectMotion() {
    if(motion.matches) { cancelAnimationFrame(frame); frame=0; draw?.(); park() }
  }
  motion.addEventListener('change',respectMotion);
  if(motion.matches) respectMotion(); else start();
})();
