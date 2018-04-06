import React, {Component} from 'react';
import * as THREE from 'three';

class DicomViewer extends Component {
    constructor(props) {
        super(props);
        this.onWindowResize = this.onWindowResize.bind(this);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    componentDidMount() {
        let url = this.props.url;
        console.log(url);
        const scene = new THREE.Scene();
        this.scene = scene;
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera = camera;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        this.node.appendChild(renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);

        const vertShader = document.getElementById('mainVert').textContent;
        const fragShader = document.getElementById('mainFrag').textContent;
        new THREE.TextureLoader().load(url, (texture) => {
            const uniforms = {
                texture: {
                    type: 't', value: texture
                }
            };
            const geometry = new THREE.PlaneGeometry(3, 3);
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            const cube = new THREE.Mesh(geometry, material);
            if (this.props.rotation === 'left')
                cube.rotation.z -= 0.5;
            else if (this.props.rotation === 'right')
                cube.rotation.z += 0.5;
            else
                cube.rotation.z = 0.0;
            this.cube = cube;
            scene.add(cube);
            camera.position.z = 2;
            renderer.render(scene, camera);
        });
    }

    componentDidUpdate() {
        const url = this.props.url;
        const vertShader = document.getElementById('mainVert').textContent;
        const fragShader = document.getElementById('mainFrag').textContent;
        new THREE.TextureLoader().load(url, (texture) => {
            const uniforms = {
                texture: {
                    type: 't', value: texture
                }
            };
            if (this.props.rotation === 'left')
                this.cube.rotation.z -= 0.5;
            else if (this.props.rotation === 'right')
                this.cube.rotation.z += 0.5;
            else
                this.cube.rotation.z = 0.0;
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            this.cube.material = material;
            this.cube.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        });
    }

    render() {
        return (
            <div ref={node => this.node = node}>
            </div>
        )
    }
}

export default DicomViewer;