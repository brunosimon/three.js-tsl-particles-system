import { If, min, SpriteNodeMaterial, color, range, sin, instanceIndex, timerDelta, step, timerGlobal, tslFn, uniform, uv, vec3, vec4, mix, max, uint, cond, varying } from 'three/examples/jsm/nodes/Nodes.js'
import { storage } from 'three/examples/jsm/nodes/Nodes.js'
import StorageInstancedBufferAttribute from 'three/examples/jsm/renderers/common/StorageInstancedBufferAttribute.js'
import { curlNoise4d } from './tsl/curlNoise4d.js'
import * as THREE from 'three'

export default class
{
    initialized = false
    
    constructor(renderer, count = 1000)
    {
        // Setup
        // this.initialized = false
        this.renderer = renderer
        this.emitterPosition = new THREE.Vector3()
        this.emitterPreviousPosition = new THREE.Vector3()
        this.count = count

        // Uniforms
        this.uniforms = {}
        this.uniforms.colorIn = uniform(color('#ff7300'))
        this.uniforms.colorOut = uniform(color('#006eff'))
        this.uniforms.emitterPosition = uniform(vec3())
        this.uniforms.emitterVelocity = uniform(vec3())
        this.uniforms.emitterRadius = uniform(0.01)
        this.uniforms.emitterVelocityStrength = uniform(0.4)
        this.uniforms.initialVelocity = uniform(vec3(0, 0, 0))
        this.uniforms.initialRandomVelocity = uniform(0)
        this.uniforms.velocityDamping = uniform(0.01)
        this.uniforms.turbulenceStrength = uniform(0.01)
        this.uniforms.turbulenceTimeFrequeny = uniform(0.1)
        this.uniforms.turbulencePositionFrequeny = uniform(3)
        this.uniforms.decayFrequency = uniform(0.2)
        this.uniforms.gravity = uniform(vec3(0, -0.5, 0))
        this.uniforms.floorY = uniform(-0.95)
        this.uniforms.floorDamping = uniform(0.1)
        this.uniforms.size = uniform(0.2)
        this.uniforms.solidRatio = uniform(0.05)
        this.uniforms.solidAlpha = uniform(5)
        this.uniforms.glowSpread = uniform(0.02)
        this.uniforms.fadeIn = uniform(0.2)
        this.uniforms.fadeOut = uniform(0.2)
        this.uniforms.opacity = uniform(1)
        this.uniforms.sparklingAlpha = uniform(4)
        this.uniforms.sparklingFrequency = uniform(1)
        this.uniforms.sparklingDuration = uniform(0.01)

        this.initialize()
    }

