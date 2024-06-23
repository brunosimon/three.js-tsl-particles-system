import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import { color, rangeFog } from 'three/examples/jsm/nodes/Nodes.js'
import ParticlesSystem from './ParticlesSystem.js'
import Grid from './Grid.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.canvas')

// Scene
const scene = new THREE.Scene()
scene.fogNode = rangeFog(color('#1b191f'), 20, 30)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(15, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 5
camera.position.y = 2.5
camera.position.z = 6
scene.add(camera)

// Controls
const cameraControls = new OrbitControls(camera, canvas)
cameraControls.enableDamping = true

/**
 * Renderer
 */
const renderer = new WebGPURenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#19191f')

/**
 * Emitter
 */
const emitter = {}
emitter.object = new THREE.Object3D()
emitter.previousPosition = emitter.object.position.clone()
emitter.velocity = new THREE.Vector3()
scene.add(emitter.object)

// Controls
emitter.controls = new TransformControls(camera, renderer.domElement)
emitter.controls.attach(emitter.object)
scene.add(emitter.controls)
emitter.controls.visible = false
emitter.controls.enabled = false

emitter.controls.addEventListener( 'dragging-changed', (event) =>
{
    cameraControls.enabled = !event.value
})

/**
 * Particles system
 */
const particlesSystem = new ParticlesSystem(renderer, 1000)
scene.add(particlesSystem.mesh)

/**
 * Debug
 */
const gui = new GUI({
    width: 400
})

// Presets
const presetsFolder = gui.addFolder('📦 Presets')
const presets = {
    magicWand: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":1000,"decayFrequency":0.2,"velocityDamping":0.01},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":true,"emitterRadius":0.01,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":0,"initialVelocityZ":0,"initialRandomVelocity":0},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.01,"turbulenceTimeFrequeny":0.1,"turbulencePositionFrequeny":3},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":-0.5,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.95,"floorDamping":0.1},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#ff7300","colorOut":"#006eff","fadeIn":0.2,"fadeOut":0.2,"size":0.2,"glowSpread":0.02,"solidRatio":0.05,"solidAlpha":5,"opacity":1},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4,"sparklingFrequency":1,"sparklingDuration":0.01},"folders":{}}}}}}',
    fountain: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":4096,"decayFrequency":0.2,"velocityDamping":0.01},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":false,"emitterRadius":0,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":1.733,"initialVelocityZ":0,"initialRandomVelocity":0.162},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.023,"turbulenceTimeFrequeny":0.1,"turbulencePositionFrequeny":0.873},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":-1.622,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.95,"floorDamping":0.757},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#7ae4ff","colorOut":"#0033ff","fadeIn":0.053,"fadeOut":0.182,"size":0.2,"glowSpread":0.019,"solidRatio":0.101,"solidAlpha":5,"opacity":0.669},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4,"sparklingFrequency":0,"sparklingDuration":0.01},"folders":{}}}}}}',
    sparkles: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":300,"decayFrequency":0.303,"velocityDamping":0.009},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":true,"emitterRadius":0,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":1.489,"initialVelocityZ":1.327,"initialRandomVelocity":0.263},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.005,"turbulenceTimeFrequeny":0.1,"turbulencePositionFrequeny":3},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":-2.84,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.134,"floorDamping":0.372},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#ffa55c","colorOut":"#ff0000","fadeIn":0.047,"fadeOut":0.2,"size":0.182,"glowSpread":0.02,"solidRatio":0.05,"solidAlpha":5,"opacity":1},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4.46,"sparklingFrequency":10,"sparklingDuration":0.01},"folders":{}}}}}}',
    fire: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":2000,"decayFrequency":0.25,"velocityDamping":0.077},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":false,"emitterRadius":0,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":0,"initialVelocityZ":0,"initialRandomVelocity":0.392},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.009,"turbulenceTimeFrequeny":0.047,"turbulencePositionFrequeny":1.076},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":1.085,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.188,"floorDamping":0.1},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#ffa052","colorOut":"#ff0000","fadeIn":0.067,"fadeOut":0.372,"size":0.27,"glowSpread":0.009,"solidRatio":0.047,"solidAlpha":2.633,"opacity":0.419},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4,"sparklingFrequency":0,"sparklingDuration":0.01},"folders":{}}}}}}',
    ashes: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":1000,"decayFrequency":0.25,"velocityDamping":0.077},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":false,"emitterRadius":0.959,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":0,"initialVelocityZ":0,"initialRandomVelocity":0.108},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.003,"turbulenceTimeFrequeny":0.105,"turbulencePositionFrequeny":0.535},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":0.137,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-1,"floorDamping":0},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#ff7d52","colorOut":"#ff0000","fadeIn":0.067,"fadeOut":0.372,"size":0.189,"glowSpread":0.009,"solidRatio":0.047,"solidAlpha":2.633,"opacity":0.419},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4,"sparklingFrequency":0,"sparklingDuration":0.01},"folders":{}}}}}}',
    mannekenPis: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":1000,"decayFrequency":0.303,"velocityDamping":0.019},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":true,"emitterRadius":0,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":2,"initialVelocityZ":1.836,"initialRandomVelocity":0.018},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.022,"turbulenceTimeFrequeny":0.1,"turbulencePositionFrequeny":0.378},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":-3.236,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.134,"floorDamping":1},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#fff199","colorOut":"#ff9500","fadeIn":0.058,"fadeOut":0.2,"size":0.051,"glowSpread":0.01,"solidRatio":0.238,"solidAlpha":1,"opacity":1},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4.46,"sparklingFrequency":10,"sparklingDuration":0.01},"folders":{}}}}}}',
    beamMeUp: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":559,"decayFrequency":0.128,"velocityDamping":0},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":false,"emitterRadius":0.338,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":0.101,"initialVelocityZ":0,"initialRandomVelocity":0},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0,"turbulenceTimeFrequeny":0,"turbulencePositionFrequeny":0},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":0,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-0.95,"floorDamping":0.1},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#f133ff","colorOut":"#666bff","fadeIn":0.2,"fadeOut":0.2,"size":0.258,"glowSpread":0.007,"solidRatio":0.05,"solidAlpha":4.116,"opacity":1},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":1.246,"sparklingFrequency":1,"sparklingDuration":0.01},"folders":{}}}}}}',
    balrogWhip: '{"controllers":{},"folders":{"📦 Presets":{"controllers":{},"folders":{}},"✨ Particles":{"controllers":{"count":2000,"decayFrequency":0.303,"velocityDamping":0.017},"folders":{"🔫 Emitter":{"controllers":{"emitterVisible":false,"emitterRadius":0,"emitterVelocityStrength":0.4,"initialVelocityX":0,"initialVelocityY":0,"initialVelocityZ":0,"initialRandomVelocity":0.01},"folders":{}},"💨 Emitter":{"controllers":{"turbulenceStrength":0.016,"turbulenceTimeFrequeny":0.178,"turbulencePositionFrequeny":0.378},"folders":{}},"🧲 Gravity":{"controllers":{"gravityX":0,"gravityY":0,"gravityZ":0},"folders":{}},"🫓 Floor":{"controllers":{"floorY":-1,"floorDamping":1},"folders":{}},"🎨 Appearance":{"controllers":{"colorIn":"#ffa66b","colorOut":"#ff0f27","fadeIn":0.318,"fadeOut":0.084,"size":0.071,"glowSpread":0.01,"solidRatio":0.238,"solidAlpha":1,"opacity":1},"folders":{}},"💥 Sparkling":{"controllers":{"sparklingAlpha":4.46,"sparklingFrequency":10,"sparklingDuration":0.01},"folders":{}}}}}}',
}

