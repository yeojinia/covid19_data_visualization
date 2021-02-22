import React, {useEffect} from 'react';
import * as d3 from 'd3';
import casesFactor from "./../../Data/CasesFactors.json";
import {CorrelationMatrix} from "../../DataProcessing/CorrelationTable";
import {dimensions, maximums, minimums, modelWeights} from "../../DataProcessing/CasesFactors";
import crossInfo from "../../Data/CasesFactorsCrossInfo.json";
// import MI from "./../../Data/MutualInfo.json";

let corrMat = CorrelationMatrix(casesFactor)[1];

var caseObj = {};
corrMat.forEach(function (item) {
    if (item["x_feature"] === "cases") {
        caseObj[item["y_feature"]] = item["coeff"];
    }
});

export function OptAxes(corrSlider, corrThreshold, miSlider, miThreshold) {

    var axesChosen = {};
    if (corrSlider === false) {
        for (var pos in caseObj) {
            if (1 - Math.abs(caseObj[pos]) <= corrThreshold["corrThreshold"]) { // && pos !== "cases") {
                axesChosen[pos] = caseObj[pos];
            }
        }
    }
    // else if (miSlider === false) {
    //     for (var pos1 in MI) {
    //         if (MI[pos1]["mutualInfo"] >= miThreshold["miThreshold"]) {
    //             axesChosen[MI[pos1]["label"]] = MI[pos1]["mutualInfo"];
    //         }
    //     }
    // }

    if (Object.keys(axesChosen).length < 2) {
        return {};
    }
    return axesChosen;
}

export default function CasesPCP(props) {

    const side_margin = 80;
    const cases_pcp_width = 1000 - 2 * side_margin;
    const cases_pcp_height = 500 -  side_margin;

    var formatDecimalComma = d3.format(",.2f");

    let wMax = Math.max.apply(null, (Object.values(modelWeights)).map(Math.abs));
    let wMin = 0;

    useEffect(() => {

        var selectedAxesObj = props.selectedAxes;
        var selectedAxes = Object.keys(selectedAxesObj);

        // let crossRate = [];
        const crossRate = crossInfo.map((casesFactor, index) => {
            let sum =0;
            for(let i=0; i<selectedAxes.length-1; i++){
                sum += casesFactor[selectedAxes[i]][selectedAxes[i+1]];
            }
            return sum;
            //crossRate.push(sum);
        });
        var cross_min  = Math.min.apply(Math, crossRate) ;
        var cross_max = Math.max.apply(Math, crossRate);

        d3.select("#cases-pcp-vis").remove();
        let svg = d3.select(".cases-pcp-d3-wrapper")
            .append("svg")
            .attr("id", "cases-pcp-vis")
            .attr("width", cases_pcp_width)
            .attr("height", cases_pcp_height + 150);

        var y = {}
        let name = "";
        for (var i in dimensions) {
            name = dimensions[i];
            y[name] = d3.scaleLinear()
                .domain(d3.extent(casesFactor, function (d) {
                    return d[name];
                }))
                .range([cases_pcp_height, 0])
        }

        svg.selectAll('path').style('stroke', 'none');

        var selectedAxisOrder = [];

        for (var idx = 0; idx < selectedAxes.length; idx++) {
            if (props.targetPlace === idx) {
                selectedAxisOrder.push("cases");
            }
            if (selectedAxes[idx] !== "cases")
                selectedAxisOrder.push(selectedAxes[idx]);
        }

        const xScale = d3.scaleBand()
            .domain(selectedAxisOrder)
            .range([0, cases_pcp_width])
            .padding(0.5)

        svg.selectAll()
            .data(selectedAxisOrder, function (d) {
                return d;
            })
            .enter()
            .append('rect')
            .style('fill', function (d) {
                if (d === "cases") return 'orange';
                return '#0d98ba';
            })
            .attr('x', (s) => xScale(s))
            .attr('y', (s) => 0)
            .attr('height', (s) => cases_pcp_height)
            .attr('width', function (d) {
                if (d === "cases") return 3 * (1 + selectedAxisOrder.length) / (selectedAxisOrder.length);
                var scaledWeights = ((Math.abs(modelWeights[d]) - wMin) / (wMax - wMin));
                return (3 + 15 * scaledWeights) * (1 + selectedAxisOrder.length) / (selectedAxisOrder.length);
            });

        svg.selectAll()
            .data(selectedAxisOrder, function (d) {
                return d;
            })
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + xScale(d) + "," + cases_pcp_height + ") rotate(90)";
            })
            .append("text")
            .text(function (d) {
                return d;
            })
            .style("font", function (d) {
                var size = (25- 0.5*(selectedAxisOrder.length));
                return size+"px";
            })
            .style("fill", "black")

        svg.selectAll()
            .data(selectedAxisOrder, function (d) {
                return d;
            })
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + xScale(d) + "," + cases_pcp_height + ") rotate(90)";
            })
            .append("text")
            .attr("y", (25 - 0.5*(selectedAxisOrder.length)) + "px")
            .text(function (d) {
                return formatDecimalComma(minimums[d]);
            })
            .style("font", function (d) {
                var size = (25- 0.5*(selectedAxisOrder.length));
                return size+"px times";
            })
            .style("fill", "#0d98ba")

        svg.selectAll()
            .data(selectedAxisOrder, function (d) {
                return d;
            })
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + xScale(d) + ",0) rotate(90)";
            })
            .append("text")
            .attr("y", (25 - 0.5*(selectedAxisOrder.length)) + "px")
            .text(function (d) {
                return formatDecimalComma(maximums[d]);
            })
            .style("font", function (d) {
                var size = (25- 0.5*(selectedAxisOrder.length));
                return size+"px times";
            })
            .style("fill", "#0d98ba")

        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function curve_path(d) {
            return d3.line().curve(d3.curveCardinal)(selectedAxisOrder.map(function (p) {
                return [xScale(p), y[p](d[p])];
            }));
        }

        function line_path(d){
            return d3.line()(selectedAxisOrder.map(function (p) {
                return [xScale(p), y[p](d[p])];
            }))
        };

        var highlightColor = d3.scaleLinear().domain([cross_min,cross_max])
            .range(["white", "blue"]);

        svg.selectAll()
            .data(casesFactor, function (d) {
                return d;
            })
            .enter().append("path")
            .attr("d", function (d) {
                if (!(d.states in props.selectedData)) return line_path(d);
                return curve_path(d);
            })
            .style("fill", "none")
            .style("stroke", function (d) {
                if (!(d.states in props.selectedData)){
                    return "rgb(57, 57, 255)";//"#EA22A8";
                } //"#0d98ba"; //"#A2CCB6";
                return props.selectedData[d.states];
            })
            .style("stroke-width", function (d,idx) {
                    // if(cross_max!==cross_min)
                    //     return 1 + 1*(crossRate[idx]-cross_min)/(cross_max-cross_min);
                    // else
                    //     return 1;
                if (!(d.states in props.selectedData)) return '1px';
                return '3px';
            })
            .style("opacity", function (d,idx) {
                if(cross_max!==cross_min)
                    return (1.0-props.crossStress) + props.crossStress*(crossRate[idx]-cross_min)/(cross_max-cross_min);
                else
                    return (1.0-props.crossStress);
            })

    }, [props.selectedAxes, props.selectedData, props.targetPlace, props.crossStress, cases_pcp_height, cases_pcp_width, wMin, wMax, formatDecimalComma])

    return (
        <div className="cases-pcp-d3-wrapper" width="800px" height="580px">
        </div>
    );

}