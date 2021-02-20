import React from 'react';
import PearsonCorrCoeff from "./PearsonCorrCoeff.js";
import deaths_factor from '../Data/DeathsFactors.json';

export const CovidDeathsCorrelationMatrix = (features) => {

    var disease_keys = Object.keys(features[0]);
    disease_keys.shift();

    var data = [];
    disease_keys.forEach(function(key){
        var feature = [];
        features.forEach(function(data){feature.push(data[key]);})
        data.push(feature);
    })

    let corrMat = [];
    for(let i=0; i<disease_keys.length; i++){
        let corr =[];
        for(let j=0; j<disease_keys.length; j++){
            let corr2 = {};
            corr.push((PearsonCorrCoeff(data[i], data[j])).toFixed(2));
            corr2["coeff"] = +(PearsonCorrCoeff(data[i], data[j])).toFixed(2);
            corr2["x_feature"] = disease_keys[i];
            corr2["y_feature"] = disease_keys[j];
            corrMat.push(corr2);
        }
    }
    return [disease_keys, corrMat];
}

const DeathsCorrelationTable = (props) => {

    // const {id} = props;
    //const id = props.id;
    // console.log(id);

    let [labels, corrMat] = CovidDeathsCorrelationMatrix(deaths_factor);
    let corrTable = [];

    let tableHeader = [];
    let hChildren = [];
    for(let i=0; i<labels.length; i++){
        if(i===0)
            hChildren.push(<th key={"cormo-header-"+ i}>{" "}</th>);
        hChildren.push(<th key={"cormo-"+labels[i]}>{labels[i]}</th>);
        //console.log(labels[i]);
    }
    tableHeader.push(<thead key="cormo-table-header"><tr key="cormobities">{hChildren}</tr></thead>);

    let tableBody = [];
    let bParent = [];

    let label_length = labels.length;
    let bChild = [];
    let idx = 0;
    for(let i=0; i<corrMat.length; i++){
        if(i%label_length === 0){
            bChild = [];
            bChild.push(<td key={"cormo-label-"+idx}><b>{labels[idx++]}</b></td>);
        }
        bChild.push(<td key={"cormo-corr-"+i}>{corrMat[i]["coeff"]}</td>);
        if(i%label_length === label_length -1 ){
            bParent.push(<tr key={"cormo-"+i+"th-row-"+(i%label_length)+"th-col"}>{bChild}</tr>);
        }
    }
    tableBody.push(<tbody key="cormo-table-body">{bParent}</tbody>);
    corrTable.push(tableHeader);
    corrTable.push(tableBody);

    return corrTable;
}

export default DeathsCorrelationTable;