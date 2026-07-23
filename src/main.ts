import {
    AppBase,
    AppOptions,
    Asset,
    CameraComponentSystem,
    Color,
    DEVICETYPE_WEBGPU,
    Entity,
    FILLMODE_FILL_WINDOW,
    GSplatComponentSystem,
    GSplatHandler,
    RESOLUTION_AUTO,
    TextureHandler,
    Vec3,
    createGraphicsDevice
} from 'playcanvas';
import type { BoundingBox } from 'playcanvas';

import './style.css';
import type { CameraPose } from './splat-config';
import { CAMERA_POSE, SPLAT_URL } from './splat-config';
import type { HotspotData } from './hotspots';
import { loadHotspots } from './hotspots';

const canvas = document.querySelector<HTMLCanvasElement>('#app');
const loader = document.querySelector<HTMLDivElement>('#loader');
const loaderMessage = document.querySelector<HTMLDivElement>('#loader-message');
const loaderProgressBar = document.querySelector<HTMLDivElement>('#loader-progress-bar');

if (!canvas) {
    throw new Error('Missing #app canvas');
}

const DEFAULT_FOV = 75;
const DEFAULT_CAMERA_DIRECTION = new Vec3(2, 1, 2).normalize();
const DEFAULT_PITCH = (Math.asin(DEFAULT_CAMERA_DIRECTION.y) * 180) / Math.PI;
const DEFAULT_YAW = (Math.atan2(DEFAULT_CAMERA_DIRECTION.x, DEFAULT_CAMERA_DIRECTION.z) * 180) / Math.PI;
const ORBIT_SENSITIVITY = (18 * 0.5) / 60;
const TRACKPAD_ORBIT_SENSITIVITY = (18 * 0.75) / 60;
const MOVE_SPEED = 4;
const FLY_MOVE_ACCELERATION_DAMPING = 0.992;
const FLY_MOVE_DECELERATION_DAMPING = 0.993;
const WHEEL_ZOOM_SPEED = 0.06 / 60;
const PINCH_ZOOM_SPEED = WHEEL_ZOOM_SPEED * 2;
const MIN_PITCH = -90;
const MAX_PITCH = 90;
const MIN_SCENE_RADIUS = 0.5;

type DragMode = 'orbit' | 'pan';

type OrbitState = {
    yaw: number;
    pitch: number;
    distance: number;
    target: Vec3;
    fov: number;
};

type CameraAnimation = {
    // Interpolated directly in world space (straight line position + target)
    // rather than through yaw/pitch/distance, which can otherwise swing the
    // camera through a wide, disorienting arc when the target jumps far.
    fromPosition: Vec3;
    toPosition: Vec3;
    fromTarget: Vec3;
    toTarget: Vec3;
    fromFov: number;
    toFov: number;
    // destination orbit state, applied once the flight completes so manual
    // orbit/pan/zoom can resume seamlessly from the same yaw/pitch/distance
    toYaw: number;
    toPitch: number;
    toDistance: number;
    startTime: number;
    duration: number;
    onComplete?: () => void;
};

const MOVEMENT_KEY_CODES = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyQ',
    'KeyE',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight'
]);

const setLoadingState = (message: string, progress?: number, failed = false) => {
    if (loaderMessage) {
        loaderMessage.textContent = message;
    }

    if (loaderProgressBar && progress !== undefined) {
        loaderProgressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    }

    if (loader) {
        loader.dataset.state = failed ? 'error' : 'loading';
    }
};

const hideLoader = () => {
    if (loader) {
        loader.dataset.hidden = 'true';
    }
};

const device = await createGraphicsDevice(canvas, {
    deviceTypes: [DEVICETYPE_WEBGPU],

    // Gaussian splats do not benefit from antialiasing and it is expensive.
    antialias: false
});
device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

const createOptions = new AppOptions();
createOptions.graphicsDevice = device;
createOptions.componentSystems = [CameraComponentSystem, GSplatComponentSystem];
createOptions.resourceHandlers = [TextureHandler, GSplatHandler];

const app = new AppBase(canvas);
app.init(createOptions);

app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);
app.start();

const camera = new Entity('Camera');
camera.addComponent('camera', {
    clearColor: new Color(0.02, 0.025, 0.035),
    fov: DEFAULT_FOV
});
app.root.addChild(camera);

