const ICON_MASK_SOURCES = [
  '/icons/whatsapp-glass.svg',
  '/icons/instagram-glass.svg',
  '/icons/mail-glass.svg',
  '/icons/assets-glass.svg',
]

const VERTEX_SHADER = `#version 300 es
precision highp float;

const vec2 POSITIONS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2(3.0, -1.0),
  vec2(-1.0, 3.0)
);

void main() {
  gl_Position = vec4(POSITIONS[gl_VertexID], 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uMask;
uniform sampler2D uCurrent;
uniform sampler2D uNext;
uniform vec2 uResolution;
uniform vec2 uDockOrigin;
uniform vec2 uCurrentDisplay;
uniform vec2 uCurrentOffset;
uniform vec2 uNextDisplay;
uniform vec2 uNextOffset;
uniform vec4 uIconCenters;
uniform float uDpr;
uniform float uMix;
uniform float uHoverProgress;
uniform float uHoverAngle;
uniform float uDefaultAngle;
uniform float uHoverWhole;
uniform float uFill;
uniform float uLightIntensity;
uniform int uHoveredIcon;

out vec4 fragColor;

float maskAt(vec2 uv) {
  return texture(uMask, uv).g;
}

float distanceAt(vec2 uv) {
  // Red stores the inside distance normalized to a 4 CSS-pixel field.
  return texture(uMask, uv).r * 4.0;
}

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

vec2 imageUv(vec2 screenPoint, vec2 displaySize, vec2 offset) {
  return (screenPoint - offset) / displaySize;
}

float sceneSample(sampler2D source, vec2 uv, vec2 normal, vec2 displaySize) {
  // Figma: refraction 80 × depth 20 → 5.6 CSS-pixel displacement.
  // Frost 4 and dispersion 50 map to 4px blur and 1.5px chromatic offset.
  vec2 refraction = normal * 5.6 / displaySize;
  vec2 frost = vec2(4.0) / displaySize;
  vec2 dispersion = normal * 1.5 / displaySize;
  vec2 refractedUv = clamp(uv + refraction, 0.001, 0.999);

  float blurred =
    luma(texture(source, refractedUv).rgb) * 0.4 +
    luma(texture(source, refractedUv + vec2(frost.x, 0.0)).rgb) * 0.15 +
    luma(texture(source, refractedUv - vec2(frost.x, 0.0)).rgb) * 0.15 +
    luma(texture(source, refractedUv + vec2(0.0, frost.y)).rgb) * 0.15 +
    luma(texture(source, refractedUv - vec2(0.0, frost.y)).rgb) * 0.15;

  float split =
    luma(texture(source, clamp(refractedUv + dispersion, 0.001, 0.999)).rgb) * 0.5 +
    luma(texture(source, clamp(refractedUv - dispersion, 0.001, 0.999)).rgb) * 0.5;
  return mix(blurred, split, 0.5);
}

float hoveredCenter() {
  if (uHoveredIcon == 0) return uIconCenters.x;
  if (uHoveredIcon == 1) return uIconCenters.y;
  if (uHoveredIcon == 2) return uIconCenters.z;
  return uIconCenters.w;
}

void main() {
  vec2 localUv = vec2(
    gl_FragCoord.x / uResolution.x,
    1.0 - gl_FragCoord.y / uResolution.y
  );
  float alpha = smoothstep(0.0, 1.0, maskAt(localUv));
  if (alpha < 0.01) discard;

  vec2 maskPixel = 1.0 / uResolution;
  float distance = distanceAt(localUv);
  float left = distanceAt(localUv - vec2(maskPixel.x, 0.0));
  float right = distanceAt(localUv + vec2(maskPixel.x, 0.0));
  float top = distanceAt(localUv - vec2(0.0, maskPixel.y));
  float bottom = distanceAt(localUv + vec2(0.0, maskPixel.y));
  vec2 gradient = vec2(left - right, top - bottom);
  float gradientLength = length(gradient);
  vec2 normal = gradientLength > 0.0001 ? -gradient / gradientLength : vec2(0.0);
  // Figma Depth 20 maps to a rounded 2.5 CSS-pixel bevel at this icon size.
  float bevel = 1.0 - smoothstep(0.0, 2.5, distance);
  float rim = 1.0 - smoothstep(0.0, 0.5, distance);

  vec2 localCss = vec2(
    gl_FragCoord.x / uDpr,
    (uResolution.y - gl_FragCoord.y) / uDpr
  );
  vec2 screenPoint = uDockOrigin + localCss;
  vec2 currentUv = imageUv(screenPoint, uCurrentDisplay, uCurrentOffset);
  vec2 nextUv = imageUv(screenPoint, uNextDisplay, uNextOffset);
  float scene = mix(
    sceneSample(uCurrent, currentUv, normal, uCurrentDisplay),
    sceneSample(uNext, nextUv, normal, uNextDisplay),
    uMix
  );
  // Figma fill: white 25% over the refracted backdrop.
  float glass = mix(scene, 1.0, uFill);

  float overHoveredIcon = max(
    uHoverWhole,
    1.0 - step(25.0, abs(localCss.x - hoveredCenter()))
  );
  float angle = radians(mix(uDefaultAngle, uHoverAngle, uHoverProgress * overHoveredIcon));
  vec2 lightDirection = vec2(cos(angle), sin(angle));
  float highlight = pow(max(dot(normal, lightDirection), 0.0), 8.0) * uLightIntensity * bevel;
  float shade = pow(max(dot(normal, -lightDirection), 0.0), 2.0) * 0.14 * bevel;
  // Scale lighting by remaining headroom so hover still reads on pale slides.
  glass += highlight * (1.0 - glass);
  glass -= shade * glass;
  glass += rim * 0.08 * (1.0 - glass);
  glass = clamp(glass, 0.0, 1.0);

  fragColor = vec4(vec3(glass) * alpha, alpha);
}
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

function createProgram(gl) {
  const program = gl.createProgram()
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program))
  }
  return program
}

function createTexture(gl) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([128, 128, 128, 255]),
  )
  return texture
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function distanceTransform1d(source, target, length, locations, boundaries) {
  const infinity = 1e20
  let k = 0
  locations[0] = 0
  boundaries[0] = -infinity
  boundaries[1] = infinity

  for (let q = 1; q < length; q += 1) {
    let intersection
    do {
      const location = locations[k]
      intersection =
        (source[q] + q * q - (source[location] + location * location)) / (2 * q - 2 * location)
      if (intersection <= boundaries[k]) k -= 1
    } while (intersection <= boundaries[k] && k >= 0)

    k += 1
    locations[k] = q
    boundaries[k] = intersection
    boundaries[k + 1] = infinity
  }

  k = 0
  for (let q = 0; q < length; q += 1) {
    while (boundaries[k + 1] < q) k += 1
    const delta = q - locations[k]
    target[q] = delta * delta + source[locations[k]]
  }
}

function createDistanceField(imageData, width, height, pixelRatio, coverageScale) {
  const infinity = 1e20
  const size = width * height
  const verticalPass = new Float64Array(size)
  const distances = new Float64Array(size)
  const maxLength = Math.max(width, height)
  const source = new Float64Array(maxLength)
  const target = new Float64Array(maxLength)
  const locations = new Int32Array(maxLength)
  const boundaries = new Float64Array(maxLength + 1)

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const alpha = imageData[(y * width + x) * 4 + 3]
      source[y] = alpha > 255 / coverageScale / 2 ? infinity : 0
    }
    distanceTransform1d(source, target, height, locations, boundaries)
    for (let y = 0; y < height; y += 1) verticalPass[y * width + x] = target[y]
  }

  for (let y = 0; y < height; y += 1) {
    const row = y * width
    for (let x = 0; x < width; x += 1) source[x] = verticalPass[row + x]
    distanceTransform1d(source, target, width, locations, boundaries)
    for (let x = 0; x < width; x += 1) distances[row + x] = target[x]
  }

  const pixels = new Uint8Array(size * 4)
  for (let index = 0; index < size; index += 1) {
    const sourceAlpha = imageData[index * 4 + 3]
    const coverage = Math.min(255, sourceAlpha * coverageScale)
    const distanceCss = Math.sqrt(distances[index]) / pixelRatio
    pixels[index * 4] = Math.round(Math.min(1, distanceCss / 4) * 255)
    pixels[index * 4 + 1] = coverage
    pixels[index * 4 + 2] = 0
    pixels[index * 4 + 3] = 255
  }

  return pixels
}

async function createMaskAtlas(width, height, elementRects, pixelRatio, maskSources, coverageScale) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  const context = canvas.getContext('2d')
  context.scale(pixelRatio, pixelRatio)
  const masks = await Promise.all(maskSources.map(loadImage))

  masks.forEach((mask, index) => {
    const rect = elementRects[index]
    context.drawImage(mask, rect.left, rect.top, rect.width, rect.height)
  })

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  return {
    width: canvas.width,
    height: canvas.height,
    pixels: createDistanceField(imageData.data, canvas.width, canvas.height, pixelRatio, coverageScale),
  }
}

function imageGeometry(image, stageRect) {
  const naturalWidth = image.naturalWidth || stageRect.width
  const naturalHeight = image.naturalHeight || stageRect.height
  const scale = Math.max(stageRect.width / naturalWidth, stageRect.height / naturalHeight)
  const width = naturalWidth * scale
  const height = naturalHeight * scale
  const styles = getComputedStyle(image)
  const positionY = styles.objectPosition.split(' ')[1] || '50%'
  const yRatio = Number.parseFloat(positionY) / 100

  return {
    display: [width, height],
    offset: [(stageRect.width - width) * 0.5, (stageRect.height - height) * yRatio],
  }
}

async function waitForImage(image) {
  if (image.complete && image.naturalWidth) return
  try {
    await image.decode()
  } catch {
    await new Promise((resolve) => image.addEventListener('load', resolve, { once: true }))
  }
}

async function createGlassRenderer({
  stage,
  container,
  elements,
  maskSources,
  hoverAngles,
  coverageScale,
  fillAmount = 0.25,
  lightIntensity = 0.4,
  defaultAngle = -45,
}) {
  const canvas = document.createElement('canvas')
  canvas.className = 'glass-shader-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  container.prepend(canvas)

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  })
  if (!gl) {
    canvas.remove()
    return
  }

  let program
  try {
    program = createProgram(gl)
  } catch (error) {
    console.warn('[glass-icons] WebGL shader unavailable', error)
    canvas.remove()
    return
  }

  gl.useProgram(program)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const uniforms = {}
  for (const name of [
    'uResolution',
    'uDockOrigin',
    'uCurrentDisplay',
    'uCurrentOffset',
    'uNextDisplay',
    'uNextOffset',
    'uIconCenters',
    'uDpr',
    'uMix',
    'uHoverProgress',
    'uHoverAngle',
    'uDefaultAngle',
    'uHoverWhole',
    'uFill',
    'uLightIntensity',
    'uHoveredIcon',
  ]) {
    uniforms[name] = gl.getUniformLocation(program, name)
  }

  const maskTexture = createTexture(gl)
  let currentTexture = createTexture(gl)
  let nextTexture = createTexture(gl)
  let currentImage
  let nextImage
  let currentGeometry
  let nextGeometry
  let transitionStart = 0
  let transitionDuration = 0
  let hoveredIcon = 0
  let hoverAngle = hoverAngles[0] || 135
  let hoverProgress = 0
  let hoverTarget = 0
  let hoverFrom = 0
  let hoverAnimationStart = performance.now()
  let containerRect
  let stageRect
  let centers = [24, 120, 216, 312]

  function renderPixelRatio() {
    // Shader-generated edges do not receive geometry MSAA. Rendering this
    // small canvas at 8× and downsampling gives finer 48px glyph edges.
    return 8
  }

  gl.uniform1i(gl.getUniformLocation(program, 'uMask'), 0)
  gl.uniform1i(gl.getUniformLocation(program, 'uCurrent'), 1)
  gl.uniform1i(gl.getUniformLocation(program, 'uNext'), 2)

  function bindTexture(unit, texture) {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
  }

  function uploadTexture(texture, image) {
    bindTexture(1, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  }

  async function setSlide(image, duration = 0) {
    if (!image) return
    await waitForImage(image)
    const geometry = imageGeometry(image, stage.getBoundingClientRect())

    if (!currentImage || duration === 0) {
      currentImage = image
      nextImage = image
      currentGeometry = geometry
      nextGeometry = geometry
      uploadTexture(currentTexture, image)
      uploadTexture(nextTexture, image)
      return
    }

    nextImage = image
    nextGeometry = geometry
    uploadTexture(nextTexture, image)
    transitionStart = performance.now()
    transitionDuration = duration * 1000
  }

  async function resize() {
    containerRect = container.getBoundingClientRect()
    stageRect = stage.getBoundingClientRect()
    const pixelRatio = renderPixelRatio()
    const width = Math.max(1, Math.round(containerRect.width * pixelRatio))
    const height = Math.max(1, Math.round(containerRect.height * pixelRatio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }

    const elementRects = elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      }
    })
    centers = elementRects.map((rect) => rect.left + rect.width / 2)
    while (centers.length < 4) centers.push(centers[0])
    const atlas = await createMaskAtlas(
      containerRect.width,
      containerRect.height,
      elementRects,
      pixelRatio,
      maskSources,
      coverageScale,
    )
    bindTexture(0, maskTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      atlas.width,
      atlas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      atlas.pixels,
    )

    if (currentImage) currentGeometry = imageGeometry(currentImage, stageRect)
    if (nextImage) nextGeometry = imageGeometry(nextImage, stageRect)
  }

  function render(time) {
    const hoverTime = Math.min(1, (time - hoverAnimationStart) / 300)
    const hoverEaseOut = 1 - (1 - hoverTime) ** 3
    hoverProgress = hoverFrom + (hoverTarget - hoverFrom) * hoverEaseOut

    let mixAmount = 0
    if (transitionDuration > 0) {
      mixAmount = Math.min(1, (time - transitionStart) / transitionDuration)
      if (mixAmount >= 1) {
        ;[currentTexture, nextTexture] = [nextTexture, currentTexture]
        currentImage = nextImage
        currentGeometry = nextGeometry
        transitionDuration = 0
        mixAmount = 0
      }
    }

    if (containerRect && stageRect && currentGeometry && nextGeometry) {
      const pixelRatio = renderPixelRatio()
      gl.clear(gl.COLOR_BUFFER_BIT)
      bindTexture(0, maskTexture)
      bindTexture(1, currentTexture)
      bindTexture(2, nextTexture)
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height)
      gl.uniform2f(
        uniforms.uDockOrigin,
        containerRect.left - stageRect.left,
        containerRect.top - stageRect.top,
      )
      gl.uniform2fv(uniforms.uCurrentDisplay, currentGeometry.display)
      gl.uniform2fv(uniforms.uCurrentOffset, currentGeometry.offset)
      gl.uniform2fv(uniforms.uNextDisplay, nextGeometry.display)
      gl.uniform2fv(uniforms.uNextOffset, nextGeometry.offset)
      gl.uniform4fv(uniforms.uIconCenters, centers)
      gl.uniform1f(uniforms.uDpr, pixelRatio)
      gl.uniform1f(uniforms.uMix, mixAmount)
      gl.uniform1f(uniforms.uHoverProgress, hoverProgress)
      gl.uniform1f(uniforms.uHoverAngle, hoverAngle)
      gl.uniform1f(uniforms.uDefaultAngle, defaultAngle)
      gl.uniform1f(uniforms.uHoverWhole, elements.length === 1 ? 1 : 0)
      gl.uniform1f(uniforms.uFill, fillAmount)
      gl.uniform1f(uniforms.uLightIntensity, lightIntensity)
      gl.uniform1i(uniforms.uHoveredIcon, hoveredIcon)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    requestAnimationFrame(render)
  }

  elements.forEach((element, index) => {
    const animateHover = (target) => {
      hoverFrom = hoverProgress
      hoverTarget = target
      hoverAnimationStart = performance.now()
    }
    const enter = () => {
      hoveredIcon = index
      hoverAngle = hoverAngles[index] || 135
      animateHover(1)
    }
    const leave = () => {
      animateHover(0)
    }
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('focus', enter)
    element.addEventListener('blur', leave)
  })

  stage.addEventListener('beams:slidechange', (event) => {
    setSlide(event.detail?.image, event.detail?.duration || 0).catch((error) => {
      console.warn('[glass-icons] Could not update slide texture', error)
    })
  })

  const resizeObserver = new ResizeObserver(() => resize())
  resizeObserver.observe(stage)
  resizeObserver.observe(container)

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    container.classList.remove('webgl-glass-ready')
  })

  await resize()
  const activeStack = [...stage.querySelectorAll('.cs-bg-stack, .cs-bg-stack-t, .cs-bg-stack-m')].find(
    (stack) => getComputedStyle(stack).display !== 'none',
  )
  await setSlide(activeStack?.querySelector('.cs-bg-active') || activeStack?.querySelector('.cs-bg'), 0)
  container.classList.add('webgl-glass-ready')
  requestAnimationFrame(render)
}

export async function initGlassIcons(root = document) {
  const stage = root.querySelector('.stage')
  const dock = root.querySelector('.dock')
  const logoLink = root.querySelector('.logo a')
  const icons = [...(dock?.querySelectorAll('.glass-icon') || [])]
  if (!stage) return

  const renderers = []

  if (dock && icons.length === 4) {
    renderers.push(
      createGlassRenderer({
        stage,
        container: dock,
        elements: icons,
        maskSources: ICON_MASK_SOURCES,
        hoverAngles: [140, 135, 135, 135],
        coverageScale: 4,
        fillAmount: 0.25,
        lightIntensity: 0.4,
        defaultAngle: -45,
      }),
    )
  }

  if (logoLink) {
    renderers.push(
      createGlassRenderer({
        stage,
        container: logoLink,
        elements: [logoLink],
        maskSources: ['/icons/wordmark-glass.svg'],
        hoverAngles: [135],
        coverageScale: 5,
        fillAmount: 0.25,
        lightIntensity: 0.2,
        defaultAngle: 225,
      }),
    )
  }

  await Promise.all(renderers)
}
