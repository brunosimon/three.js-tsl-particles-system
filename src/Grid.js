import { If, MeshBasicNodeMaterial, color, tslFn, uniform, vec3, vec4, positionWorld, vec2, normalWorld, mix, max } from 'three/examples/jsm/nodes/Nodes.js'
import * as THREE from 'three'

export default class Grid
{
    constructor(size = 100)
    {
        // Material
        const material = new MeshBasicNodeMaterial()

        // Uniforms
        const scaleUniform = uniform(0.1)
        const thicknessUniform = uniform(0.1)
        const offsetUniform = uniform(vec2(0, 0))
        const colorBackUniform = uniform(color('#19191f'))
        const colorSmallUniform = uniform(color('#39364f'))
        const colorBigUniform = uniform(color('#705df2'))

        // Triplanar Uv
        const triplanarUv = tslFn(([ position, normal ]) =>
        {
            const dotX = normal.dot(vec3(1, 0, 0)).abs()
            const dotY = normal.dot(vec3(0, 1, 0)).abs()
            const dotZ = normal.dot(vec3(0, 0, 1)).abs()

            const uvX = position.yz.toVar()
            const uvY = position.xz.toVar()
            const uvZ = position.xy.toVar()

            const uv = uvX

            If(dotZ.greaterThan(dotX), () =>
            {
                uv.assign(uvZ)
            })
            If(dotY.greaterThan(dotX).and(dotY.greaterThan(dotZ)), () =>
            {
                uv.assign(uvY)
            })

            return uv
        })

        // Triplanar Grid
        const triplanarGrid = tslFn(([scale, thickness, offset]) =>
        {
            const uv = triplanarUv(positionWorld, normalWorld).div(scale).add(thickness.mul(0.5)).add(offset).mod(1)
            return max(
                uv.x.step(thickness),
                uv.y.step(thickness)
            )
        })

        // Color
        material.colorNode = tslFn(() =>
        {
            // 1/10 grid
            const finalColor = mix(
                colorBackUniform,
                colorSmallUniform,
                triplanarGrid(scaleUniform, thicknessUniform, offsetUniform)
            )

            // 1/1 grid
            finalColor.assign(mix(
                finalColor,
                colorBigUniform,
                triplanarGrid(scaleUniform.mul(10), thicknessUniform.div(10), offsetUniform)
            ))

            // Output
            return vec4(finalColor, 1)
        })()

        // Mesh
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size),
            material
        )
    }
}