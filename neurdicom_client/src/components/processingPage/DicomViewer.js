import React, {Component} from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import './DicomViewer.css';

class DicomViewer extends Component {
    constructor(props) {
        super(props);
    }

    onWindowResize = () => {
        this.camera.aspect = this.node.clientWidth / this.node.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
    };

    static fillCanvasFromData(data, w, h) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, w, h);
        const array = imgData.data;
        for (let i = 0; i < w * h; i++) {
            array[i * 4] = data[i];
            array[i * 4 + 1] = data[i];
            array[i * 4 + 2] = data[i];
            array[i * 4 + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas;
    }

    static textureFromCanvas(data, w, h) {
        return new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(data, w, h));
    }

    componentDidMount() {
        const original = this.props.original;
        const instance = this.props.instance;
        const mask = this.props.mask;
        const mode = this.props.mode;
        const alpha = this.props.alpha;
        const colorScale = this.props.colorScale;
        const w = instance['columns'];
        const h = instance['rows'];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.node.clientWidth / this.node.clientHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
        this.node.appendChild(this.renderer.domElement);

        this.node.addEventListener('resize', this.onWindowResize, false);

        let vertShader = null;
        let fragShader = null;
        let uniforms = null;
        if (mask) {
            vertShader = document.getElementById('mainVert').textContent;
            fragShader = document.getElementById(mode + 'Frag').textContent;
            uniforms = {
                texture: {
                    type: 't', value: new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(original, w, h))
                },
                mask: {
                    type: 't', value: new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(mask, w, h))
                },
                alpha: {
                    value: alpha
                }
            };
        }
        else {
            vertShader = document.getElementById('mainVert').textContent;
            fragShader = document.getElementById(colorScale + 'Frag').textContent;

            uniforms = {
                texture: {
                    type: 't', value: DicomViewer.textureFromCanvas(original, w, h)
                }
            };
        }
        const geometry = new THREE.PlaneGeometry(3, 3);
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertShader,
            fragmentShader: fragShader
        });

        this.rect = new THREE.Mesh(geometry, material);
        this.scene.add(this.rect);
        this.camera.position.z = 2;
        this.renderer.render(this.scene, this.camera);
    }

    componentDidUpdate() {
        const original = this.props.original;
        const instance = this.props.instance;
        const mask = this.props.mask;
        const mode = this.props.mode;
        const alpha = this.props.alpha;
        const colorScale = this.props.colorScale;
        const w = instance['columns'];
        const h = instance['rows'];

        if (mask) {
            const vertShader = document.getElementById('mainVert').textContent;
            const fragShader = document.getElementById(mode + 'Frag').textContent;
            const uniforms = {
                texture: {
                    type: 't', value: new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(original, w, h))
                },
                mask: {
                    type: 't', value: new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(mask, w, h))
                },
                alpha: {
                    value: alpha
                }
            };
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            this.rect.material = material;
            this.rect.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        }
        else {
            const vertShader = document.getElementById('mainVert').textContent;
            const fragShader = document.getElementById(colorScale + 'Frag').textContent;
            const uniforms = {
                texture: {
                    type: 't', value: new THREE.CanvasTexture(DicomViewer.fillCanvasFromData(original, w, h))
                }
            };
            const material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });
            this.rect.material = material;
            this.rect.needsUpdate = true;
            this.renderer.render(this.scene, this.camera);
        }
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

DicomViewer.propTypes = {
    instance: PropTypes.object,
    original: PropTypes.object,
    mask: PropTypes.object,
    mode: PropTypes.string,
    colorScale: PropTypes.string
};

export default DicomViewer;