for(const _presetName in presets)
{
    const preset = presets[_presetName]
    presetsFolder.add({
        load: () =>
        {
            gui.load(JSON.parse(preset))
        }
    }, 'load').name(_presetName)
}
presetsFolder.add({
    copy: () =>
    {
        navigator.clipboard.writeText(JSON.stringify(gui.save()))
    }
}, 'copy').name('copy to clipboard 📋')

// Particles
const particlesGui = gui.addFolder('✨ Particles')
particlesGui
    .add({ count: particlesSystem.count }, 'count', 10, 4096, 1)
    .onFinishChange(
        (value) => {
            particlesSystem.count = value
            scene.add(particlesSystem.mesh)
        }
    )
particlesGui.add(particlesSystem.uniforms.decayFrequency, 'value', 0, 1, 0.001).name('decayFrequency')
particlesGui.add(particlesSystem.uniforms.velocityDamping, 'value', 0, 0.1, 0.001).name('velocityDamping')

const emitterGui = particlesGui.addFolder('🔫 Emitter')
emitterGui.add(emitter.controls, 'enabled').name('emitterVisible').onChange((value) => { emitter.controls.visible = value })
emitterGui.add(particlesSystem.uniforms.emitterRadius, 'value', 0, 1, 0.001).name('emitterRadius')
emitterGui.add(particlesSystem.uniforms.emitterVelocityStrength, 'value', 0, 1, 0.001).name('emitterVelocityStrength')

