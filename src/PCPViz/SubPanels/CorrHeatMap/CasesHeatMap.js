import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {scaleBand} from 'd3-scale';
import casesFactor from './../../Data/CasesFactors.json';
import calculateCorrelation from 'calculate-correlation';

var data = [];

const correlation = (casesFactor) => {

    if(data.length > 0) return data;

    var keys = Object.keys(casesFactor[0]);
    keys.shift();

    for(var idx =0; idx<keys.length; idx++) {
        for(var jdx =0; jdx<keys.length; jdx++) {
            let data1 = [];
            let data2 = [];
            Object.keys(casesFactor).forEach(function (key) {
                let elem = {};
                data1.push(casesFactor[key][keys[idx]]);
                data2.push(casesFactor[key][keys[jdx]]);
                // data[keys[idx]+'&'+keys[idx+1]] = calc_pearson_corr(data1, data2) ;
                elem['group'] = keys[idx];
                elem['variable'] = keys[jdx];
                elem['value'] = calc_pearson_corr(data1, data2);
                data.push(elem);
            });
        }
    }

    return data;

};

const calc_pearson_corr = (data1, data2) => {
    return calculateCorrelation(data1, data2);
};


const CasesHeatMapViz = (props) => {
    const ref = useRef()

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 50, bottom: 70, left: 180},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var keys = Object.keys(casesFactor[0]);
    keys.shift();
    correlation(casesFactor);

    var heatmapElems = [];
    useEffect(() => {

        var selectedAxes = props.selectedAxes;

        heatmapElems = [];
        for(var i=0; i<data.length; i++) {
            if (! ((data[i].group in selectedAxes) && (data[i].variable in selectedAxes)) ){
                continue;
            }
            else{
                heatmapElems.push(data[i]);
            }
        }
        d3.select("#casesheatmapvis").remove();

        const heatMapElement = d3.select("#cases-sub-heatmap-vis")
            .append("svg")
            .attr("id","casesheatmapvis")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top +")" )
            .style("text-anchor", "end")

        // Build X scales and axis
        var x = scaleBand()
            .range([0, width])
            .domain(heatmapElems.map(d=>d.group))
            .padding(0.05);

        heatMapElement.append("g")
            .style("fond-size", 8)
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(x).tickSize(0))
            .select(".domain").remove()

        heatMapElement
            .selectAll("text")
            .attr("transform","rotate(90)" )
            .style("text-anchor", "start")

        // Build Y scales and axis
        var y = scaleBand()
            .range([height, 0])
            .domain(heatmapElems.map(d=>d.variable))
            .padding(0.05)

        heatMapElement.append("g")
            .style("font-size", 10)
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain")
            .remove()

        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolateRdBu)
            .domain([-1, 1]);

        if(props.colorScheme == "Inferno"){
            myColor = d3.scaleSequential()
                .interpolator(d3.interpolateInferno)
                .domain([-1, 1]);
        }
        else if(props.colorScheme == "RdBu"){
            myColor = d3.scaleSequential()
                .interpolator(d3.interpolateRdBu)
                .domain([-1, 1]);
        }
        else if(props.colorScheme == "RdYlGn"){
            myColor = d3.scaleSequential()
                .interpolator(d3.interpolateRdYlGn)
                .domain([-1, 1]);
        }
        else if(props.colorScheme == "RdGy"){
            myColor = d3.scaleSequential()
                .interpolator(d3.interpolateRdGy)
                .domain([-1, 1]);
        }
        // console.log(myColor(0.5));

        var tooltip = d3.select("#cases-sub-heatmap-map-vis")
            .append("div")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("max-width", "50px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }

        var mousemove = function(d) {
        }

        var mouseleave = function(d) {
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }

        var click = function(d){
            props.setScatterHorizontal({"horizon":d.target.attributes.horizontal.value});
            props.setScatterVertical({"vert":d.target.attributes.vertical.value});
        }

        heatMapElement.selectAll()
            .data(heatmapElems, function(d) {return d.group+':'+d.variable;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.group) })
            .attr("y", function(d) { return y(d.variable) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("horizontal", function(d) {return d.group})
            .attr("vertical", function(d) {return d.variable})
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .attr("value", function(d) {return d.value})
            .style("fill", function(d) { return myColor(d.value)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", click)


    }, [props.colorScheme, props.selectedAxes])
    return(
        // <></>
        <div className="cases-sub-heatmap-map-vis" id="cases-sub-heatmap-map-vis">
        </div>
    );

}

export default CasesHeatMapViz;