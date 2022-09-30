import React, { useState, useEffect, useRef } from 'react';
import './../App.css';
import ReactSpeedometer from "../components/ReactSpeedometerComponent";
import ApexCharts from "react-apexcharts";
import 'leaflet/dist/leaflet.css';
import i18n from './../utils/i18n';
import _validator from './../config/validator';
import Speech from 'speak-tts';
import IdleTimer from 'react-idle-timer';

import { useIdleTimer } from 'react-idle-timer';
import { useMap, useGraphics } from 'esri-loader-hooks';
import { setDefaultOptions } from "esri-loader";
import { isString } from 'lodash';
import { getLocations, sendFeedback } from './../services/webServices';
import { geolocated } from "react-geolocated";
import { useLocation } from "react-router-dom";

setDefaultOptions({ css: true });

const ResultDashboard = (props) => {

   
    const map = {
        basemap: "streets-vector",
        ground: "world-elevation"
    };
    const location = useLocation();
    const options = {
        view: {
            center: location.state && location.state.position ? [location.state.position[1], location.state.position[0]] : [1, 1],
            zoom: 12
        }
    };

    const [ref, view] = useMap(map, options);
    const graphics = [];
    useGraphics(view, graphics);

    const handleOnIdle = event => {
        console.log('user is idle', event)
        console.log('last active', getLastActiveTime())
        localStorage.removeItem('LoginData');
        props.history.replace({
            pathname: 'login',
        })
    }
    const handleOnActive = event => {
    }

    const handleOnAction = event => {
    }

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 60 * 15,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500,
        crossTab: true
    })

    const position1 = [17.505, 75.09]
    const [position, setPosition] = useState([17, 75]);
    const [focusOn, setFocusOn] = useState(Array());
    const [nearme, setNearme] = useState(Array());
    const [adviceSpeech, setAdviceSpeech] = useState('');
    const [userId, setUserId] = useState('');
    const [assesmentType, setAssesmentType] = useState('');
    const [submitFeedback, setSubmitFeedback] = useState(false);
    const [fromResultPage, setFromResultPage] = useState(false);
    const [switchToCovidDashboard, setSwitchToCovidDashboard] = useState(true);

    const [state, setState] = useState({
        PSSI:0,
        SDRI:0,
        risk_value:0
    });

    const [stateMultiHazard, setStateMultiHazard] = useState({
        PSSI:0,
        SDRI:0,
        risk_value:0,
        hazardsArray: []
    });

    const [pastData, setPastData] = useState({
        PSSI:0,
        SDRI:0,
        risk_value:0
    });

    const [pastDataMultiHazard, setPastDataMultiHazard] = useState({
        PSSI:0,
        SDRI:0,
        risk_value:0,
        hazardsArray: []
    });

    const [feedbackForm, setFeedbackForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        feedback: '',
        fullNameError: true,
        emailError: true,
        phoneError: true,
        feedbackError: true
    });

    
    // const [language, setLanguage] = useState('en');
    const [language, setLanguage] = useState('');
    const [orientation, setOrientation] = useState(0)
    const [orientationMode, setOrientationMode] = useState('portrait')

    useEffect(() => {
        if (window.matchMedia("(orientation: portrait)").matches) {
            setOrientationMode('portrait')
        }

        if (window.matchMedia("(orientation: landscape)").matches) {
            setOrientationMode('landscape')
        }
    }, [orientation])

    useEffect(() => {
        window.onorientationchange = function (event) {
            setOrientation(event.target.screen.orientation.angle)
        };

        navigator.geolocation.getCurrentPosition((position) => {
            setPosition([position.coords.latitude, position.coords.longitude])
        })
    }, [])

    useEffect(() => {
        init();
    }, [adviceSpeech]);

    useEffect(() => {
        let language = localStorage.getItem('language');
        //debugger;
        setLanguage(language);
        
        if (location.state && (location.state.pastResultData || location.state.pastHazardResultData)) {
            if (location.state.pastResultData) {
              
                setPastData(location.state.pastResultData);
                setState(
                    prevState => {
                        return { ...prevState, Ro: location.state.pastResultData.Ro ? location.state.pastResultData.Ro : 0 }
                    }
                )
            }
            if (location.state.pastHazardResultData) {
                setStateMultiHazard(location.state.pastHazardResultData)
                // setStateMultiHazard(location.state.pastResultData);
                setPastDataMultiHazard(location.state.pastHazardResultData);

                setStateMultiHazard(
                    prevState => {
                        return { ...prevState, risk_value: location.state.pastHazardResultData.risk_value ? location.state.pastHazardResultData.risk_value : 0, Ro: location.state.pastHazardResultData.risk_value ? location.state.pastHazardResultData.risk_value : 0, hazardsArray: location.state.pastHazardResultData.hazardsArray ? location.state.pastHazardResultData.hazardsArray : [] }
                    }
                )
            }
            
            setUserId(location.state.userId ? location.state.userId : '');
            let temp, arr = [], Ro;

          

            setFocusOn(arr);
            let array = [];
            let urlAppend = `latitude=${location.state.position[0]}&longitude=${location.state.position[1]}&radius=50000000000`
           
            getLocations(urlAppend, (CB) => {
                if (CB.status === 'Success') {
                    let data = CB.data;
                    if (data.length) {
                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];
                            let score = isString(element.score) ? JSON.parse(element.score) : element.score;
                            if (element.longitude != 0 && element.latitude != 0) {
                                array.push(
                                    {
                                        geometry: {
                                            type: "point",
                                            longitude: element.longitude,
                                            latitude: element.latitude
                                        },
                                        symbol: {
                                            type: "picture-marker",
                                            url: score && score.Ro < 1.99
                                                ?
                                                require('./../assets/img/Location/green.png')
                                                :
                                                ((score && score.Ro > 1.99) && (score && score.Ro < 5.2))
                                                    ?
                                                    require('./../assets/img/Location/orange.png')
                                                    :
                                                    require('./../assets/img/Location/red.png'),
                                            // url: require('./../assets/img/Location/green.png'),
                                        },
                                        user_id: element.user_id
                                    }
                                )
                            }
                        }
                    }
                    array.push({
                        geometry: {
                            type: "point",
                            longitude: location.state && location.state.position ? location.state.position[1] : 0,
                            latitude: location.state && location.state.position ? location.state.position[0] : 0
                        },
                        symbol: {
                            type: "picture-marker",
                            url: Ro < 1.99
                                ?
                                require('./../assets/img/Location/green.png')
                                :
                                ((Ro > 1.99) && (Ro < 5.2))
                                    ?
                                    require('./../assets/img/Location/orange.png')
                                    :
                                    require('./../assets/img/Location/red.png'),
                            // url: require('./../assets/img/Location/green.png'),
                        },
                        user_id: null
                    })
                    setNearme(array)
                } else {
                    array.push({
                        geometry: {
                            type: "point",
                            longitude: location.state && location.state.position ? location.state.position[1] : 0,
                            latitude: location.state && location.state.position ? location.state.position[0] : 0
                        },
                        symbol: {
                            type: "picture-marker",
                            url: Ro < 1.99 ? require('./../assets/img/Location/green.png') : ((Ro > 1.99) && (Ro < 5.2)) ? require('./../assets/img/Location/orange.png') : require('./../assets/img/Location/red.png'),
                            // url: require('./../assets/img/Location/green.png'),
                        },
                        user_id: null
                    })
                    setNearme(array)
                }
            });

            // let adviceSpeech = i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.adviceforYou;
            let adviceSpeech = localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).adviceforYou : '';

          
                // if (temp.Ro > 520) {
                //     // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.veryHighRisk + '-' + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.veryHighRiskData;
                //     adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryHighRisk : '' + '-' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryHighRiskData : ''
                // }
                // else if ((temp.Ro >= 390) && (temp.Ro <= 520)) {
                //     // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.highRisk + '-' + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.highRiskData
                //     adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).highRisk : '' + '-' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).highRiskData : ''
                // }
                // else if ((temp.Ro > 260) && (temp.Ro < 390)) {
                //     // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.mediumRisk + '-' + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.mediumRiskData
                //     adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).mediumRisk : '' + '-' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).mediumRiskData : ''
                // }
                // else if ((temp.Ro >= 130) && (temp.Ro <= 260)) {
                //     // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.lowRisk + '-' + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.lowRiskData
                //     adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).lowRisk : '' + '-' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).lowRiskData : ''
                // }
                // else if (temp.Ro < 130) {
                //     // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.veryLowRisk + '-' + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.veryLowRiskData
                //     adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryLowRisk : '' + '-' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).veryLowRiskData : ''
                // }
            

            let focusOn = ''
            arr.map((item, index) => {
                return index >= (arr.length - 1) ? focusOn = focusOn + item + '' : focusOn = focusOn + item + ', '
            })
            // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.focusOn + focusOn + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.focusOnsecond
            adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).focusOn : '' + focusOn + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).focusOnsecond : ''
            adviceSpeech = adviceSpeech + 'As the business has high exposure to disasters, emergency plan and detailed disaster control measures for the business should be made available to the workers employed.'
            // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement1 + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement2a + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement2b + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement3a + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement3b
            adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement1 : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement2a : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement2b : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement3a : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement3b : ''

            setAdviceSpeech(adviceSpeech);
        }
       
        if (location.state && (location.state.resultData || location.state.hazardresultData || location.state.guestUser)) {
          
            if (location.state.resultData && location.state.assesment_type && (location.state.assesment_type !== 'multihazard')) {
                setState(location.state.resultData);
            }
            if (location.state.hazardresultData) {
                setStateMultiHazard(location.state.hazardresultData);
            }

            if (location.state.pastData) {
                setPastData(location.state.pastData);
            }
            if (location.state.pastDataMultiHazard) {
                setPastDataMultiHazard(location.state.pastDataMultiHazard);
            }
            setUserId(location.state.userId ? location.state.userId : '');

            setAssesmentType(location.state.assesment_type ? location.state.assesment_type : 'covid')
            let switchToCovidDashboardtemp = switchToCovidDashboard;
            if (!fromResultPage) {
                setSwitchToCovidDashboard(location.state.assesment_type === 'multihazard' ? false : true);   
                switchToCovidDashboardtemp = location.state.assesment_type === 'multihazard' ? false : true;
            }
            let temp, arr = [], Ro;
          
            setFocusOn(arr);
            let array = [];
            let urlAppend = `latitude=${location.state.position[0]}&longitude=${location.state.position[1]}&radius=50000000000`

            if (location.state.assesment_type === 'multihazard') {
                setStateMultiHazard(location.state.resultData)
            }
            getLocations(urlAppend, (CB) => {
                if (CB.status == 'Success') {
                    let data = CB.data;
                    if (data.length) {
                        for (let index = 0; index < data.length; index++) {
                            const element = data[index];
                            let score = isString(element.score) ? JSON.parse(element.score) : element.score;
                            if (element.longitude != 0 && element.latitude != 0) {
                                array.push(
                                    {
                                        geometry: {
                                            type: "point",
                                            longitude: element.longitude,
                                            latitude: element.latitude
                                        },
                                        symbol: {
                                            type: "picture-marker",
                                            url: score && score.Ro < 1.99 ? require('./../assets/img/Location/green.png') : ((score && score.Ro > 1.99) && (score && score.Ro < 5.2)) ? require('./../assets/img/Location/orange.png') : require('./../assets/img/Location/red.png'),
                                            // url:  require('./../assets/img/Location/green.png'),
                                        },
                                        user_id: element.user_id
                                    }
                                )
                            }
                        }
                    }
                    array.push({
                        geometry: {
                            type: "point",
                            longitude: location.state && location.state.position ? location.state.position[1] : 0,
                            latitude: location.state && location.state.position ? location.state.position[0] : 0
                        },
                        symbol: {
                            type: "picture-marker",
                            // url: Ro < 1.99 ? require('./../assets/img/Location/green.png') : ((Ro > 1.99) && (Ro < 5.2)) ? require('./../assets/img/Location/orange.png') : require('./../assets/img/Location/red.png'),
                            url: require('./../assets/img/Location/green.png'),
                        },
                        user_id: null
                    })
                    setNearme(array)

                } else {
                    array.push({
                        geometry: {
                            type: "point",
                            longitude: location.state && location.state.position ? location.state.position[1] : 0,
                            latitude: location.state && location.state.position ? location.state.position[0] : 0
                        },
                        symbol: {
                            type: "picture-marker",
                            // url: Ro < 1.99 ? require('./../assets/img/Location/green.png') : ((Ro > 1.99) && (Ro < 5.2)) ? require('./../assets/img/Location/orange.png') : require('./../assets/img/Location/red.png'),
                            url: require('./../assets/img/Location/green.png'),
                        },
                        user_id: null
                    })
                    setNearme(array)

                }
            });

            let adviceSpeech = i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.adviceforYou;
         
          
            let focusOn = ''
            arr.map((item, index) => {
                return index >= (arr.length - 1) ? focusOn = focusOn + item + '' : focusOn = focusOn + item + ', '
            })
            // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.focusOn + focusOn + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.focusOnsecond
            adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).focusOn : '' + focusOn + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).focusOnsecond : ''

            // adviceSpeech = adviceSpeech + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement1 + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement2a + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement2b + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement3a + i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.statement3b
            // setAdviceSpeech(adviceSpeech);
            adviceSpeech = adviceSpeech + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement1 : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement2a : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement2b : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement3a : '' + localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).statement3b : ''
        }
        init();
    }, [location ]);
       
      
    let chartState = {
        series: location.state && location.state.pastResultData
        ?
        [
            {
                name: i18n['en'].resultDashboard.highScorePossible,                       
                data: [120.50, 145.0]
            },
            {
                name: i18n['en'].resultDashboard.yourScore,                       
                data: [pastData.PSSI, pastData.SDRI,]
            },
           
            {
                name: i18n['en'].resultDashboard.lowScorePossible,
               
                data: [22.50,47.00]
            }
        ]:    location.state && location.state.guestUser ?
        [
            {
                name: i18n['en'].resultDashboard.highScorePossible,                       
                data: [120.50, 145.0]
            },
            {
                
                name: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).yourScore : '',
                data: [state.PSSI, state.SDRI]
            },
            {
                name: i18n['en'].resultDashboard.lowScorePossible,
               
                data: [22.50,47.00]
            }
        ]
        :
        [
            {
                name: i18n['en'].resultDashboard.highScorePossible,                       
                data: [120.50, 145.0]
            },
            {
               
                name: localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).lastevaluatedScore : '',
                data: [location.state?.resultData?.PSSI   , location.state?.resultData?.SDRI]
            },
            {
                name: i18n['en'].resultDashboard.lowScorePossible,
               
                data: [22.50,47.00]
            }
        ]
                ,
        options: {
            chart: {
                width: '100%',
                type: 'line',
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.2
                },
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            colors:  ['#FF0000', '#4c4ce4', '#76F013'] ,
            dataLabels: {
                enabled: true,
            },
            stroke: {
                width: ((location.state && location.state.pastResultData) || (location.state && location.state.guestUser)) ? [3, 5, 3] : [3, 5, 3, 3],
                curve: 'smooth',
                dashArray: ((location.state && location.state.pastResultData) || (location.state && location.state.guestUser)) ? [3, 0, 3] : [3, 0, 0, 3]
            },
            title: {
                text: i18n['en'].resultDashboard.legends,
                align: 'left'
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            markers: {
                size: 1
            },
            xaxis: {
                categories: ['PSSI','SDRI' ],
            },
            yaxis: {
                min: 10,
                max: 150
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -25,
                offsetX: -5
            },
        },
    }

    const submitFeedbackForm = (e) => {
        e.preventDefault()
        setSubmitFeedback(true);

        if (feedbackForm.fullName === '') {
            setFeedbackForm(prevState => {
                return {
                    ...prevState, fullNameError: true
                }
            })
        }
        if (feedbackForm.email === '') {
            if (!_validator.verifyEmail(feedbackForm.email)) {
                setFeedbackForm(prevState => {
                    return {
                        ...prevState, emailError: true
                    }
                })
            }
        }
        if (feedbackForm.feedback === '') {
            setFeedbackForm(prevState => {
                return {
                    ...prevState, feedbackError: true
                }
            })
        }
        if (!feedbackForm.fullNameError && !feedbackForm.emailError && !feedbackForm.feedbackError &&
            feedbackForm.fullName !== '' && feedbackForm.email !== '' && feedbackForm.feedback !== '') {
            let payload = {
                name: feedbackForm.fullName,
                email: feedbackForm.email,
                phone: feedbackForm.phone,
                feedback: feedbackForm.feedback
            }
            sendFeedback(payload, (CB) => {
                if (CB.status == 'Success') {
                    alert('Thank you for feedback')
                }
                setSubmitFeedback(false)
                setFeedbackForm(prevState => {
                    return {
                        ...prevState, feedback: '', feedbackError: true, fullName: '', fullNameError: true,
                        phone: '', phoneError: true, email: '', emailError: true
                    }
                })
            });

        }
    }

    if (nearme.length) {
        for (let index = 0; index < nearme.length; index++) {
            const element = nearme[index];
            if (location.state.userId == null || location.state.userId === undefined || location.state.userId == '') {
                graphics.push(element);
            } else if (element.user_id !== userId) {
                graphics.push(element);
            }
        }

    }

    const init = () => {
        const speech = new Speech();
        speech.init({
            volume: 0.5,
            lang: "es-ES",
            rate: 1,
            pitch: 1,
            listeners: {
                onvoiceschanged: voices => {
                }
            }
        })
            .then(data => {
                prepareSpeakButton(speech);
            })
            .catch(e => {
                console.error("An error occured while initializing : ", e);
            });
    }

    const prepareSpeakButton = (speech) => {
        const speakButton = document.getElementById("play");
        const pauseButton = document.getElementById("pause");
        const resumeButton = document.getElementById("resume");
        speakButton.addEventListener("click", () => {
            const lang = language == 'en' ? "en-GB" : "es-ES";
            if (lang) speech.setLanguage(lang);
            speech.speak({
                text: adviceSpeech,
                queue: false,
                listeners: {
                    onstart: () => {
                    },
                    onend: () => {
                    },
                    onresume: () => {
                    },
                    onboundary: event => {
                    }
                }
            })
                .then(data => {
                })
                .catch(e => {
                    console.error("An error occurred :", e);
                });
        });

        pauseButton.addEventListener("click", () => {
            speech.pause();
        });

        resumeButton.addEventListener("click", () => {
            speech.resume();
        });
    }

    const onTextChange = ({ target: { name, value } }) => {
        switch (name) {
            case "email":
                if (_validator.verifyEmail(value)) {
                    if (_validator.verifyEmail(value)) {
                        setFeedbackForm(prevState => {
                            return { ...prevState, email: value, emailError: false }
                        })
                    }
                } else {

                }
                break;
            default:
                break;
        }
    }

    return (
        <section className="bg-img" style={{ height: '100%',objectFit:'contain', backgroundColor: '#ffffff' }}>
            <div className="container-fluid">
                <div className="row head-img">
                    <div className="col-md-12 ">
                        <div className="row tabmargin">
                            <div className="col-md-6 col-6 d-flex">
                                <a target="_blank" href='https://www.cdri.world/'>
                                    <img alt="cdri logo" style={{ marginTop: '20px', marginLeft: '2vw', width: '150px' }} src={require('./../assets/img/images/cdri-logo.png')} className="img-fluid" />
                                </a>
                                <a target="_blank" href='https://rikaindia.com/'>
                                    <img alt="UNDRR logo" style={{marginTop: '20px', marginLeft: '2vw', width: '140px' }} src={require('./../assets/img/images/rikalogo.png')} className="img-fluid" />
                                </a>
                                <a target="_blank" href='https://www.keio.ac.jp/en/'>
                                    <img alt="UNDRR logo" style={{ marginTop: '20px', marginLeft: '2vw', width: '85px' }} src={require('./../assets/img/images/keio.jpg')} className="img-fluid" />
                                </a>
                            </div>
                            <div className="col-md-5 col-5" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row" style={{ backgroundColor: '#dedede', margin: '0px' }}>
                <div className="col-md-3 col-12 padd-0" style={{ width: '100vw', backgroundColor: '#dedede' }} >
                    <p style={{ color: '#b91c26', padding: '2vh', margin: 0, marginLeft: '1vw', fontFamily: 'Roboto' }}>
                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).toolName : ''}
                    </p>
                </div>
                <div className="col-md-5 col-1 padd-0 AudioControl" style={{ backgroundColor: '#dedede', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
                    <div>
                        <p style={{ color: '#b91c26', padding: '2vh', margin: 0, marginLeft: '1vw', fontFamily: 'Roboto' }}>
                            {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).audioAssistance : ''}
                        </p>
                    </div>
                    <div className='AudioControl' style={{ backgroundColor: '#b91c26', padding: '5px', borderRadius: 5, display: 'flex', flexDirection: 'row' }}>
                        <div id="play" className='play'></div>
                        <div id="pause" className='pause'></div>
                        <div id="resume" className='resume'></div>
                    </div>
                </div> 
                <div
                    className="col-md-1"
                    style={{ width: '100vw', backgroundColor: '#dedede', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    {/* <button
                        className='btn '
                        style={{ backgroundColor: '#b91c26' }}
                        onClick={() => {
                            window.history.back()
                        }}>
                        <img
                            alt="home"
                            style={{ height: 25, width: 25 }}
                            src={require('./../assets/img/home.png')} />
                    </button> */}
                </div>
                <div
                    className="col-md-2"
                    style={{ display: 'flex', justifyContent: 'center', padding: '5px' }}>
                    <button onClick={() => {
                        if (location.state && (location.state.pastResultData || location.state.pastHazardResultData)) {
                            props.history.replace({
                                pathname: 'questionnaire',
                                state: { userId: userId, prevData: pastData, prevMultiHazardData: pastDataMultiHazard }
                            })
                        }
                        else {
                            props.history.replace({
                                pathname: 'questionnaire',
                                state: { userId: userId }
                            })
                        }
                    }} className='btn ' style={{ backgroundColor: '#b91c26',color:'#ffffff' }} type="submit">
                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).retakesurvey : ''}
                    </button>
                </div>
                <div
                    className="col-md-1 backButtonForMobile"
                    style={{ width: '100vw', backgroundColor: '#dedede', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                    <button
                        className='btn '
                        style={{ backgroundColor: '#b91c26',color:'#ffffff' }}
                        onClick={() => {
                            localStorage.removeItem('LoginData');
                            props.history.replace({
                                pathname: 'login',
                            })
                        }}>
                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).logout : ''}
                    </button>
                </div>
            </div >
            <div className="container-fluid padd-0" style={{ height: '100%', backgroundColor: '#ffffff' }}>                
                <div className="row">
                    <div className="col-md-6 col-12">
                        <div className="row" style={{ justifyContent: 'center' }}>
                            <div className="col-md-10 col-10">
                                <div className="fields-container">
                                    <div className="col-md-12 top-20 login-heading">
                                        <label className="card-title" >
                                            RISE Index score
                                        </label>
                                    </div>
                                    <div className="col-md-12 login-wht-box" style={{ padding: '10px' }}>
                                        <div className='row commonCards' style={{ height: '50vh', display: 'flex', justifyContent: 'center' }}>
                                            {
                                               
                                                language === 'En' || language === 'en'
                                                    ?
                                                    switchToCovidDashboard ?
                                                        <ReactSpeedometer
                                                            minValue={0}
                                                            maxValue={10} 
                                                            value={parseInt(stateMultiHazard.risk_value)}
                                                            customSegmentStops={[145,120.5,96.00,71.50,47.00,0]}
                                                            currentValueText={localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).score + " : ${value}" : ''}
                                                        />
                                                        :
                                                        <ReactSpeedometer
                                                            minValue={0}
                                                            maxValue={1110}
                                                            value={parseInt(stateMultiHazard.risk_value)}                                                         
                                                            customSegmentStops={[145,120.5,96.00,71.50,47.00,0]}
                                                            currentValueText={localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).score + " : ${value}" : ''}
                                                        />
                                                    :
                                                    null
                                            }
                                        </div>
                                    </div>
                                </div >
                            </div>
                        </div >
                    </div >
                    <div className="col-md-6 col-12 ">
                        <div className="row" style={{ justifyContent: 'center' }}>
                            <div className="col-md-10 col-10">
                                <div className="fields-container">
                                    <div className="col-md-12 top-20 login-heading">
                                        <label className="card-title" >
                                            Indicator wise performance  
                                        </label>
                                    </div>
                                    <div className="col-md-12 login-wht-box">
                                        <div className='row commonCards' style={{ height: '52vh', overflow: 'scroll' }}>
                                            <ApexCharts
                                                options={
                                                     chartState.options
                                                }
                                                series={
                                                    chartState.series
                                                }
                                                height='80%'
                                                type="line"
                                                width={window.innerWidth < 481 ? "300" : ((window.innerWidth > 481) && (window.innerWidth < 1224)) ? "400" : "500"}
                                            />

                                            <div style={{ fontFamily: 'Roboto', color: '#002a4a', fontSize: 14, paddingLeft: '15px', paddingRight: '15px', marginTop: '-20px' }}>
                                                {
                                                    <>
                                                        <strong>
                                                            PSSI - Parental School Selection Indicators 
                                                        </strong>
                                                        <br />
                                                        <strong>
                                                            SDRI - School Disaster Resilience Indicators
                                                        </strong>
                                                    </> 
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
                <div style={{ height: 40 }} />
                {/* <div className="row">
                    <div className="col-md-6 col-12">
                        <div className="row" style={{ justifyContent: 'center' }}>
                            <div className="col-md-10 col-10">
                                <div className="fields-container">
                                    <div className="col-md-12 top-20 login-heading">
                                        <label className="card-title" >
                                            {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).riskAroundYou : ''}
                                        </label>
                                    </div>
                                    <div className="col-md-12 login-wht-box padd-0 commonCards mapCard">
                                        {
                                            navigator.onLine ?
                                                <div className='row commonCards ' ref={ref} style={{ width: '99%', height: '100%', margin: 0 }}>
                                                </div>
                                                :
                                                <div className='row commonCards ' style={{ width: '99%', height: '100%', margin: 0 }}>
                                                </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 
                </div> */}
            </div>
            <div className="container-fluid padd-0" style={{width:'100%', height: '100%', backgroundColor: '#ffffff' }} >
                <div className="row">
                    <div className="container-contact100">
                        <div className="wrap-contact100">
                            <form className="contact100-form validate-form">
                                <span className="contact100-form-title">
                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).feedbackForm : ''}
                                </span>
                                <div className="wrap-input100 validate-input bg1" data-validate="Please Type Your Name">
                                    <span className="label-input100">
                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).fullName : ''} *
                                    </span>
                                    <input
                                        className="input100"
                                        maxLength={50}
                                        type="text"
                                        onChange={(e) => {
                                            let val = e.target.value
                                            let regex = /^[\u0621-\u064AA-Za-z \n]{0,50}$/;
                                            if (regex.test(val)) {
                                                setFeedbackForm(prevState => {
                                                    return { ...prevState, fullName: val, fullNameError: false }
                                                })
                                            }

                                        }}
                                        aria-label={'name'}
                                        aria-required="true"
                                        value={feedbackForm.fullName}
                                        name="name"
                                        placeholder={
                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).fullNamePlaceholder : ''
                                        } />
                                    {
                                        submitFeedback && feedbackForm.fullNameError
                                            ?
                                            <p
                                                style={{ paddingLeft: 5, color: 'red', fontSize: 12 }}>
                                                {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).fullNameErr : ''}
                                            </p>
                                            :
                                            null
                                    }
                                </div>
                                <div className="wrap-input100 validate-input bg1 rs1-wrap-input100" data-validate="Enter Your Email (e@a.x)">
                                    <span className="label-input100">{i18n[language == 'sp' ? 'sp' : 'en'].resultDashboard.email} *</span>
                                    <input
                                        placeholder={
                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).emailPlaceholder : ''
                                        }
                                        aria-label={'email'}
                                        aria-required="true"
                                        className="input100"
                                        maxLength={50}
                                        value={feedbackForm.email}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            setFeedbackForm(prevState => {
                                                return { ...prevState, email: val, emailError: false }
                                            })
                                        }}
                                    />
                                    {
                                        submitFeedback && feedbackForm.emailError ?
                                            <p style={{ paddingLeft: 5, color: 'red', fontSize: 12 }}>
                                                {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).emailErr : ''}
                                            </p>
                                            :
                                            null
                                    }
                                </div>
                                <div className="wrap-input100 bg1 rs1-wrap-input100">
                                    <span className="label-input100">
                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).phoneNumber : ''}
                                    </span>
                                    <input
                                        className="input100"
                                        maxLength={12}
                                        value={feedbackForm.phone}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            let regex = /^[0-9]{0,32}$/;
                                            if (regex.test(val)) {
                                                setFeedbackForm(prevState => {
                                                    return { ...prevState, phone: val, phoneError: false }
                                                })
                                            }
                                        }}
                                        aria-label={'phone'}
                                        aria-required="true"
                                        type="text"
                                        name="phone"
                                        placeholder={
                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).phoneNumberPlaceholder : ''
                                        }
                                    />
                                </div>
                                <div className="wrap-input100 validate-input bg0 rs1-alert-validate" data-validate="Please Type Your Message">
                                    <span className="label-input100">
                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).feedbackmsg : ''}*
                                    </span>
                                    <textarea className="input100"
                                        aria-label={'message'}
                                        aria-required="true"
                                        maxLength={250}
                                        name="message"
                                        value={feedbackForm.feedback}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            let regex = /^[a-zA-Z0-9 ]{0,250}$/;
                                            if (regex.test(val)) {
                                                setFeedbackForm(prevState => {
                                                    return { ...prevState, feedback: val, feedbackError: false }
                                                })
                                            }
                                        }}
                                        placeholder={
                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).feedbackmsgPlaceholder : ''
                                        }
                                    >
                                    </textarea>
                                    {
                                        submitFeedback && feedbackForm.feedbackError
                                            ?
                                            <p style={{ paddingLeft: 5, color: 'red', fontSize: 12 }}>
                                                {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).feedbackmsgErr : ''}
                                            </p>
                                            :
                                            null
                                    }
                                </div>
                                <div className="container-contact100-form-btn">
                                    <button
                                        onClick={submitFeedbackForm}
                                        className="contact100-form-btn">

                                        <span>
                                            {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).submit : ''}
                                        </span>

                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default geolocated({
    positionOptions: {
        enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
})(ResultDashboard);
