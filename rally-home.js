const courtRally = (() => {
  const hero = document.querySelector('[data-rally-hero]');
  if (!hero) return null;

  const canvas = hero.querySelector('[data-rally-court]');
  const court = canvas.getContext('2d');
  if (!court) return null;

  const opening = hero.querySelector('[data-rally-opening]');
  const profile = hero.querySelector('[data-rally-profile]');
  const profileTitle = profile.querySelector('h1');
  const hint = profile.querySelector('[data-rally-hint]');
  const serve = hero.querySelector('[data-rally-serve]');
  const returnButton = hero.querySelector('[data-rally-return]');
  const shuttleLink = hero.querySelector('[data-rally-shuttle]');
  const shuttleText = shuttleLink.querySelector('[data-rally-shuttle-text]');
  const shotCopy = hero.querySelector('[data-rally-shot-copy]');
  const shotDestination = shotCopy.querySelector('[data-rally-destination]');
  const cueTitle = shotCopy.querySelector('[data-rally-cue-title]');
  const cueAccent = shotCopy.querySelector('[data-rally-cue-accent]');
  const instruction = shotCopy.querySelector('[data-rally-instruction]');
  const replay = hero.querySelector('[data-rally-replay]');
  const chapter = hero.querySelector('[data-rally-chapter]');
  const status = hero.querySelector('[data-rally-status]');
  const skip = document.querySelector('[data-rally-skip]');
  const skipLink = document.querySelector('[data-rally-skip-link]');

  const serveWindup = 230;
  const serveDuration = 1530;
  const shotWindup = 260;
  const shotDuration = 1710;
  const releaseAngle = .47;
  const readyAngle = 1.04;
  const receiveAngle = .40;
  const racketReach = 43;
  const ivory = '#f6f4df';
  const lime = '#d9ee78';
  const server = {
    x: 500, direction: 1, grip: [37, -69],
    skin: '#bd8961', jersey: '#d0e97e', jerseyShadow: '#6a943d'
  };
  const receiver = {
    x: 0, direction: -1, grip: [43, -94],
    skin: '#d5a17d', jersey: '#f3edcc', jerseyShadow: '#91ad95'
  };
  const firstReturn = { hitter: receiver, destination: 'work', name: 'Portfolio', intro: true };
  const phaseLabels = {
    'serve-ready': '01 / FIRST SERVE',
    serving: '01 / SERVE IN FLIGHT',
    'return-ready': '02 / PLAYER READY',
    returning: '02 / SHOT IN FLIGHT',
    'shuttle-ready': '03 / SHUTTLE READY'
  };

  let scene;
  let phase;
  let shot = firstReturn;
  let elapsed = 0;
  let frame = 0;
  let started;

  const mix = (from, to, amount) => from + (to - from) * amount;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);

  function line(points, color, weight = 1) {
    court.beginPath();
    court.moveTo(...points[0]);
    points.slice(1).forEach(point => court.lineTo(...point));
    court.strokeStyle = color;
    court.lineWidth = weight;
    court.stroke();
  }

  function polygon(points, fill) {
    court.beginPath();
    court.moveTo(...points[0]);
    points.slice(1).forEach(point => court.lineTo(...point));
    court.closePath();
    court.fillStyle = fill;
    court.fill();
  }

  function oval(x, y, radiusX, radiusY, fill) {
    court.beginPath();
    court.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    court.fillStyle = fill;
    court.fill();
  }

  function verticalGradient(top, bottom, start, end) {
    const gradient = court.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    return gradient;
  }

  function lighting(x, camera) {
    const { width, height } = scene;
    const lampY = height * .205;
    const glow = court.createRadialGradient(x, height * .56, 12, x, height * .56, height * .7);
    glow.addColorStop(0, '#90c38d55');
    glow.addColorStop(1, '#80ba8900');
    court.fillStyle = glow;
    court.fillRect(camera, 0, width, height);
    polygon([
      [x - 39, lampY], [x + 39, lampY],
      [x + 279, height * .77], [x - 279, height * .77]
    ], verticalGradient(lampY, height * .77, '#d9ee7826', '#d9ee7800'));

    court.save();
    court.shadowBlur = 19;
    court.shadowColor = '#d9ee7890';
    line([[x - 38, lampY], [x + 38, lampY]], '#d8ecc5', 3);
    court.restore();
  }

  function net(x, back, front) {
    const near = x - 70;
    const far = x + 71;
    const topNear = front - 202;
    const topFar = back - 160;
    const bottomNear = front - 20;
    const bottomFar = back - 8;
    polygon([[near, topNear], [far, topFar], [far, bottomFar], [near, bottomNear]], '#0d291f9c');
    for (let i = 1; i < 10; i++) {
      const step = i / 10;
      line([
        [mix(near, far, step), mix(topNear, topFar, step)],
        [mix(near, far, step), mix(bottomNear, bottomFar, step)]
      ], '#c2dfc45b', 1);
      line([
        [near, mix(topNear, bottomNear, step)],
        [far, mix(topFar, bottomFar, step)]
      ], '#c2dfc45b', 1);
    }
    line([[near, topNear], [far, topFar]], '#ecf3d4', 3);
    line([[near, topNear - 4], [near, bottomNear + 3]], '#bacfba', 4);
    line([[far, topFar - 4], [far, bottomFar + 3]], '#bacfba', 3);
  }

  function arena(camera) {
    const { width, height } = scene;
    const back = height * .645;
    const front = height * .93;
    const nearLeft = server.x - 525;
    const nearRight = receiver.x + 525;
    const center = (server.x + receiver.x) / 2;

    court.fillStyle = verticalGradient(0, back, '#071d18', '#234a3a');
    court.fillRect(camera, 0, width, height);
    for (let x = Math.floor(camera / 112) * 112; x < camera + width; x += 112) {
      line([[x, height * .19], [x, back]], '#c5e9d018', 1);
    }
    line([[camera, back - 26], [camera + width, back - 26]], '#9dbba821', 1);
    lighting(server.x - 52, camera);
    lighting(receiver.x + 52, camera);

    court.fillStyle = verticalGradient(back, height, '#132d24', '#102c21');
    court.fillRect(camera, back, width, height - back);
    const boundary = [
      [nearLeft + 234, back], [nearRight - 234, back],
      [nearRight, front], [nearLeft, front]
    ];
    polygon(boundary, verticalGradient(back, front, '#41624a', '#345f49'));
    line([...boundary, boundary[0]], '#c0d5b9b3', 2);
    line([[nearLeft + 100, mix(front, back, .44)], [nearRight - 100, mix(front, back, .44)]], '#c0d5b98c', 1.5);
    line([[center - 152, back], [center - 216, front]], '#d9eccea1', 2);
    line([[center + 152, back], [center + 216, front]], '#d9eccea1', 2);
    line([[center + 71, back], [center - 70, front]], '#d9ecceab', 2);
    net(center, back, front);
  }

  function racket(angle) {
    court.rotate(angle);
    line([[0, 3], [0, -31]], ivory, 2.2);
    court.beginPath();
    court.ellipse(0, -racketReach, 10.4, 15.3, 0, 0, Math.PI * 2);
    court.fillStyle = '#2b4c3d';
    court.fill();
    court.strokeStyle = '#e0edce';
    court.lineWidth = 2.2;
    court.stroke();
    court.save();
    court.clip();
    for (let x = -8; x <= 8; x += 4) line([[x, -59], [x, -27]], '#d9e9cc91', .65);
    for (let y = -55; y <= -30; y += 4) line([[-11, y], [11, y]], '#d9e9cc91', .65);
    court.restore();
  }

  function player(person, angle, reach, lean) {
    const { x, direction, skin, jersey, jerseyShadow, grip } = person;
    const { ground, figure } = scene;
    court.save();
    court.translate(x, ground);
    court.scale(direction * figure, figure);
    court.lineCap = 'round';
    court.lineJoin = 'round';

    oval(4, 3, 48, 7, '#08241ab0');
    line([[-10, -67], [-23, -40], [-31, -10]], skin, 12);
    line([[5, -68], [20, -40], [22, -10]], skin, 12);
    line([[-10, -69], [-21, -49]], '#142b23', 17);
    line([[5, -68], [14, -50]], '#142b23', 18);
    line([[-22, -52], [-17, -57]], '#a4c095', 1.2);
    line([[17, -51], [13, -56]], '#a4c095', 1.2);
    line([[-31, -13], [-32, -6]], '#e8e8cf', 10);
    line([[22, -13], [22, -6]], '#e8e8cf', 10);
    line([[-34, -4], [-23, -4]], ivory, 8);
    line([[20, -4], [34, -4]], ivory, 8);
    line([[-35, -1], [-22, -1]], '#859678', 1.1);
    line([[18, -1], [34, -1]], '#859678', 1.1);

    const freeHand = [mix(22, 54, reach), mix(-82, -103, reach)];
    line([[-11 + lean, -112], [mix(-25, 14, reach), -97], freeHand], '#0d291e', 11);
    line([[-11 + lean, -112], [mix(-25, 14, reach), -97], freeHand], skin, 8);
    court.beginPath();
    court.moveTo(-14 + lean, -118);
    court.quadraticCurveTo(-25 + lean, -113, -20, -97);
    court.lineTo(-15, -68);
    court.quadraticCurveTo(-3, -62, 16, -68);
    court.lineTo(15 + lean, -105);
    court.quadraticCurveTo(10 + lean, -118, 2 + lean, -120);
    court.closePath();
    court.fillStyle = verticalGradient(-118, -65, jersey, jerseyShadow);
    court.fill();
    line([[-14, -79], [13, -72]], '#193c308a', 2.8);
    line([[-14, -76], [13, -69]], '#edf1cb78', .9);
    line([[1 + lean, -109], [17, mix(-91, -100, reach)], grip], '#132c22', 11.6);
    line([[1 + lean, -109], [17, mix(-91, -100, reach)], grip], skin, 8.7);

    line([[-3 + lean, -125], [-1 + lean, -115]], skin, 9);
    oval(1 + lean, -136, 11.5, 14, skin);
    oval(11 + lean, -135, 2.8, 2.1, skin);
    court.beginPath();
    court.moveTo(-9 + lean, -130);
    court.quadraticCurveTo(-17 + lean, -146, -4 + lean, -150);
    court.quadraticCurveTo(7 + lean, -154, 13 + lean, -141);
    court.quadraticCurveTo(10 + lean, -138, -2 + lean, -141);
    court.lineTo(-9 + lean, -130);
    court.closePath();
    court.fillStyle = '#14241b';
    court.fill();
    if (person === receiver) oval(-12 + lean, -138, 6.3, 5, '#14241b');
    oval(6 + lean, -136, 1.05, 1.05, '#1c2b21');

    court.translate(...grip);
    racket(angle);
    court.restore();
  }

  function racketCenter(person, angle) {
    return {
      x: person.x + person.direction * scene.figure * (person.grip[0] + Math.sin(angle) * racketReach),
      y: scene.ground + scene.figure * (person.grip[1] - Math.cos(angle) * racketReach)
    };
  }

  function flightPoint(from, to, progress) {
    const lift = scene.height * .265;
    return {
      x: mix(from.x, to.x, progress),
      y: mix(from.y, to.y, progress) - 4 * lift * progress * (1 - progress),
      rotation: Math.atan2(to.y - from.y - 4 * lift * (1 - 2 * progress), to.x - from.x)
    };
  }

  function shuttle({ x, y, rotation }) {
    court.save();
    court.translate(x, y);
    court.rotate(rotation);
    court.shadowColor = '#edff9aac';
    court.shadowBlur = 13;
    polygon([[-4, -3.7], [-24, -9], [-27, 0], [-24, 9], [-4, 3.7]], ivory);
    court.shadowBlur = 0;
    line([[-23, -6], [-7, -2]], '#5c7862', 1);
    line([[-24, 0], [-7, 0]], '#5c7862', 1);
    line([[-23, 6], [-7, 2]], '#5c7862', 1);
    oval(-1, 0, 5, 5, lime);
    court.restore();
  }

  function drawTrail(from, to, progress) {
    const trail = Array.from({ length: 12 }, (_, index) => {
      const sample = clamp(progress - .17 + index * .17 / 11);
      const point = flightPoint(from, to, sample);
      return [point.x, point.y];
    });
    line(trail, progress === 1 ? '#cdea8f45' : '#e5f3a5b5', 2);
  }

  function waitingShuttle(person) {
    const strings = racketCenter(person, receiveAngle);
    return { x: strings.x + person.direction * 26, y: strings.y + 3 };
  }

  function paintView(view) {
    const pixelScale = scene.scale * scene.pixelRatio * view.zoom;
    court.setTransform(pixelScale, 0, 0, pixelScale, -view.x * pixelScale, -view.y * pixelScale);
    arena(view.x);
  }

  function drawServe() {
    const progress = clamp((elapsed - serveWindup) / (serveDuration - serveWindup));
    const cameraX = mix(server.x, receiver.x, smooth(progress)) - scene.width * scene.anchor;
    paintView({ x: cameraX, y: 0, zoom: 1 });

    const swing = smooth(clamp(elapsed / serveWindup));
    const follow = Math.sin(Math.PI * clamp((elapsed - serveWindup) / 250));
    player(server, mix(readyAngle, releaseAngle, swing) - .47 * follow, 1 - clamp(progress * 4), 5 * follow);
    if (progress > 0) player(receiver, receiveAngle, .2, -1.5);

    const from = racketCenter(server, releaseAngle);
    if (progress === 0) {
      shuttle({ ...from, rotation: -.28 });
    } else {
      const to = waitingShuttle(receiver);
      drawTrail(from, to, progress);
      shuttle(flightPoint(from, to, progress));
    }
  }

  function shuttleView(point, zoom, playerAtThisEnd) {
    const xAnchor = scene.compact ? .5 + .09 * playerAtThisEnd.direction : .62;
    const yAnchor = scene.compact ? .52 : .45;
    const maxY = scene.height - scene.height / zoom;
    return {
      x: point.x - scene.width * xAnchor / zoom,
      y: Math.max(0, Math.min(maxY, point.y - scene.height * yAnchor / zoom)),
      zoom
    };
  }

  // Use the same projection for the canvas and the clickable HTML controls.
  function screenPoint(point, view) {
    const scale = scene.scale * view.zoom;
    return { x: (point.x - view.x) * scale, y: (point.y - view.y) * scale };
  }

  function placeReturnButton(hitter, view) {
    const head = screenPoint({ x: hitter.x, y: scene.ground - scene.figure * 155 }, view);
    const feet = screenPoint({ x: hitter.x, y: scene.ground }, view);
    const width = Math.max(156, Math.round(110 * scene.figure * scene.scale * view.zoom));
    const left = Math.max(12, Math.min(hero.clientWidth - width - 12, head.x - width / 2));
    const top = Math.max(82, head.y - 12);
    const bottom = Math.min(hero.clientHeight - 65, feet.y + 30);
    returnButton.style.left = left + 'px';
    returnButton.style.top = top + 'px';
    returnButton.style.width = width + 'px';
    returnButton.style.height = Math.max(52, bottom - top) + 'px';
  }

  function drawShot() {
    const hitter = shot.hitter;
    const target = hitter === server ? receiver : server;
    const from = waitingShuttle(hitter);
    const to = waitingShuttle(target);
    const previous = shot.intro ? racketCenter(server, releaseAngle) : to;
    const progress = phase === 'shuttle-ready' ? 1 : clamp((elapsed - shotWindup) / (shotDuration - shotWindup));
    const point = progress > 0 ? flightPoint(from, to, progress) : flightPoint(previous, from, 1);

    const start = shot.intro
      ? { x: hitter.x - scene.width * scene.anchor, y: 0, zoom: 1 }
      : shuttleView(from, scene.closeZoom, hitter);
    const zoomOut = smooth(clamp(progress / .32));
    const zoomIn = smooth(clamp((progress - .65) / .35));
    const zoom = mix(start.zoom, 1, zoomOut) + (scene.closeZoom - 1) * zoomIn;
    const tracked = shuttleView(point, zoom, target);
    const follow = smooth(clamp(progress / .28));
    const view = {
      x: mix(start.x, tracked.x, follow),
      y: Math.min(scene.height - scene.height / zoom, mix(start.y, tracked.y, follow)),
      zoom
    };
    paintView(view);

    if (progress < 1) {
      const windBack = smooth(clamp(elapsed / 95));
      const swing = smooth(clamp((elapsed - 95) / (shotWindup - 95)));
      const followThrough = Math.sin(Math.PI * clamp((elapsed - shotWindup) / 230));
      const angle = mix(mix(receiveAngle, -.38, windBack), .86, swing) + .6 * followThrough;
      player(hitter, angle, .2 + .55 * swing, -1.5 + 6 * swing);
    }
    if (progress > 0) player(target, receiveAngle, .2, -1.5);
    if (progress > 0) drawTrail(from, to, progress);
    else drawTrail(previous, from, 1);
    shuttle(point);

    if (phase === 'return-ready') placeReturnButton(hitter, view);
    if (phase === 'shuttle-ready') {
      const position = screenPoint(point, view);
      shuttleLink.style.left = position.x + 'px';
      shuttleLink.style.top = position.y + 'px';
    }
  }

  function draw() {
    if (!scene || !phase) return;
    if (phase === 'serve-ready' || phase === 'serving') drawServe();
    else drawShot();
  }

  function resize() {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(height / 720, width / 400);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const compact = width <= 760;
    const worldWidth = width / scale;
    scene = {
      width: worldWidth, height: height / scale, scale, pixelRatio, compact,
      anchor: compact ? .52 : .72,
      closeZoom: compact ? 1.27 : 1.6,
      ground: height * .80 / scale,
      figure: compact ? 1.66 : 2.12
    };
    receiver.x = server.x + Math.max(740, worldWidth * .80 + 140);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    draw();
  }

  function setPhase(next) {
    phase = next;
    document.body.dataset.rallyPhase = next;
    const firstServe = next === 'serve-ready';
    const playerReady = next === 'return-ready';
    const shuttleReady = next === 'shuttle-ready';
    const inFlight = next === 'serving' || next === 'returning';
    opening.hidden = !firstServe;
    serve.hidden = !firstServe;
    profile.hidden = !(shot.intro && playerReady);
    hint.hidden = !playerReady;
    returnButton.hidden = !playerReady;
    shuttleLink.hidden = !shuttleReady;
    shotCopy.hidden = !(shuttleReady || (!shot.intro && playerReady));
    replay.hidden = !(shot.intro && (playerReady || shuttleReady));
    skip.hidden = !(shot.intro && (firstServe || next === 'serving'));
    chapter.hidden = false;
    chapter.textContent = phaseLabels[next];

    cueTitle.textContent = shuttleReady ? 'TAKE THE' : 'YOUR';
    cueAccent.textContent = shuttleReady ? 'shuttle.' : 'shot.';
    instruction.textContent = shuttleReady
      ? 'Click the shuttle to open ' + shot.name + '.'
      : 'Click the waiting player to send the shuttle across the court.';
    status.textContent = inFlight ? 'The shuttle is in flight.' : shuttleReady || playerReady
      ? instruction.textContent
      : 'Ready to serve.';
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    phase = undefined;
    delete document.body.dataset.rallyPhase;
    skip.hidden = true;
  }

  function prepare(nextShot, firstServe, moveFocus) {
    stop();
    shot = nextShot;
    elapsed = 0;
    shotDestination.textContent = 'RALLY / ' + shot.name.toUpperCase();
    shuttleLink.href = '#' + shot.destination;
    shuttleText.textContent = 'Open ' + shot.name;
    setPhase(firstServe ? 'serve-ready' : 'return-ready');
    resize();
    if (moveFocus) (firstServe ? serve : returnButton).focus({ preventScroll: true });
  }

  function play(next) {
    started = undefined;
    elapsed = 0;
    setPhase(next);
    hero.focus({ preventScroll: true });
    frame = requestAnimationFrame(animate);
  }

  function animate(now) {
    started ??= now;
    elapsed = now - started;
    const serving = phase === 'serving';
    if (elapsed < (serving ? serveDuration : shotDuration)) {
      draw();
      frame = requestAnimationFrame(animate);
      return;
    }

    finishFlight(serving);
  }

  function finishFlight(serving) {
    // Hold the last frame until the visitor chooses the next action.
    cancelAnimationFrame(frame);
    frame = 0;
    elapsed = 0;
    setPhase(serving ? 'return-ready' : 'shuttle-ready');
    draw();
    (serving ? returnButton : shuttleLink).focus({ preventScroll: true });
  }

  function skipServe() {
    prepare(firstReturn, false, false);
    profileTitle.focus({ preventScroll: true });
  }

  serve.addEventListener('click', () => {
    if (phase === 'serve-ready') play('serving');
  });
  returnButton.addEventListener('click', () => {
    if (phase === 'return-ready') play('returning');
  });
  skip.addEventListener('click', skipServe);
  skipLink.addEventListener('click', event => {
    if (skipLink.hash !== '#profile-title') return;
    event.preventDefault();
    if (phase === 'serve-ready' || phase === 'serving') skipServe();
    else if (phase === 'returning') finishFlight(false);
    else (phase === 'shuttle-ready' ? shuttleLink : returnButton).focus({ preventScroll: true });
  });
  replay.addEventListener('click', () => prepare(firstReturn, true, true));
  canvas.hidden = false;
  new ResizeObserver(resize).observe(hero);

  return {
    openHome: (skipIntro, moveFocus) => prepare(firstReturn, !skipIntro, moveFocus),
    openShot: (destination, name, fromServer) => prepare({
      destination, name, hitter: fromServer ? server : receiver, intro: false
    }, false, true),
    stop
  };
})();