emitterGui.add(particlesSystem.uniforms.initialVelocity.value, 'x', -2, 2, 0.001).name('initialVelocityX')
emitterGui.add(particlesSystem.uniforms.initialVelocity.value, 'y', -2, 2, 0.001).name('initialVelocityY')
emitterGui.add(particlesSystem.uniforms.initialVelocity.value, 'z', -2, 2, 0.001).name('initialVelocityZ')
emitterGui.add(particlesSystem.uniforms.initialRandomVelocity, 'value', 0, 1, 0.001).name('initialRandomVelocity')

const turbulenceGui = particlesGui.addFolder('💨 Emitter')
turbulenceGui.add(particlesSystem.uniforms.turbulenceStrength, 'value', 0, 0.1, 0.001).name('turbulenceStrength')
turbulenceGui.add(particlesSystem.uniforms.turbulenceTimeFrequeny, 'value', 0, 1, 0.001).name('turbulenceTimeFrequeny')
turbulenceGui.add(particlesSystem.uniforms.turbulencePositionFrequeny, 'value', 0, 10, 0.001).name('turbulencePositionFrequeny')

const gravityGui = particlesGui.addFolder('🧲 Gravity')
gravityGui.add(particlesSystem.uniforms.gravity.value, 'x', -10, 10, 0.001).name('gravityX')
gravityGui.add(particlesSystem.uniforms.gravity.value, 'y', -10, 10, 0.001).name('gravityY')
gravityGui.add(particlesSystem.uniforms.gravity.value, 'z', -10, 10, 0.001).name('gravityZ')

const floorGui = particlesGui.addFolder('🫓 Floor')
floorGui.add(particlesSystem.uniforms.floorY, 'value', -2, 0, 0.001).name('floorY').onChange((value) => { grid.mesh.position.y = value - 0.05 })
floorGui.add(particlesSystem.uniforms.floorDamping, 'value', 0, 1, 0.001).name('floorDamping')

const appearanceGui = particlesGui.addFolder('🎨 Appearance')
appearanceGui.addColor({ color: particlesSystem.uniforms.colorIn.value.getHex(THREE.SRGBColorSpace) }, 'color').onChange((value) => { particlesSystem.uniforms.colorIn.value.set(value) }).name('colorIn')
appearanceGui.addColor({ color: particlesSystem.uniforms.colorOut.value.getHex(THREE.SRGBColorSpace) }, 'color').onChange((value) => { particlesSystem.uniforms.colorOut.value.set(value) }).name('colorOut')
appearanceGui.add(particlesSystem.uniforms.fadeIn, 'value', 0, 1, 0.001).name('fadeIn')
appearanceGui.add(particlesSystem.uniforms.fadeOut, 'value', 0, 1, 0.001).name('fadeOut')
appearanceGui.add(particlesSystem.uniforms.size, 'value', 0, 1, 0.001).name('size')
appearanceGui.add(particlesSystem.uniforms.glowSpread, 'value', 0, 0.1, 0.001).name('glowSpread')
appearanceGui.add(particlesSystem.uniforms.solidRatio, 'value', 0, 1, 0.001).name('solidRatio')
appearanceGui.add(particlesSystem.uniforms.solidAlpha, 'value', 0, 10, 0.001).name('solidAlpha')
appearanceGui.add(particlesSystem.uniforms.opacity, 'value', 0, 1, 0.001).name('opacity')

const sparklingGui = particlesGui.addFolder('💥 Sparkling')
sparklingGui.add(particlesSystem.uniforms.sparklingAlpha, 'value', 0, 10, 0.001).name('sparklingAlpha')
sparklingGui.add(particlesSystem.uniforms.sparklingFrequency, 'value', 0, 10, 0.001).name('sparklingFrequency')
sparklingGui.add(particlesSystem.uniforms.sparklingDuration, 'value', 0, 0.1, 0.001).name('sparklingDuration')

/**
 * Grid
 */
const grid = new Grid()
grid.mesh.position.y = -1
grid.mesh.rotation.x = - Math.PI * 0.5
scene.add(grid.mesh)

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const deltaTime = timer.getDelta()

    // Update camera controls
    cameraControls.update()

    // Particles System
    particlesSystem.emitterPosition.copy(emitter.object.position)
    particlesSystem.uniforms.emitterVelocity.value.copy(emitter.velocity)
    particlesSystem.update(deltaTime)

    // Render
    renderer.renderAsync(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()