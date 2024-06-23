// Base on https://al-ro.github.io/projects/embers/
// Added a 4th dimension

import { cross, float, tslFn, vec3, vec4 } from "three/examples/jsm/nodes/Nodes.js"
import { simplexNoise4d } from './simplexNoise4d.js'

const curlNoise4d = tslFn(([ inputA ]) =>
{
    const epsilon = float(1e-4) // Because EPSILON doesn't work with high input

    // X
    const aXPos = simplexNoise4d(inputA.add(vec4(epsilon, 0, 0, 0)))
    const aXNeg = simplexNoise4d(inputA.sub(vec4(epsilon, 0, 0, 0)))
    const aXAverage = aXPos.sub(aXNeg).div(epsilon.mul(2))

    // Y
    const aYPos = simplexNoise4d(inputA.add(vec4(0, epsilon, 0, 0)))
    const aYNeg = simplexNoise4d(inputA.sub(vec4(0, epsilon, 0, 0)))
    const aYAverage = aYPos.sub(aYNeg).div(epsilon.mul(2))

    // Z
    const aZPos = simplexNoise4d(inputA.add(vec4(0, 0, epsilon, 0)))
    const aZNeg = simplexNoise4d(inputA.sub(vec4(0, 0, epsilon, 0)))
    const aZAverage = aZPos.sub(aZNeg).div(epsilon.mul(2))

    // W
    const aWPos = simplexNoise4d(inputA.add(vec4(0, 0, 0, epsilon)))
    const aWNeg = simplexNoise4d(inputA.sub(vec4(0, 0, 0, epsilon)))
    const aWAverage = aWPos.sub(aWNeg).div(epsilon.mul(2))

    const aGrabNoise = vec4(aXAverage, aYAverage, aZAverage, aWAverage).normalize()

    // Second noise read
    const inputB = inputA.add(3.5) // Because 10000.5 breaks the simplex noise

    // X
    const bXPos = simplexNoise4d(inputB.add(vec4(epsilon, 0, 0, 0)))
    const bXNeg = simplexNoise4d(inputB.sub(vec4(epsilon, 0, 0, 0)))
    const bXAverage = bXPos.sub(bXNeg).div(epsilon.mul(2))

    // Y
    const bYPos = simplexNoise4d(inputB.add(vec4(0, epsilon, 0, 0)))
    const bYNeg = simplexNoise4d(inputB.sub(vec4(0, epsilon, 0, 0)))
    const bYAverage = bYPos.sub(bYNeg).div(epsilon.mul(2))

    // Z
    const bZPos = simplexNoise4d(inputB.add(vec4(0, 0, epsilon, 0)))
    const bZNeg = simplexNoise4d(inputB.sub(vec4(0, 0, epsilon, 0)))
    const bZAverage = bZPos.sub(bZNeg).div(epsilon.mul(2))

    // W
    const bWPos = simplexNoise4d(inputB.add(vec4(0, 0, 0, epsilon)))
    const bWNeg = simplexNoise4d(inputB.sub(vec4(0, 0, 0, epsilon)))
    const bWAverage = bWPos.sub(bWNeg).div(epsilon.mul(2))

    const bGrabNoise = vec4(bXAverage, bYAverage, bZAverage, bWAverage).normalize()

    return cross(aGrabNoise, bGrabNoise).normalize()
})

curlNoise4d.setLayout( {
    name: 'curlNoise4d',
    type: 'vec3',
    inputs: [
        { name: 'input', type: 'vec4' }
    ]
} )

export { curlNoise4d }