    initialize()
    {
        // Material
        this.material = new SpriteNodeMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })

        // Buffers
        this.positionBuffer = storage(new StorageInstancedBufferAttribute(this.count, 3), 'vec3', this.count)
        this.velocityBuffer = storage(new StorageInstancedBufferAttribute(this.count, 3), 'vec3', this.count)
        this.lifeBuffer = storage(new StorageInstancedBufferAttribute(this.count, 1), 'float', this.count)

        // Varyings
        const sparkling = varying(0)

        // Compute init
        const particlesInit = tslFn(() =>
        {
            // Position
            const position = this.positionBuffer.element(instanceIndex)
            position.assign(vec3(99999)) // Not in view at first

            // Life
            const life = this.lifeBuffer.element(instanceIndex)
            life.assign(instanceIndex.hash())
        })
        this.particlesInitCompute = particlesInit().compute(this.count)
        this.renderer.compute(this.particlesInitCompute)

        // Compute update
        const particlesUpdate = tslFn(() =>
        {
            // Setup
            const position = this.positionBuffer.element(instanceIndex)
            const velocity = this.velocityBuffer.element(instanceIndex)
            const life = this.lifeBuffer.element(instanceIndex)

            const delta = timerDelta()
            const time = timerGlobal()

            // Turbulence
            const turbulenceInput = position.mul(this.uniforms.turbulencePositionFrequeny).add(12.34)
            const turbulence = curlNoise4d(vec4(turbulenceInput, time.mul(this.uniforms.turbulenceTimeFrequeny))).mul(this.uniforms.turbulenceStrength)

            // Update velocity
            velocity.addAssign(turbulence)
            velocity.addAssign(this.uniforms.gravity.mul(delta))
            velocity.mulAssign(this.uniforms.velocityDamping.oneMinus())

            // Update position
            position.addAssign(velocity.mul(delta))

            // Floor bounce
            If(position.y.lessThan(this.uniforms.floorY), () =>
            {
                position.y.assign(this.uniforms.floorY)
                velocity.y.mulAssign(this.uniforms.floorDamping.oneMinus().negate())
            })

            // Life
            const newLife = life.add(delta.mul(this.uniforms.decayFrequency))

            // Reset
            If(newLife.greaterThan(1), () =>
            {
                const randomDirection = vec3(
                    instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5),
                    instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5),
                    instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5)
                ).normalize()

                // Position
                position.assign(this.uniforms.emitterPosition.add(randomDirection.mul(this.uniforms.emitterRadius)))

                // Velocity
                velocity.assign(this.uniforms.emitterVelocity.mul(this.uniforms.emitterVelocityStrength).add(randomDirection.mul(this.uniforms.initialRandomVelocity)).add(this.uniforms.initialVelocity))
            })

            life.assign(newLife.mod(1))
        })
        this.particlesUpdateCompute = particlesUpdate().compute(this.count)

        // Scale
        const life = this.lifeBuffer.toAttribute()
        const scaleIn = life.remap(0, this.uniforms.fadeIn, 0, 1)
        const scaleOut = life.remap(this.uniforms.fadeOut.oneMinus(), 1, 1, 0)
        const scaleFinal = min(scaleIn, scaleOut).smoothstep(0, 1).mul(this.uniforms.size).mul(range(0, 1))
        this.material.scaleNode = scaleFinal

        // Position
        this.material.positionNode = tslFn(() =>
        {
            const sparklingTime = instanceIndex.add(uint(Math.random() * 0xffffff)).hash()

            const sparklingLife = life.mul(this.uniforms.sparklingFrequency).mod(1)
            sparkling.assign(cond(sparklingLife.lessThan(sparklingTime).and(sparklingLife.greaterThan(sparklingTime.sub(this.uniforms.sparklingDuration.mul(this.uniforms.sparklingFrequency)))), 1, 0))
            return this.positionBuffer.toAttribute()
        })()

        // Color
        this.material.colorNode = tslFn(() =>
        {
            const distanceToCenter = uv().sub(0.5).length()
            
            const alphaSolid = step(this.uniforms.solidRatio.div(2), distanceToCenter).oneMinus().mul(this.uniforms.solidAlpha)

            const alphaGlow = this.uniforms.glowSpread.div(distanceToCenter).sub(this.uniforms.glowSpread.mul(2))
            alphaGlow.mulAssign(alphaSolid.oneMinus())
            
            const alphaFinal = max(alphaGlow, alphaSolid).mul(this.uniforms.opacity)

            alphaFinal.mulAssign(sparkling.mul(this.uniforms.sparklingAlpha).add(1))

            const finalColor = mix(this.uniforms.colorIn, this.uniforms.colorOut, life)
            return vec4(finalColor, alphaFinal)
        })()

        // Mesh
        this.geometry = new THREE.PlaneGeometry(1, 1)
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count)

        // Update
        this.initialized = true
    }

    get count()
    {
        return this._count
    }

    set count(value)
    {
        this._count = value

        if(this.initialized)
        {
            this.dispose()
            this.initialize()
        }
    }

    dispose()
    {
        this.geometry.dispose()
        this.positionBuffer.dispose()
        this.velocityBuffer.dispose()
        this.lifeBuffer.dispose()
        this.particlesInitCompute.dispose()
        this.particlesUpdateCompute.dispose()
        this.mesh.removeFromParent()
    }

    update(deltaTime)
    {
        // Update velocity
        const velocity = this.emitterPosition.clone().sub(this.emitterPreviousPosition).divideScalar(deltaTime)
        this.emitterPreviousPosition.copy(this.emitterPosition)
        this.uniforms.emitterVelocity.value.copy(velocity)

        // Update position
        this.uniforms.emitterPosition.value.copy(this.emitterPosition)

        // Compute update
        this.renderer.compute(this.particlesUpdateCompute)
    }
}