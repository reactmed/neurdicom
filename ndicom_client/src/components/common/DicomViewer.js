import React, {Component} from 'react';
import * as THREE from 'three';
import './DicomViewer.css';

class DicomViewer extends Component {
    constructor(props) {
        super(props);
        this.rayCaster = new THREE.Raycaster();
        this.state = {
            seedPoint: new THREE.Vector2(-1, -1)
        };
        this.setState = this.setState.bind(this);
    }

    onWindowResize = () => {
        this.camera.aspect = this.node.clientWidth / this.node.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
    };

    onMouseClick = (e) => {
        const scene = this.scene;
        const camera = this.camera;
        const rayCaster = this.rayCaster;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const array = DicomViewer.getMousePosition(e.target, clientX, clientY);
        const vecPos = new THREE.Vector2(array[0] * 2 - 1, -(array[1] * 2) + 1);
        rayCaster.setFromCamera(vecPos, camera);
        const intersects = rayCaster.intersectObjects(scene.children);
        if (intersects && intersects.length > 0) {
            const intersectedImg = intersects[0];
            const uv = intersectedImg.uv;
            if (uv) {
                console.log(uv);
                this.setState({seedPoint: new THREE.Vector2(uv.x, uv.y)});
            }
        }
    };

    static getMousePosition(dom, x, y) {
        const boundingBox = dom.getBoundingClientRect();
        return [
            (x - boundingBox.left) / boundingBox.width, (y - boundingBox.top) / boundingBox.height
        ];
    }

    componentDidMount() {
        const instance = this.props.instance;
        const w = parseFloat(instance['columns']);
        const h = parseFloat(instance['rows']);
        const url = `/api/instances/${this.props.instance.id}/image`;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.node.clientWidth / this.node.clientHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
        this.node.appendChild(this.renderer.domElement);

        this.node.addEventListener('resize', this.onWindowResize, false);
        this.node.onclick = this.onMouseClick;

        const seedPoint = this.state.seedPoint;

        const vertShader = document.getElementById('mainVert').textContent;
        const fragShader = document.getElementById(this.props.colorScale + 'Frag').textContent;

        new THREE.TextureLoader().load(url, (texture) => {
            const uniforms = {
                texture: {
                    type: 't', value: texture
                },
                seedPoint: {
                    value: seedPoint
                },
                imgSize: {
                    value: new THREE.Vector2(w, h)
                }
            };
            const geometry = new THREE.PlaneGeometry(3, 3);
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            this.rect = new THREE.Mesh(geometry, material);
            if (this.props.rotation === 'left')
                this.rect.rotation.z -= 0.5;
            else if (this.props.rotation === 'right')
                this.rect.rotation.z += 0.5;
            else
                this.rect.rotation.z = 0.0;
            this.scene.add(this.rect);
            this.camera.position.z = 3.5;
            this.renderer.render(this.scene, this.camera);
        });
    }

    componentDidUpdate() {
        const instance = this.props.instance;
        const w = parseFloat(instance['columns']);
        const h = parseFloat(instance['rows']);
        const url = `/api/instances/${this.props.instance.id}/image`;
        const vertShader = document.getElementById('mainVert').textContent;
        const fragShader = document.getElementById(this.props.colorScale + 'Frag').textContent;
        const seedPoint = this.state.seedPoint;
        new THREE.TextureLoader().load(url, (texture) => {
            const uniforms = {
                texture: {
                    type: 't', value: texture
                },
                seedPoint: {
                    value: seedPoint
                },
                imgSize: {
                    value: new THREE.Vector2(w, h)
                }
            };
            if (this.props.rotation === 'left')
                this.rect.rotation.z -= 0.5;
            else if (this.props.rotation === 'right')
                this.rect.rotation.z += 0.5;
            else
                this.rect.rotation.z = 0.0;
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            this.rect.material = material;
            this.rect.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        });
    }

    render() {
        const instance = this.props.instance;
        return (
            <div ref={node => this.node = node} style={{height: window.innerHeight}}>
                <div className={'leftTop'}>
                    <div>
                        Patient ID: {instance.parent.patient['patient_id']}
                    </div>
                    <div>
                        Patient Name: {instance.parent.patient['patient_name']}
                    </div>
                    <div>
                        Series ID: {instance.parent.series['series_id']}
                    </div>
                    <br/>
                    <div>
                        Instance: {instance['instance_number']}
                    </div>
                    <div>
                        Modality: {instance.parent.series['modality']}
                    </div>
                    <div>
                        Size: {instance['columns']}x{instance['rows']}
                    </div>
                    <div>
                        Color Scheme: {instance['photometric_interpretation']}
                    </div>
                </div>
            </div>
        )
    }
}

export default DicomViewer;