const target = new Vec3(0, 0, 0);
const cameraPosition = new Vec3();
const forward = new Vec3();
const right = new Vec3();
const up = new Vec3();
const move = new Vec3();
const desiredMove = new Vec3();
const flyVelocity = new Vec3();
const nextTarget = new Vec3();
const worldAabbCenter = new Vec3();
const pressedKeys = new Set<string>();
let yaw = DEFAULT_YAW;
let pitch = DEFAULT_PITCH;
let distance = 3;
let fov = DEFAULT_FOV;
let sceneRadius = 1;
let dragMode: DragMode | null = null;
let activePointerId: number | null = null;
let lastPointerX = 0;
let lastPointerY = 0;
let isControlKeyDown = false;
let cameraAnim: CameraAnimation | null = null;
let defaultOrbitState: OrbitState | null = null;

const updateCameraPosition = () => {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const cosPitch = Math.cos(pitchRad);

    cameraPosition.set(
        target.x + distance * Math.sin(yawRad) * cosPitch,
        target.y + distance * Math.sin(pitchRad),
        target.z + distance * Math.cos(yawRad) * cosPitch
    );
};

const updateCamera = () => {
    updateCameraPosition();
    camera.setPosition(cameraPosition);
    camera.lookAt(target);
};

const getFrameDistance = (radius: number) => {
    const halfFovRad = (fov * Math.PI) / 360;
    return radius / Math.sin(halfFovRad);
};

const clampDistance = (value: number) => {
    const minDistance = Math.max(sceneRadius * 0.02, 0.02);
    const maxDistance = Math.max(sceneRadius * 40, 30);
    return Math.max(minDistance, Math.min(maxDistance, value));
};

const damp = (damping: number, dt: number) => 1 - Math.pow(damping, dt * 1000);

const setDefaultFrame = () => {
    target.set(0, 0, 0);
    sceneRadius = 1;
    yaw = DEFAULT_YAW;
    pitch = DEFAULT_PITCH;
    distance = getFrameDistance(sceneRadius);
    updateCamera();
};

const poseToOrbitState = (pose: CameraPose): OrbitState | null => {
    const dx = pose.position[0] - pose.target[0];
    const dy = pose.position[1] - pose.target[1];
    const dz = pose.position[2] - pose.target[2];
    const poseDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // a pose looking at its own position has no view direction
    if (!Number.isFinite(poseDistance) || poseDistance < 1e-6) {
        return null;
    }

    return {
        yaw: (Math.atan2(dx, dz) * 180) / Math.PI,
        pitch: (Math.asin(Math.max(-1, Math.min(1, dy / poseDistance))) * 180) / Math.PI,
        distance: poseDistance,
        target: new Vec3(pose.target[0], pose.target[1], pose.target[2]),
        fov: pose.fov
    };
};

const applyCameraPose = (pose: CameraPose) => {
    const state = poseToOrbitState(pose);
    if (!state) {
        return false;
    }

    target.copy(state.target);
    yaw = state.yaw;
    pitch = state.pitch;
    distance = state.distance;
    fov = state.fov;

    if (camera.camera) {
        camera.camera.fov = fov;
    }

    updateCamera();
    return true;
};

const CAMERA_FLY_DURATION = 600;

const orbitStateToPosition = (state: OrbitState, out = new Vec3()) => {
    const yawRad = (state.yaw * Math.PI) / 180;
    const pitchRad = (state.pitch * Math.PI) / 180;
    const cosPitch = Math.cos(pitchRad);

    return out.set(
        state.target.x + state.distance * Math.sin(yawRad) * cosPitch,
        state.target.y + state.distance * Math.sin(pitchRad),
        state.target.z + state.distance * Math.cos(yawRad) * cosPitch
    );
};

const flyToOrbitState = (state: OrbitState, duration = CAMERA_FLY_DURATION, onComplete?: () => void) => {
    cameraAnim = {
        fromPosition: camera.getPosition().clone(),
        toPosition: orbitStateToPosition(state),
        fromTarget: target.clone(),
        toTarget: state.target.clone(),
        fromFov: fov,
        toFov: state.fov,
        toYaw: state.yaw,
        toPitch: state.pitch,
        toDistance: state.distance,
        startTime: performance.now(),
        duration,
        onComplete
    };
};

