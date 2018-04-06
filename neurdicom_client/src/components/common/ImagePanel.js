import React, {Component} from 'react';
import PropTypes from 'prop-types';

class ImagePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isImageLoaded: false,
            image: {}
        };
        this.setState = this.setState.bind(this);
    }

    componentWillMount() {
        const src = this.props.src;
        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.setState({
                isImageLoaded: true,
                image: image
            })
        }
    }

    componentDidMount() {
        const isImageLoaded = this.state.isImageLoaded;
        const image = this.state.image;
        if (isImageLoaded) {
            const canvas = document.getElementById('id_canvas');
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
    }

    render() {
        return (
            <div>
                <canvas id={'id_canvas'}/>
            </div>
        );
    }

}

ImagePanel.propTypes = {
    src: PropTypes.string
};

export default ImagePanel;