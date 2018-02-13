import React, { Component } from 'react'
import * as d3 from 'd3';
import legend from 'd3-svg-legend'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'

@inject('dataStore')
@observer
class NodeLink extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div id="nl-contain" className="h-cell">
                <p className="tooltitle">Character Node Link View</p>
                <svg ref={(g) => { this.svg = g }} width={this.props.size[0]} height={this.props.size[1]}>
                    <g ref={(g) => { this.g = g }}></g>
                </svg>
                <div id="nl-tooltip" className="tip"></div>
            </div>
        );
    }        
}

export default NodeLink;