const flyToPose = (pose: CameraPose, duration = CAMERA_FLY_DURATION, onComplete?: () => void) => {
    const state = poseToOrbitState(pose);
    if (!state) {
        onComplete?.();
        return;
    }
    flyToOrbitState(state, duration, onComplete);
};

const tickCameraAnimation = () => {
    if (!cameraAnim) {
        return;
    }

    const elapsed = performance.now() - cameraAnim.startTime;
    const t = Math.min(1, elapsed / cameraAnim.duration);
    // cubic ease-in-out: gentle start, fast middle, gentle settle
    const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

    // Straight line through world space (position + target), not an orbit
    // interpolation — lerping yaw/pitch/distance independently can swing the
    // camera through a wide arc when the target jumps, which reads as jerky.
    cameraPosition.lerp(cameraAnim.fromPosition, cameraAnim.toPosition, eased);
    target.lerp(cameraAnim.fromTarget, cameraAnim.toTarget, eased);
    fov = cameraAnim.fromFov + (cameraAnim.toFov - cameraAnim.fromFov) * eased;

    if (camera.camera) {
        camera.camera.fov = fov;
    }

    camera.setPosition(cameraPosition);
    camera.lookAt(target);

    if (t >= 1) {
        // resync yaw/pitch/distance so manual orbit/pan/zoom resumes cleanly
        yaw = cameraAnim.toYaw;
        pitch = cameraAnim.toPitch;
        distance = cameraAnim.toDistance;
        target.copy(cameraAnim.toTarget);

        const onComplete = cameraAnim.onComplete;
        cameraAnim = null;
        onComplete?.();
    }
};

const frameSplat = (splat: Entity, aabb?: BoundingBox) => {
    if (aabb) {
        splat.getWorldTransform().transformPoint(aabb.center, worldAabbCenter);
        target.copy(worldAabbCenter);
        sceneRadius = Math.max(aabb.halfExtents.length(), MIN_SCENE_RADIUS);
    } else {
        target.set(0, 0, 0);
        sceneRadius = 1;
    }

    yaw = DEFAULT_YAW;
    pitch = DEFAULT_PITCH;
    distance = clampDistance(getFrameDistance(sceneRadius));
    updateCamera();
};

const updateBasis = () => {
    updateCameraPosition();
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const cosPitch = Math.cos(pitchRad);

    forward.set(-Math.sin(yawRad) * cosPitch, -Math.sin(pitchRad), -Math.cos(yawRad) * cosPitch).normalize();
    right.set(Math.cos(yawRad), 0, -Math.sin(yawRad)).normalize();
    up.cross(right, forward).normalize();
};

const panTarget = (deltaX: number, deltaY: number) => {
    updateBasis();

    const height = canvas.clientHeight || window.innerHeight;
    const width = canvas.clientWidth || window.innerWidth;
    const halfHeight = distance * Math.tan((fov * Math.PI) / 360);
    const halfWidth = halfHeight * (width / height);

    nextTarget
        .copy(right)
        .mulScalar((-deltaX / width) * halfWidth * 2)
        .add(up.clone().mulScalar((deltaY / height) * halfHeight * 2));

    target.add(nextTarget);
    updateCamera();
};

canvas.addEventListener('pointerdown', (event) => {
    if (activePointerId !== null) {
        return;
    }

    cameraAnim = null;
    dragMode = event.button === 2 ? 'pan' : 'orbit';
    activePointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
    if (activePointerId !== event.pointerId || !dragMode) {
        return;
    }

    const deltaX = event.clientX - lastPointerX;
    const deltaY = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    if (dragMode === 'pan') {
        panTarget(deltaX, deltaY);
    } else {
        yaw -= deltaX * ORBIT_SENSITIVITY;
        pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch + deltaY * ORBIT_SENSITIVITY));
        updateCamera();
    }
});

const endPointerDrag = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) {
        return;
    }

    dragMode = null;
    activePointerId = null;

    if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
    }
};

canvas.addEventListener('pointerup', endPointerDrag);
canvas.addEventListener('pointercancel', endPointerDrag);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

