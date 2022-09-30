import React, { useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer";

const ReactSpeedometerComponent = (props) => {
    return (<ReactSpeedometer
        fluidWidth={true}
        forceRender={true}
        minValue={145}
        maxValue={0}
        value={props.value}
       //  value={2}
        customSegmentStops={props.customSegmentStops}
        customSegmentLabels={[
            {
                // text: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryLow : 'Very Low',
                text: 'Very Poor',
                position: "INSIDE",
                color: "#002a4a",
                fontSize: "16px"
            },
            {
                // text: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).low : 'Low',
                text: 'Poor',
                position: "INSIDE",
                color: "#002a4a",
                fontSize: "16px"
            },
            {
                // text: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).medium : 'Medium',
                text: 'Fair',
                position: "INSIDE",
                color: "#002a4a",
                fontSize: "16px"
            },
            {
                // text: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).high : 'High',
                text: 'Good',
                position: "INSIDE",
                color: "#002a4a",
                fontSize: "16px"
            },
            {
                // text: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryHigh : 'Very High',
                text: 'Excellent',
                position: "INSIDE",
                color: "#002a4a",
                fontSize: "16px"
            },
        ]}
        width={300}
        height={300}
        segmentColors={[
            "#FF0000",
            "#E06666",
            "#FF9900",
            "#38761D",
            "#76F013",
        ]}
        // currentValueText="Current Value: #{value}"
        // currentValueText={i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.score + " : ${value}"}
        currentValueText={props.currentValueText}
        needleColor="#002a4a"
        needleTransitionDuration={4000}
        needleTransition="easeElastic"
        textColor={'black'}
    />
    )
}

export default ReactSpeedometerComponent;