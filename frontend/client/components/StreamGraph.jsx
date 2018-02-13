import React, { Component } from 'react'
import * as d3 from 'd3';
import legend from 'd3-svg-legend'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import stackList from '../data/stack_list'
import stackMovieList from '../data/stack_movie_list'

@inject('dataStore')
@observer
class StreamGraph extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.renderGraph();
        autorun(() => this.updateRender());
    }
    
    componentDidUpdate() {
        //renderGraph()
    }


    updateRender() {
        const {size, dataStore} = this.props;
        const g = d3.select(this.g);
        let freeze = this.props.dataStore.getFreezeSG;
        // freeze interaction
        let tooltip = d3.select("#sg-tooltip");
        let x = this.state.x, mkeys = this.state.mkeys;
        g.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                if (freeze) return;
                g.selectAll(".layer").transition()
                    .duration(100)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            .on("mousemove", function(d, i) {
                if (freeze) return;
                var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch
                let mousex = d3.event.pageX;
                let mousey = d3.event.pageY;
                let xInx = parseInt(x.invert(mousex));
                let count = stackList[xInx][mkeys[i]];
                let gen = mkeys[i];
                let year = getYear(x.invert(mousex));
                tooltip.style("left", (mousex + 20) +"px")
                        .style("top", (mousey + 30) + "px")
                        .html("<p>" + count + " " + gen + " movies in " + year + "</p>")
                        .style("visibility", "visible");                
            })
            .on("mouseout", function(d, i) {
                if (freeze) return;
                g.selectAll(".layer").transition()
                  .duration(100)
                  .attr("opacity", '1');
                tooltip.style("visibility", "hidden");
            })
            .on("click", (d, i) => {
                if (freeze) return;
                let mousex = d3.event.pageX;
                let gen = mkeys[i];
                let xInx = parseInt(x.invert(mousex));
                let acMovies = stackMovieList[xInx][gen];
                this.props.dataStore.addActiveMovies(acMovies);
                this.props.dataStore.freezeSG();
            })

            if (freeze) {
                tooltip.style("visibility", "hidden");
                d3.selectAll(".layer")
                    .attr("opacity", 0.6);
            }

            function getYear(x) {
                let minYear = 1950;
                return minYear + parseInt(x);
            }
    }

    renderGraph() {
        const {size} = this.props;
        let width = size[0], height = size[1];
        var genreStack = JSON.parse(JSON.stringify(stackList));
        // normalize genreStack
        genreStack = genreStack.map((dict) => {
            for (var k in dict) {
                dict[k] = Math.pow(dict[k], 1/2) + 0.1;
            }
            return dict;
        });
        // margin
        let top = 10, left = 10;
        const g = d3.select(this.g).attr("transform",  "translate(" + left + ", "+ top +")");
        // d3
        let mkeys = ['sci-fi', 'comedy', 'thriller', 'romance', 'drama', 'action', 'adventure', 'horror'];
        let stack = d3.stack().keys(mkeys)
                    .offset(d3.stackOffsetSilhouette)
                    .order(d3.stackOrderReverse(mkeys));
        let layers = stack(genreStack);

        let x = d3.scaleLinear()
            .domain([0, genreStack.length])
            .range([0, width - 15]);
        let y = d3.scaleLinear()
            .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
            .range([height-10, 0]);
        console.log(width, height);
        // console.log(d3.min(layers, stackMin), d3.max(layers, stackMax))
        console.log(stackMovieList)
        var colorrange = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3'];

        var z = d3.scaleOrdinal()
            .range(colorrange);

        var area = d3.area()
            .x(function(d, i) { return x(i); })
            .y0(function(d) { return y(d[0]) - .2; })
            .y1(function(d) { return y(d[1]) + .2; })
            .curve(d3.curveBasis);

        function stackMax(layer) {
            return d3.max(layer, function(d) { return d[1]; });
        }
            
        function stackMin(layer) {
            return d3.min(layer, function(d) { return d[0]; });
        }

        g.selectAll(".layers")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", area)
            .attr("fill", function(d, i) { return z(i); });


        g.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                g.selectAll(".layer").transition()
                    .duration(100)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            .on("mousemove", function(d, i) {
                var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch
                let mousex = d3.event.pageX;
                let mousey = d3.event.pageY;
                let xInx = parseInt(x.invert(mousex));
                let count = stackList[xInx][mkeys[i]];
                let gen = mkeys[i];
                let year = getYear(x.invert(mousex));
                tooltip.style("left", (mousex + 20) +"px")
                        .style("top", (mousey + 30) + "px")
                        .html("<p>" + count + " " + gen + " movies in " + year + "</p>")
                        .style("visibility", "visible");                
            })
            .on("mouseout", function(d, i) {
                g.selectAll(".layer").transition()
                  .duration(100)
                  .attr("opacity", '1');
                tooltip.style("visibility", "hidden");
            })
            .on("click", (d, i) => {
                let mousex = d3.event.pageX;
                let gen = mkeys[i];
                let xInx = parseInt(x.invert(mousex));
                let acMovies = stackMovieList[xInx][gen];
                this.props.dataStore.addActiveMovies(acMovies);
                this.props.dataStore.freezeSG();
            })
        
        var lengendScale = d3.scaleOrdinal()
            .domain(mkeys)
            .range(colorrange);

        // add legend
        var colorLegend = legend.legendColor()
            .scale(lengendScale)
            .shapePadding(1)
            .shapeWidth(15)
            .shapeHeight(8)
            .labelOffset(2);

        g.append("g")
            .attr("transform", "translate(0, 0)")
            .call(colorLegend);
        
        // tooltip
        let tooltip = d3.select("#sg-tooltip");

        function getYear(x) {
            let minYear = 1950;
            return minYear + parseInt(x);
        }

        // save state for update use
        this.setState({
            x: x,
            y: y,
            genreStack: genreStack,
            mkeys: mkeys,
        });
    }

    render() {
        return(
            <div id="sg-contain">
                <svg width={this.props.size[0]} height={this.props.size[1]}>
                    <g ref={(g) => { this.g = g }}></g>
                </svg>
                <div className="legend"></div>
                <div id="sg-tooltip" className="tip"></div>
            </div>
        );            
        //return(<svg width={this.props.size[0]} height={this.props.size[1]}></svg>);     
    }
}

export default StreamGraph;