canvas.addEventListener(
    'wheel',
    (event) => {
        event.preventDefault();
        cameraAnim = null;

        if (event.shiftKey) {
            panTarget(event.deltaX, event.deltaY);
            return;
        }

        if (event.ctrlKey && isControlKeyDown) {
            yaw -= event.deltaX * TRACKPAD_ORBIT_SENSITIVITY;
            pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch + event.deltaY * TRACKPAD_ORBIT_SENSITIVITY));
            updateCamera();
            return;
        }

        const zoomSpeed = event.ctrlKey ? PINCH_ZOOM_SPEED : WHEEL_ZOOM_SPEED;
        distance = clampDistance(distance * (1 + event.deltaY * zoomSpeed));
        updateCamera();
    },
    { passive: false }
);

window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.altKey) {
        return;
    }

    pressedKeys.add(event.code);

    if (MOVEMENT_KEY_CODES.has(event.code)) {
        cameraAnim = null;
    }

    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        isControlKeyDown = true;
    }
});

window.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.code);

    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        isControlKeyDown = false;
    }
});

window.addEventListener('blur', () => {
    pressedKeys.clear();
    isControlKeyDown = false;
});

const resize = () => app.resizeCanvas();
window.addEventListener('resize', resize);
app.on('destroy', () => {
    window.removeEventListener('resize', resize);
});

if (!CAMERA_POSE || !applyCameraPose(CAMERA_POSE)) {
    setDefaultFrame();
}

app.on('update', (dt) => {
    desiredMove.set(0, 0, 0);

    const strafe =
        Number(pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) -
        Number(pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft'));
    const lift = Number(pressedKeys.has('KeyE')) - Number(pressedKeys.has('KeyQ'));
    const advance =
        Number(pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) -
        Number(pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown'));

    if (strafe !== 0 || lift !== 0 || advance !== 0) {
        updateBasis();

        desiredMove.addScaled(right, strafe).addScaled(up, lift).addScaled(forward, advance);

        if (desiredMove.lengthSq() > 0) {
            const speedMultiplier =
                pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight')
                    ? 4
                    : pressedKeys.has('ControlLeft') || pressedKeys.has('ControlRight')
                      ? 0.25
                      : 1;

            desiredMove.normalize().mulScalar(MOVE_SPEED * speedMultiplier);
        }
    }

    const damping =
        desiredMove.lengthSq() > flyVelocity.lengthSq() ? FLY_MOVE_ACCELERATION_DAMPING : FLY_MOVE_DECELERATION_DAMPING;
    flyVelocity.lerp(flyVelocity, desiredMove, damp(damping, dt));

    if (desiredMove.lengthSq() === 0 && flyVelocity.lengthSq() < 1e-4) {
        flyVelocity.set(0, 0, 0);
    }

    if (flyVelocity.lengthSq() === 0) {
        return;
    }

    move.copy(flyVelocity).mulScalar(dt);
    target.add(move);
    updateCamera();
});

app.on('update', tickCameraAnimation);

// ---------------------------------------------------------------------------
// Hotspots
// ---------------------------------------------------------------------------

const ICON_DEFAULT = '/media/Info_default.png';
const ICON_SELECTED = '/media/Info_Selected.png';
const ICON_VISITED = '/media/Info_visited.png';
const VISITED_STORAGE_KEY = 'grand-courts.hotspots.visited';

type PlacedHotspot = {
    data: HotspotData;
    position: Vec3;
    el: HTMLButtonElement;
    imgEl: HTMLImageElement;
};

const hotspotsLayer = document.querySelector<HTMLDivElement>('#hotspots');
const popupEl = document.querySelector<HTMLDivElement>('#hotspot-popup');
const popupIconEl = document.querySelector<HTMLImageElement>('#hotspot-popup-icon');
const popupTitleEl = document.querySelector<HTMLDivElement>('#hotspot-popup-title');
const popupDescriptionEl = document.querySelector<HTMLParagraphElement>('#hotspot-popup-description');
const popupCloseBtn = document.querySelector<HTMLButtonElement>('#hotspot-popup-close');
const bodyGallery = document.querySelector<HTMLDivElement>('#hotspot-body-gallery');
const bodyVideo = document.querySelector<HTMLDivElement>('#hotspot-body-video');
const bodyPdf = document.querySelector<HTMLDivElement>('#hotspot-body-pdf');
const galleryImageEl = document.querySelector<HTMLImageElement>('#gallery-image');
const galleryCaptionEl = document.querySelector<HTMLSpanElement>('#gallery-caption');
const galleryCounterEl = document.querySelector<HTMLSpanElement>('#gallery-counter');
const galleryPrevBtn = document.querySelector<HTMLButtonElement>('#gallery-prev');
const galleryNextBtn = document.querySelector<HTMLButtonElement>('#gallery-next');
const videoEl = document.querySelector<HTMLVideoElement>('#hotspot-video');
const pdfFrameEl = document.querySelector<HTMLIFrameElement>('#hotspot-pdf');
const pdfLinkEl = document.querySelector<HTMLAnchorElement>('#hotspot-pdf-link');

const loadVisitedIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(VISITED_STORAGE_KEY);
        return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
        return new Set();
    }
};

