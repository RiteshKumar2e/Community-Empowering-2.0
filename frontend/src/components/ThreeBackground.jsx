import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import '../styles/ThreeBackground.css'

const ThreeBackground = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 100

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2))
        containerRef.current.appendChild(renderer.domElement)

        const getIsLight = () => document.body.classList.contains('light-theme')
        let isLight = getIsLight()

        // 1. Distant Background Stars (Static)
        const bgStarsCount = 2000
        const bgStarsPos = new Float32Array(bgStarsCount * 3)
        for (let i = 0; i < bgStarsCount * 3; i++) {
            bgStarsPos[i] = (Math.random() - 0.5) * 500
        }
        const bgStarsGeom = new THREE.BufferGeometry()
        bgStarsGeom.setAttribute('position', new THREE.BufferAttribute(bgStarsPos, 3))
        const bgStarsMat = new THREE.PointsMaterial({
            size: 0.3,
            color: isLight ? 0x6366f1 : 0xffffff,
            transparent: true,
            opacity: 0.2
        })
        const bgStars = new THREE.Points(bgStarsGeom, bgStarsMat)
        scene.add(bgStars)

        // 2. Cosmic Flow (The "Main" Effect)
        const flowCount = 1500
        const flowPos = new Float32Array(flowCount * 3)
        const flowColors = new Float32Array(flowCount * 3)
        const flowSpeeds = new Float32Array(flowCount)
        const flowAngles = new Float32Array(flowCount)

        const palette = [
            new THREE.Color(0x6366f1),
            new THREE.Color(0xa78bfa),
            new THREE.Color(0xec4899),
            new THREE.Color(0x0ea5e9)
        ]

        for (let i = 0; i < flowCount; i++) {
            const i3 = i * 3
            flowPos[i3] = (Math.random() - 0.5) * 200
            flowPos[i3 + 1] = (Math.random() - 0.5) * 200
            flowPos[i3 + 2] = (Math.random() - 0.5) * 100

            const color = palette[Math.floor(Math.random() * palette.length)]
            flowColors[i3] = color.r
            flowColors[i3 + 1] = color.g
            flowColors[i3 + 2] = color.b

            flowSpeeds[i] = Math.random() * 0.05 + 0.01
            flowAngles[i] = Math.random() * Math.PI * 2
        }

        const flowGeom = new THREE.BufferGeometry()
        flowGeom.setAttribute('position', new THREE.BufferAttribute(flowPos, 3))
        flowGeom.setAttribute('color', new THREE.BufferAttribute(flowColors, 3))

        const flowMat = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        })

        const flowParticles = new THREE.Points(flowGeom, flowMat)
        scene.add(flowParticles)

        // 3. Floating Light Prisms
        const createPrism = () => {
            const geom = new THREE.OctahedronGeometry(Math.random() * 4 + 2, 0)
            const mat = new THREE.MeshPhongMaterial({
                color: isLight ? 0x6366f1 : 0x8b5cf6,
                wireframe: true,
                transparent: true,
                opacity: 0.1,
                shininess: 100
            })
            const mesh = new THREE.Mesh(geom, mat)
            mesh.position.set((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 100, -50)
            return { mesh, rotSpeed: (Math.random() - 0.5) * 0.01 }
        }
        const prisms = [createPrism(), createPrism(), createPrism(), createPrism()]
        prisms.forEach(p => scene.add(p.mesh))

        // Lighting
        const light = new THREE.PointLight(0xffffff, 2)
        light.position.set(50, 50, 50)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0xffffff, 0.5))

        // Mouse follow
        let mouseX = 0, mouseY = 0
        const handleMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', handleMove)

        let time = 0
        let ani
        const animate = () => {
            ani = requestAnimationFrame(animate)
            time += 0.01

            // Dynamic Flow Animation
            const pos = flowGeom.attributes.position.array
            for (let i = 0; i < flowCount; i++) {
                const i3 = i * 3
                // Horizontal drift with wavy vertical move
                pos[i3] += flowSpeeds[i]
                pos[i3 + 1] += Math.sin(time + flowAngles[i]) * 0.05

                // Reset if off-screen (Loop effect)
                if (pos[i3] > 150) pos[i3] = -150
            }
            flowGeom.attributes.position.needsUpdate = true

            // Prisms
            prisms.forEach(p => {
                p.mesh.rotation.x += p.rotSpeed
                p.mesh.rotation.y += p.rotSpeed
                p.mesh.position.y += Math.sin(time * 0.5 + p.mesh.position.x) * 0.02
            })

            // Camera Smoothing
            camera.position.x += (mouseX * 15 - camera.position.x) * 0.02
            camera.position.y += (-mouseY * 15 - camera.position.y) * 0.02
            camera.lookAt(0, 0, 0)

            renderer.render(scene, camera)
        }
        animate()

        // Theme sync
        const updateThemeStyles = () => {
            const currentLight = getIsLight();
            isLight = currentLight;

            // Adjust Background Stars
            bgStarsMat.color.setHex(isLight ? 0x4f46e5 : 0xffffff);
            bgStarsMat.opacity = isLight ? 0.4 : 0.2;

            // Adjust Flow Particles
            flowMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
            flowMat.opacity = isLight ? 0.8 : 0.6;

            // Adjust Prisms
            prisms.forEach(p => {
                p.mesh.material.color.setHex(isLight ? 0x4f46e5 : 0x8b5cf6);
                p.mesh.material.opacity = isLight ? 0.15 : 0.1;
            });
        };

        const observer = new MutationObserver(updateThemeStyles);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        updateThemeStyles(); // Initial call

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('resize', handleResize)
            cancelAnimationFrame(ani)
            observer.disconnect()
            renderer.dispose()
            scene.clear()
            containerRef.current?.removeChild(renderer.domElement)
        }
    }, [])

    return <div ref={containerRef} className="three-background" />
}

export default ThreeBackground