const visitedIds = loadVisitedIds();
const saveVisitedIds = () => {
    try {
        localStorage.setItem(VISITED_STORAGE_KEY, JSON.stringify([...visitedIds]));
    } catch {
        // localStorage unavailable (private mode, etc.) — visited state just won't persist
    }
};

const placedHotspots: PlacedHotspot[] = [];
let activeHotspot: PlacedHotspot | null = null;
let hoveredHotspot: PlacedHotspot | null = null;
let galleryIndex = 0;

const refreshHotspotIcon = (hotspot: PlacedHotspot) => {
    const isHighlighted = hotspot === activeHotspot || hotspot === hoveredHotspot;
    hotspot.imgEl.src = isHighlighted
        ? ICON_SELECTED
        : visitedIds.has(hotspot.data.id)
          ? ICON_VISITED
          : ICON_DEFAULT;
    hotspot.el.classList.toggle('is-visited', !isHighlighted && visitedIds.has(hotspot.data.id));
    hotspot.el.classList.toggle('is-active', hotspot === activeHotspot);
};

const setGalleryImage = (hotspot: PlacedHotspot, index: number) => {
    const images = hotspot.data.images ?? [];
    if (images.length === 0 || !galleryImageEl || !galleryCaptionEl || !galleryCounterEl) {
        return;
    }

    galleryIndex = (index + images.length) % images.length;
    const image = images[galleryIndex];
    galleryImageEl.src = image.src;
    galleryImageEl.alt = image.caption;
    galleryCaptionEl.textContent = image.caption;
    galleryCounterEl.textContent = `${galleryIndex + 1} / ${images.length}`;
};

galleryPrevBtn?.addEventListener('click', () => {
    if (activeHotspot?.data.type === 'gallery') {
        setGalleryImage(activeHotspot, galleryIndex - 1);
    }
});

galleryNextBtn?.addEventListener('click', () => {
    if (activeHotspot?.data.type === 'gallery') {
        setGalleryImage(activeHotspot, galleryIndex + 1);
    }
});

const closePopup = () => {
    if (!popupEl || !activeHotspot) {
        return;
    }

    popupEl.dataset.open = 'false';

    if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
    }
    if (pdfFrameEl) {
        pdfFrameEl.src = 'about:blank';
    }

    const previous = activeHotspot;
    activeHotspot = null;
    refreshHotspotIcon(previous);
};

const openPopup = (hotspot: PlacedHotspot) => {
    if (!popupEl || !popupIconEl || !popupTitleEl || !popupDescriptionEl) {
        return;
    }

    if (activeHotspot && activeHotspot !== hotspot) {
        closePopup();
    }

    visitedIds.add(hotspot.data.id);
    saveVisitedIds();

    activeHotspot = hotspot;
    refreshHotspotIcon(hotspot);

    popupIconEl.src = ICON_SELECTED;
    popupTitleEl.textContent = hotspot.data.title;
    popupDescriptionEl.textContent = hotspot.data.description;

    bodyGallery?.classList.toggle('is-active', hotspot.data.type === 'gallery');
    bodyVideo?.classList.toggle('is-active', hotspot.data.type === 'video');
    bodyPdf?.classList.toggle('is-active', hotspot.data.type === 'pdf');

    if (hotspot.data.type === 'gallery') {
        setGalleryImage(hotspot, 0);
    } else if (hotspot.data.type === 'video' && videoEl && hotspot.data.videoUrl) {
        videoEl.src = hotspot.data.videoUrl;
    } else if (hotspot.data.type === 'pdf' && pdfFrameEl && pdfLinkEl && hotspot.data.pdfUrl) {
        pdfFrameEl.src = hotspot.data.pdfUrl;
        pdfLinkEl.href = hotspot.data.pdfUrl;
    }

    popupEl.dataset.open = 'true';
};

popupCloseBtn?.addEventListener('click', closePopup);
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePopup();
    }
});

const createHotspotElements = (hotspotsData: HotspotData[]) => {
    if (!hotspotsLayer) {
        return;
    }

    for (const data of hotspotsData) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'hotspot';
        el.dataset.hidden = 'true';
        el.setAttribute('aria-label', data.title);

        const imgEl = document.createElement('img');
        imgEl.src = ICON_DEFAULT;
        imgEl.alt = '';
        imgEl.setAttribute('aria-hidden', 'true');
        el.appendChild(imgEl);

        const hotspot: PlacedHotspot = { data, position: new Vec3(...data.position), el, imgEl };

        el.addEventListener('click', () => handleHotspotClick(hotspot));
        el.addEventListener('pointerenter', () => {
            hoveredHotspot = hotspot;
            refreshHotspotIcon(hotspot);
        });
        el.addEventListener('pointerleave', () => {
            if (hoveredHotspot === hotspot) {
                hoveredHotspot = null;
            }
            refreshHotspotIcon(hotspot);
        });

        refreshHotspotIcon(hotspot);
        hotspotsLayer.appendChild(el);
        placedHotspots.push(hotspot);
    }
};

const HOTSPOT_ZOOM_DISTANCE = 2.2;
const HOTSPOT_ZOOM_FOV = 55;

// Reasonable default "walk up to it" view until hotspots.ts entries carry
// their own authored cameraPose (e.g. from a Blender camera export).
const computeAutoCameraPose = (hotspotPos: Vec3): CameraPose => ({
    position: [
        hotspotPos.x + DEFAULT_CAMERA_DIRECTION.x * HOTSPOT_ZOOM_DISTANCE,
        hotspotPos.y + DEFAULT_CAMERA_DIRECTION.y * HOTSPOT_ZOOM_DISTANCE,
        hotspotPos.z + DEFAULT_CAMERA_DIRECTION.z * HOTSPOT_ZOOM_DISTANCE
    ],
    target: [hotspotPos.x, hotspotPos.y, hotspotPos.z],
    fov: HOTSPOT_ZOOM_FOV
});

const handleHotspotClick = (hotspot: PlacedHotspot) => {
    if (activeHotspot && activeHotspot !== hotspot) {
        closePopup();
    }

    // Open immediately — the camera keeps flying in behind it, but the user
    // shouldn't have to wait for the fly-in to see any content.
    const pose = hotspot.data.cameraPose ?? computeAutoCameraPose(hotspot.position);
    flyToPose(pose, CAMERA_FLY_DURATION);
    openPopup(hotspot);
};

const toHotspotVec = new Vec3();
const hotspotScreenPoint = new Vec3();

const POPUP_GAP = 20;

const positionPopup = (x: number, y: number, anchorEl: HTMLElement) => {
    if (!popupEl) {
        return;
    }

    const margin = 12;
    // offsetWidth/offsetHeight (not getBoundingClientRect) because the popup's
    // open/close transition scales it via CSS transform, which would otherwise
    // feed a transiently-shrunk size into the clamp math below.
    const width = popupEl.offsetWidth || 420;
    const height = popupEl.offsetHeight || 160;

    // x/y are the marker's center; offset from there by its own radius plus a
    // visual gap so the popup doesn't sit flush against the icon.
    const offset = anchorEl.offsetWidth / 2 + POPUP_GAP;

    // Anchor to the right of the marker by default; flip to the left side if
    // there isn't enough room before the viewport edge.
    const fitsRight = x + offset + width + margin <= window.innerWidth;
    popupEl.classList.toggle('flip-left', !fitsRight);
    popupEl.style.setProperty('--popup-tx', fitsRight ? `${offset}px` : `calc(-100% - ${offset}px)`);

    const minY = margin + height / 2;
    const maxY = Math.max(minY, window.innerHeight - margin - height / 2);
    const clampedY = Math.min(Math.max(y, minY), maxY);

    popupEl.style.setProperty('--popup-x', `${x}px`);
    popupEl.style.setProperty('--popup-y', `${clampedY}px`);
};

const updateHotspots = () => {
    if (placedHotspots.length === 0 || !camera.camera) {
        return;
    }

    const camPos = camera.getPosition();
    const camForward = camera.forward;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    for (const hotspot of placedHotspots) {
        toHotspotVec.sub2(hotspot.position, camPos);

        if (toHotspotVec.dot(camForward) <= 0) {
            hotspot.el.dataset.hidden = 'true';
            continue;
        }

        camera.camera.worldToScreen(hotspot.position, hotspotScreenPoint);

        const margin = 40;
        const onScreen =
            hotspotScreenPoint.x >= -margin &&
            hotspotScreenPoint.x <= width + margin &&
            hotspotScreenPoint.y >= -margin &&
            hotspotScreenPoint.y <= height + margin;

        if (!onScreen) {
            hotspot.el.dataset.hidden = 'true';
            continue;
        }

        hotspot.el.dataset.hidden = 'false';
        hotspot.el.style.left = `${hotspotScreenPoint.x}px`;
        hotspot.el.style.top = `${hotspotScreenPoint.y}px`;

        if (hotspot === activeHotspot) {
            positionPopup(hotspotScreenPoint.x, hotspotScreenPoint.y, hotspot.el);
        }
    }

    // Don't auto-close while the camera is flying in — the popup opens
    // immediately on click, before the fly-to finishes, and the interpolated
    // look-at can briefly sweep past the destination hotspot on the way
    // there. Once the flight lands, camera.lookAt(target) points straight at
    // it, so it's guaranteed on-screen again.
    if (activeHotspot && !cameraAnim && activeHotspot.el.dataset.hidden === 'true') {
        closePopup();
    }
};

try {
    const hotspotsData = await loadHotspots();
    createHotspotElements(hotspotsData);
} catch (error) {
    console.error('Failed to load hotspots.json', error);
}
app.on('update', updateHotspots);

// ---------------------------------------------------------------------------
// View controls (reset camera / fullscreen)
// ---------------------------------------------------------------------------

const resetViewBtn = document.querySelector<HTMLButtonElement>('#reset-view-btn');
const resetViewIcon = document.querySelector<HTMLImageElement>('#reset-view-icon');
const fullscreenBtn = document.querySelector<HTMLButtonElement>('#fullscreen-btn');
const fullscreenIcon = document.querySelector<HTMLImageElement>('#fullscreen-icon');

resetViewBtn?.addEventListener('click', () => {
    if (!defaultOrbitState) {
        return;
    }

    closePopup();
    flyToOrbitState(defaultOrbitState, CAMERA_FLY_DURATION);

    if (resetViewIcon) {
        resetViewIcon.src = '/media/Reset_active.svg';
        setTimeout(() => {
            resetViewIcon.src = '/media/Reset_default.svg';
        }, 300);
    }
});

fullscreenBtn?.addEventListener('click', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen().catch(() => {
            // fullscreen request denied/unsupported — icon stays in the default state
        });
    }
});

document.addEventListener('fullscreenchange', () => {
    if (fullscreenIcon) {
        fullscreenIcon.src = document.fullscreenElement ? '/media/Fullscreen_acitve.svg' : '/media/Fullscreen_default.svg';
    }
});

const filename = SPLAT_URL.split('/').pop() || 'splat';
const splatAsset = new Asset('SuperSplat', 'gsplat', {
    url: SPLAT_URL,
    filename
});

splatAsset.on('load', () => {
    const splat = new Entity('Splat');
    splat.setLocalEulerAngles(0, 0, 180);
    splat.addComponent('gsplat', {
        asset: splatAsset
    });
    app.root.addChild(splat);

    const resource = splatAsset.resource as { aabb?: BoundingBox } | null;
    const aabb = resource?.aabb;

    // scene radius scales zoom/pan limits even when the authored pose wins
    if (aabb) {
        sceneRadius = Math.max(aabb.halfExtents.length(), MIN_SCENE_RADIUS);
    }

    if (!CAMERA_POSE || !applyCameraPose(CAMERA_POSE)) {
        frameSplat(splat, aabb);
    }

    defaultOrbitState = { yaw, pitch, distance, target: target.clone(), fov };
    hideLoader();
});

splatAsset.on('progress', (received: number, length: number) => {
    if (length > 0) {
        const progress = Math.max(0, Math.min(1, received / length));
        setLoadingState(`Loading splat ${Math.floor(progress * 100)}%`, progress);
    }
});

splatAsset.on('error', (error: unknown) => {
    console.error(error);
    setLoadingState('Failed to load splat.', 1, true);
});

app.assets.add(splatAsset);
app.assets.load(splatAsset);
