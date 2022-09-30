import React, { useState, useEffect, useRef } from 'react';
import './../App.css';
import "react-sweet-progress/lib/style.css";
import CurrencyFormat from 'react-currency-format';
import i18n from './../utils/i18n';
import Speech from 'speak-tts';
import IdleTimer from 'react-idle-timer';
import { geolocated } from "react-geolocated";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import { Modal, Popover, Overlay, ProgressBar } from 'react-bootstrap';
import { saveQuesionsService } from './../services/webServices';
import { Progress } from 'react-sweet-progress';
import { useLocation } from "react-router-dom";
import { useIdleTimer } from 'react-idle-timer';
import { forEach } from 'lodash';
import { geocodeByAddress, getLatLng, geocodeByPlaceId } from 'react-places-autocomplete';
import Geocode from "react-geocode";
var _ = require('lodash');
Geocode.setApiKey("AIzaSyC2BN60j-uCGTnKhAsxFtspaUW-DcHX0yE");
Geocode.setLanguage("en");
Geocode.setRegion("es");
Geocode.enableDebug();
const Questionnaire = (props) => {

    const allQuestionArray = {
        'En': [
            { que: 'Select  business type?', type: 'select', options: [{ name: 'Manufacturing' }, { name: 'Transportation and Supply Chain' }, { name: 'Hospitality' }, { name: 'Food and Beverage' }, { name: 'Software/IT ' }, { name: 'Construction and Real estate' }, { name: 'Agribusiness' }, { name: 'Consultancy' }, { name: 'Education' }, { name: 'Travel and Tourism' }, { name: 'Media and Entertainment' }, { name: 'Electronics and Telecommunication' }, { name: 'Healthcare' }, { name: 'Microfinance institutions' }, { name: 'Retail and Wholesale' }, { name: 'NGO/NPO' }] },
            { que: 'Are you one of the owners of the business?', type: 'radio', options: [{ name: 'Yes' }, { name: 'No' }] },
            { que: 'Is one of the owners of the business a female?', type: 'radio', options: [{ name: 'Yes' }, { name: 'No' }] },
            { que: 'What is the total number of offices/manufacturing units/stores/ warehouses the business has?', type: 'textinput' },
            { que: 'What is the business’s annual revenue (in local currency)?', type: 'textinput' },
            { que: 'What is the total number of staff/employees/workers the business has?', type: 'textinput' },
            { que: 'Type of business?', type: 'select', options: [{ name: 'Sole proprietor' }, { name: 'Partnership' }, { name: 'Limited Liability Company' }, { name: 'Corporation' }, { name: 'Cooperative / Trust / Society' }, { name: 'Not yet registered' }, { name: 'NGO/NPO' }] },
            { que: 'Country?', type: 'select' },
            { que: 'Province?', type: 'select' },
            { que: 'Postal/Zip/Pin code? (optional)', type: 'textinput' },

            { que: 'Does the business have a Business Continuity Plan (BCP)?', type: 'radio', options: [{ name: 'Yes, It has a plan and it considers health emergencies (pandemic/outbreak)' }, { name: 'Yes, It has a plan but it does not consider health emergencies (pandemic/outbreak)' }, { name: 'It does not have a Business Continuity Plan' }, { name: 'I am unaware of the term "Business Continuity Plan"' }, { name: `I don’t know if it has a BCP.` }] },
            { que: `Has the business implemented its Business Continuity Plan (BCP)?`, type: 'radio', options: [{ name: 'Yes (fully)' }, { name: 'Yes (partly)' }, { name: 'No' }], conditional: true },
            { que: `What has been COVID-19's impact on the business? `, type: 'checkbox', options: [{ title: 'Impact on production and services', innerOptions: ['Increase', ' Decline', ' No change'] }, { title: 'Impact on market access', innerOptions: ['Increase', 'Decline', 'No change'] }, { title: 'Impact on cashflow and sales', innerOptions: ['Increase', 'Decline', 'No change'] }, { title: 'Overall impact on employees (e.g. productivity, retention)', innerOptions: ['Positive', 'Negative', 'Mixed', 'No change'] }] },
            { que: 'How long do you think it will take for the business to fully recover from the present situation?', type: 'radio', options: [{ name: 'Already fully recovered' }, { name: 'Less than 6 months' }, { name: 'Between 6 months to 1 year' }, { name: 'More than 1 year' }, { name: 'Not sure/Cannot predict' }] },

            { que: 'How worried are you that the business operations would be impacted by employee unavailability or absenteeism?', type: 'radio', options: [{ name: 'Not at all worried as most of the systems are automated or employees are available', score: 0 }, { name: 'Not so worried as family members and/or friends can or are filling any employee shortages', score: 1 }, { name: 'Worried as the business relies on employees and the business has no other support', score: 2 }] },
            { que: `Are the employees permanent/regular or temporary? \n (Permanent means no fixed end date of employment/have access to superannuation and eligible for company benefits such as pension fund, employer contribution; and Temporary means they are paid by a daily wage or short term contract).`, type: 'radio', options: [{ name: 'All of the employees are permanent or come from amongst the family members', score: 0 }, { name: 'Majority of the employees are permanent or come from amongst the family members (more than 50%)', score: 1 }, { name: 'Approximately there are equal numbers of permanent and temporary employees', score: 1 }, { name: 'Majority of the employees are temporary (more than 50%)', score: 2 }, { name: 'All of the employees are temporary', score: 3 }] },
            { que: 'How would you describe most of the employees in the business? ', multipleText: true, type: 'checkbox', options: [{ name: 'Family members' }, { name: `Friends and neighbours` }, { name: 'Seasonal / Migrant workers / Casual workers / Daily wagers' }, { name: 'Others' }] },
            { que: 'What are the actions the business has  taken /or efforts made to ensure the well-being of the employees? ', multipleText: true, type: 'checkbox', options: [{ name: 'Employees may work remotely/ office space transformed to minimise physical contact', score: 1 }, { name: `Management regularly engages with employee and effectively communicates with them on company's position to COVID-19 and its possible implications`, score: 1 }, { name: 'Management periodically conducts employee support programs to help them with mental and physical wellbeing', score: 1 }, { name: 'Management encourages employees to acquire new skill sets and knowledge to fill in for other employees who are unable to come to work and/or to increase their personal skills', score: 1 }, { name: 'Management guaranteeing income/salary of the employees even if the business has to temporarily close or downsize the operation.', score: 1 }, { name: 'None of these', score: 5 }] },
            { que: 'Does the business require close physical contact or distance with people?', type: 'radio', options: [{ name: 'a. Close physical distance to customers and clients (shops, restaurants etc.)', score: 1 }, { name: 'b. Close physical distance to other employees (manufacturing units, shops, etc.)', score: 1 }, { name: 'c. Both a & b', score: 2 }, { name: 'd. None of these', score: 0 }] },
            { que: 'What kind of Human Resource issues is the business facing due to COVID-19 pandemic? ', multipleText: true, type: 'checkbox', options: [{ name: 'Absenteeism among the employees due to concern over the use of public transportation irrespective of lockdown' }, { name: 'Migration leading to shortage of daily wage workers' }, { name: 'Absenteeism caused by mental and physical stress among employees coming to work leading to reduced working hours or productivity' }, { name: 'Absenteeism among the employees due to lockdown' }, { name: 'Absenteeism due to family members/child care' }, { name: 'None of these' }] },

            { que: 'If the business is highly dependent on Information Technology (IT), has it prepared for / or reviewed existing strategies for possible cyber security threats to the business?', type: 'radio', options: [{ name: 'Yes', score: 1 }, { name: 'No', score: 2 }, { name: 'There is no awareness on such threats', score: 2 }, { name: 'Not applicable', score: 0 }] },
            { que: 'Is the business using technology and /or innovative IT solutions (Digital transaction, virtual office, remote learning, virtual visits/tours, telemedicine, webinar, mobile application) to manage the disruptions or ensure business continuity?', type: 'radio', options: [{ name: 'Yes, most of these', score: 1 }, { name: 'Some of these', score: 2 }, { name: 'No, there has not been any thought about these before', score: 3 }, { name: 'Not applicable for the business', score: 0 }] },
            { que: 'Is there any impact on the business operations due to disruption in basic utility services like electricity, gas, water, telecommunication (mobile, telephone, internet), banking and postal service in your area?', type: 'radio', options: [{ name: 'Business is highly impacted', score: 3 }, { name: 'Business is somewhat impacted', score: 2 }, { name: 'Business had minimal impact', score: 1 }, { name: 'No impact on the business', score: 0 }] },
            { que: 'What kind of supply chain (flow of goods and services linking manufacturer, vendor/supplier, and customer) issues have affected the business? ', multipleText: true, type: 'checkbox', options: [{ name: 'Goods and services have sold out or are unavailable', score: 1 }, { name: 'Vendors/suppliers/raw materials/products have been inaccessible or unavailable', score: 1 }, { name: 'Logistics/transport issues', score: 1 }, { name: 'No current impact on supply chain', score: 0 }] },
            { que: 'Which of these are being promoted in the business for COVID-19 pandemic safety? ', multipleText: true, type: 'checkbox', options: [{ name: 'Workplace sanitisation (e.g. increased cleaning of surfaces, installation of hand sanitising units, etc)', score: 1 }, { name: 'Promoting of good hygiene among staff (wearing mask, washing hands)', score: 1 }, { name: 'Regular temperature checks of employees and customers', score: 1 }, { name: 'Maintaining physical distancing at work place  (e.g. marking the floor to indicate distance between customers and staff, retrofitting of front desks to increase distance between people, etc)', score: 1 }, { name: 'Provision of office transportation facilities to work for employees', score: 1 }, { name: 'Staggering work shifts or introducing work from home policies to minimize employee density in the business/ office', score: 1 }, { name: 'None of these', score: 5 }] },
            { que: 'How do you describe the equipment and machinery status which are indispensable to the business?', type: 'radio', options: [{ name: 'There is no access to the office(s)/manufacturing unit(s)/warehouse(s)/store(s)/other establishment(s)', score: 3 }, { name: 'There is no Annual Maintenance Contract (AMC) and many of the machinery/ equipment need regular maintenance', score: 3 }, { name: 'There is an Annual Maintenance Contract (AMC) in place for most of the machinery/ equipment', score: 2 }, { name: 'The business is not dependent on any such machinery/ equipment which may be rendered unserviceable due to lack of maintenance', score: 1 }, { name: 'The business is not dependent on any such machinery/ equipment', score: 0 }] },
            { que: 'What kind of existing financial liabilities did the business have before COVID-19 pandemic? ', multipleText: true, type: 'checkbox', options: [{ name: 'High operational cost', score: 1 }, { name: 'Pending taxes, cess, interest due to change in government’s financial policies (custom duty, tax, import/export regulations, etc.)', score: 1 }, { name: 'Existing debt/ loans/ or any other financial burden', score: 1 }, { name: 'None of these', score: 0 }] },
            { que: 'How long can the business continue to operate with its present financial position (asset, shares, cash, government support)?', type: 'radio', options: [{ name: 'It cannot continue any further', score: 4 }, { name: 'It can sustain for 1-2 month', score: 3 }, { name: 'It can sustain for 3-6 months', score: 2 }, { name: 'It can sustain for 6 -12 months', score: 1 }] },
            { que: 'Is the business insured?', type: 'radio', options: [{ name: 'The business is insured with disaster insurance cover that includes pandemics', score: 0 }, { name: 'The business is insured with disaster insurance but it does not cover pandemics', score: 1 }, { name: 'Only a part of the business is insured for disasters and pandemics', score: 2 }, { name: 'The business currently does not have or has never purchased any insurance', score: 3 }, { name: 'The business does not have access to any insurance', score: 3 }] },
            { que: 'What does the business insurance cover?', type: 'checkbox', options: [{ name: 'Earthquakes' }, { name: 'Floods' }, { name: 'Fires' }, { name: 'Cyclones/typhoons/tornados' }, { name: 'Pandemics/outbreaks/epidemics/endemics' }, { name: 'Terrorist attacks' }, { name: 'Volcanoes' }, { name: 'Droughts' }, { name: 'Crop damages' }, { name: 'Others' }, { name: 'None of these' }] },
            { que: `How effective has been the government's COVID-19 stimulus package for the business?`, type: 'radio', options: [{ name: 'Very effective', score: 0 }, { name: 'Somewhat effective', score: 1 }, { name: 'Not effective', score: 2 }, { name: 'No such package by the government provided or accessed yet', score: 2 }, { name: 'The business is not eligible for such package(s)', score: 2 }, { name: 'There is no awareness of such packages', score: 2 }] },
            { que: 'What is the impact of any lockdown on the business?', type: 'radio', options: [{ name: 'The business has completely shut down', score: 3 }, { name: 'Business is operating at minimum capacity after an initial shutdown', score: 2 }, { name: 'Business is operating at reduced capacity without any shutdown', score: 1 }, { name: 'Business is operating at full capacity after an initial shutdown', score: 1 }, { name: 'No impact on business operations / There was no lockdown', score: 0 }] },
            { que: `What has been the impact of the government's regulations on the business? `, multipleText: true, type: 'checkbox', options: [{ name: 'Difficult to procure raw materials and other supplies', score: 1 }, { name: 'Difficult to sell products in the market / accessing customers', score: 1 }, { name: 'Delay in approval and quality checking of new products', score: 1 }, { name: 'Increase in cost of using public utilities (e.g. electricity, water, etc)', score: 1 }, { name: 'Shortage/Unavailability/ rise in cost of human resource', score: 1 }, { name: 'None whatsoever', score: 0 }] },
            { que: 'Under the COVID-19 scenario which of these market conditions are true for the business? ', multipleText: true, type: 'checkbox', options: [{ name: 'There is a drop in consumer demand', score: 1 }, { name: 'Reliance on traditional/manual methods for customer outreach instead of digital platforms/ e-commerce', score: 1 }, { name: 'No scope for diversifying products and services to take advantage of the change in market demand', score: 1 }, { name: 'The physical market is now in a high-risk zone and it has become unserviceable', score: 1 }, { name: 'The market has become more competitive', score: 1 }, { name: 'Inability to communicate with clients and suppliers', score: 1 }, { name: 'None of these', score: 0 }] },
            { que: 'Which of these hazards have a high likelihood of impacting the business in near future? ', multipleText: true, type: 'checkbox', options: [{ name: 'Earthquakes', score: 1 }, { name: 'Cyclones/typhoons/storms and wind damages', score: 1 }, { name: 'Floods', score: 1 }, { name: 'Landslide', score: 1 }, { name: 'Industrial fires/forest fires', score: 1 }, { name: 'Droughts', score: 1 }, { name: 'Heat waves/cold waves', score: 1 }, { name: 'Chemical leaks', score: 1 }, { name: 'Conflicts and social unrests', score: 1 }, { name: 'None of these', score: 0 }] },
        ],
    };

    const [allHazardsQuestionArray, setAllHazardsQuestionArray] = useState({
        'En': [
           
            //School Profile
            //0
            {
                que: 'Name of the school for which you are using the RISE Tool?',
                type: 'textinput'
            },
            //1
            {
                que: 'What is the category of the school?',
                type: 'radio',
                
                options: [
                    { name: 'Higher Secondary  (with grades 9 to 12)',score: 1 ,},
                    { name: 'Secondary/Senior Secondary (only with grades 9 & 10)' ,score: 2 },
                    { name: 'Upper Primary (with grades 1 to 8)' ,score: 3},
                    { name: 'Primary (with grades 1 to 5)' ,score: 4 }
                ]
             },
            //2
            { 
                que: 'What is the type of school management?',
                type: 'radio',
                options: [
                    { name: 'Government/Local Body ',score: 1 },
                    { name: 'Government Aided',score: 2  },
                    { name: 'Private Unaided',score: 3 }
                ] 
            },
            //3
            {
                que: 'Which type of the board school offer?',
                type: 'radio',
                options: [
                   
                    { name: ' CBSE',score: 1 },
                    { name: ' ICSE',score: 2  },
                    { name: 'State Board',score: 3 },
                    { name: 'Other',score: 4 },
                    
                ] 
            },
            //4
            { 
                que: 'Where is the school located? ',
                type: 'select' 
            },
            //5
            { 
                que: 'State?',
                type: 'select'
            },
             //6
            { 
                que: 'City?',
                type: 'textinput'
            },
            //7
            { 
                que: ' Area/Locality?',
                type: 'textinput'
            },
            //8
            { 
                que: 'Postal/Zip/Pin code?',
                type: 'textinput'
            },
            //9
            {
                que: 'What is the medium of instruction in the school?',
                type: 'radio',
                options:[
                    { name: 'English',score: 1  },
                    { name: 'Hindi' ,score: 2 },
                    { name: 'Gujarati',score: 3  },
                    { name: 'Other',score: 4  },
                ] 
            },
            //Parental School Selection Indicators 
            //10
            {   
                que: 'Up to what levels does the school have achievements in academic and cocurricular competitions? ', 
                type: 'radio', 
                
                options: [
                    { name: 'School has represented at the international level',score:1,weightage:2},
                    { name: 'School has represented at the national level',score:2,weightage:2}, 
                    { name: 'School has represented at the state level',score:3,weightage:2}, 
                    { name: 'School has not represented in any competitions yet',score:4,weightage:2}, 
                ] 
            },
            //11
            { 
                que: `What is the Pupil-Teacher Ratio (PTR) (number of students per teacher) in the school?`, 
                type: 'radio', 
                options: [
                    { name: 'Below 15:1 ' ,score:1,weightage:3}, 
                    { name: '15:1-30:1',score:2,weightage:3 }, 
                    { name: '30:1-45:1',score:3,weightage:3 },
                    { name: '45:1-60:1' ,score:4,weightage:3 }, 
                    { name: 'Above 60:1',score:5,weightage:3 }
                ], 
            },
            //12
            { 
                que: 'What percentage of teachers in the school have more than five (5) years of experience?', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:1,weightage:3}, 
                    { name: '60%-80%',score:2 ,weightage:3}, 
                    { name: '40%-60%',score:3 ,weightage:3},
                    { name: '20%-40%' ,score:4 ,weightage:3}, 
                    { name: 'Below 20%',score:5 ,weightage:3}
                ], 
            },
            //13
            { 
                que: `What is the percentage of subject-specialised teachers in the school? `,
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:1,weightage:3}, 
                    { name: '60%-80%',score:2,weightage:3 }, 
                    { name: '40%-60%',score:3 ,weightage:3},
                    { name: '20%-40%' ,score:4 ,weightage:3}, 
                    { name: 'Below 20%',score:5 ,weightage:3}
                ], 
            },
            //14
            { 
                que: 'What is the teacher retention rate in the school? (Serving for more than five (5) years in the same school)?', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:1,weightage:3}, 
                    { name: '60%-80%',score:2 ,weightage:3}, 
                    { name: '40%-60%',score:3 ,weightage:3},
                    { name: '20%-40%' ,score:4 ,weightage:3}, 
                    { name: 'Below 20%',score:5 ,weightage:3}
                ], 
            },
            //15
            { 
                que: 'Is the transport facility available in the school?  ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0,weightage:3 }, 
                    { name: 'No',score:1 ,weightage:3}, 
                ] 
            },
            //16
            { 
                que: 'Does the school have subject-specific laboratory facilities?', 
                type: 'radio', 
                
                options: [
                    { name: 'Yes',score:0 ,weightage:2}, 
                    { name: 'No',score:1,weightage:2 }, 
                ] 
            },
            //17
            { 
                que: `Does the school have Smart Classrooms?`, 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0,weightage:1 }, 
                    { name: 'No',score:1 ,weightage:1}, 
                ] 
            },
            //18
            { 
                que: 'Does the school have extracurricular and recreational facilities such as a playground for sports? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0,weightage:1 }, 
                    { name: 'No',score:1,weightage:1 }, 
                ] 
            },
            //19
            { 
                que: 'Does the school have basic amenities such as safe drinking water, sanitation and hygiene (WASH) facilities and cleanliness? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 ,weightage:3}, 
                    { name: 'No',score:1 ,weightage:3}, 
                ] 
            },
            //20
            { 
                que: 'Does the school have a dedicated disciplinary policy?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 ,weightage:2}, 
                    { name: 'No',score:1,weightage:2 }, 
                ] 
            },
            //21
            { 
                que: 'Is there a student cell/counsellor for student-related issues in the school?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 ,weightage:1}, 
                    { name: 'No',score:1,weightage:1 }, 
                ] 
            },
            //22
            { 
                que: 'Is the school campus disability-friendly, i.e. does it have inclusive designs to accommodate the differently-abled persons? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 ,weightage:1}, 
                    { name: 'No',score:1 ,weightage:1}, 
                ] 
            },
            //23
            { 
                que: 'Does the school have a crime-free neighbourhood?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0,weightage:2 }, 
                    { name: 'No',score:1,weightage:2 }, 
                ] 
            },
            //24
            { 
                que: 'What is the average student attendance rate in the school?', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:0,weightage:2 }, 
                    { name: '60%-80%',score:1 ,weightage:2 }, 
                    { name: '40%-60%',score:2,weightage:2 },
                    { name: '20%-40%' ,score:3 ,weightage:2 }, 
                    { name: 'Below 20%',score:4 ,weightage:2 }
                ], 
            },
            //25
            { 
                que: 'How frequently does the school organises Parents Teachers Meeting (PTM)?', 
                type: 'radio', 
                options: [
                    { name: 'PTM conducted monthly ' ,score:0,weightage:1}, 
                    { name: 'PTM conducted quarterly',score:1,weightage:1 }, 
                    { name: 'PTM conducted half-yearly ',score:2,weightage:1 },
                    { name: 'PTM conducted annually' ,score:3,weightage:1 }, 
                    { name: 'PTM not conducted',score:4,weightage:1 }
                ], 
            },
            //26
            { 
                que: 'Does the school have a regular check on parents’ feedback and take action as per recommendations?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0, weightage:2 }, 
                    { name: 'No',score:1, weightage:2 }, 
                ] 
            },
            //27
            { 
                que: 'Does the school maintain regular updates on students\' progress and school programs? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0,weightage:3 }, 
                    { name: 'No',score:1,weightage:3 }, 
                ] 
            },
            //28
            { 
                que: 'What is the average passing percentage of students in the board examinations in the school? ', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:1,weightage:3}, 
                    { name: '60%-80%',score:2,weightage:3 }, 
                    { name: '40%-60%',score:3,weightage:3 },
                    { name: '20%-40%' ,score:4 ,weightage:3}, 
                    { name: 'Below 20%',score:5,weightage:3 }
                ] 
            },
            //29
            { 
                que: 'What percentage of students score above distinction (75% and above) in board examinations in the school?', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%' ,score:1,weightage:2}, 
                    { name: '60%-80%',score:2 ,weightage:2}, 
                    { name: '40%-60%',score:3 ,weightage:2},
                    { name: '20%-40%' ,score:4 ,weightage:2}, 
                    { name: 'Below 20%',score:5 ,weightage:2}
                ] 
            },
            //30
            { 
                que: 'What is the average annual fee of the school (in INR)?', 
                type: 'radio', 
                options: [
                    { name: 'Below 20,000' ,score:0,weightage:2}, 
                    { name: '20,000-40,000',score:1,weightage:2 }, 
                    { name: '40,000-60,000',score:2,weightage:2},
                    { name: '60,000-80,000' ,score:3 ,weightage:2}, 
                    { name: 'Above 80,000',score:4,weightage:2 }
                ] 
            },
            //31
            { 
                que: 'Does the school provide merit-based scholarships to the students?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0, weightage:1}, 
                    { name: 'No',score:1,weightage:1 }, 
                ] 
            },
            //School Disaster Resilience Indicators
            //32
            { 
                que: 'Has the school building been built as per the prevailing guidelines, codes and standards for construction, such as National Building Code (NBC), Indian Standard (IS) Code, municipal bylaws, fire safety regulations, and school safety guidelines?', 
                type: 'radio', 
                options: [
                    { name: 'School building is fully built/retrofitted as per the prevailing guidelines, codes and standards for construction',score:1, weightage:3 }, 
                    { name: 'School building is partially built as per the prevailing guidelines, codes and standards for construction',score:2, weightage:3 }, 
                    { name: 'School building is not built as per the  prevailing guidelines, codes and standards for construction',score:3, weightage:3 }, 
                ] 
            },
            //33
            { 
                que: 'Does the school building undergo regular structural safety checks/audits and maintenance?', 
                type: 'radio', 
                options: [
                    { name: 'Structural safety checks of the school building are conducted every year ',score:0, weightage:3 }, 
                    { name: 'Structural safety checks of the school building conducted once in five years',score:1 , weightage:3}, 
                    { name: 'Structural safety checks of the school building not conducted ',score:2, weightage:3 }, 
                ] 
            },
            //34
            { 
                que: 'Is there a structural safety certificate issued by the competent authority?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0, weightage:1 }, 
                    { name: 'No',score:1, weightage:1 }, 
                ] 
            },
            //35
            { 
                que: 'Have the emergency evacuation routes and exits been designed and marked in the school building? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 , weightage:3}, 
                    { name: 'No',score:1, weightage:3 }, 
                ] 
            },
            //36
            { 
                que: 'Are the exit routes, staircases and corridors in the school free from any obstacles? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 , weightage:3}, 
                    { name: 'No',score:1 , weightage:3}, 
                ] 
            },
            //37
            { 
                que: 'The non-structural elements such as false ceiling, bookshelves, storage cabinets, display cupboards, laboratory equipments, ceiling fans, light fixtures, and other hanging and wall-mounted items in the school are checked, anchored, and secured? ', 
                type: 'radio', 
                options: [
                    { name: 'Fully done',score:1, weightage:3 }, 
                    { name: 'Partially done ',score:2 , weightage:3}, 
                    { name: 'Not done',score:3, weightage:3 }, 
                ] 
            },
            //38
            { 
                que: 'Does the school have received NOC from the Fire and Emergency Services? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0, weightage:3 }, 
                    { name: 'No',score:1, weightage:3 }, 
                ] 
            },
            //39
            { 
                que: 'Does the school have dedicated emergency resources such as emergency siren/fire alarm, fire extinguishers, fire hydrant points, first aid kits, rope, emergency torch, ladder, etc. for early warning and response?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 , weightage:3}, 
                    { name: 'No',score:1, weightage:3 }, 
                ] 
            },
            //40
            { 
                que: 'Does the school have demarcated emergency assembly points on the campus? ', 
                type: 'radio', 
                options: [
                    { name: ' Emergency assembly points are demarcated and communicated to students and staff',score:1, weightage:2 }, 
                    { name: 'Emergency assembly points are demarcated but not communicated to students and staff',score:2 , weightage:2}, 
                    { name: ' Emergency assembly points are not demarcated ',score:3 , weightage:2}, 
                ] 
            },
            //41
            { 
                que: 'Has the school prepared a School Disaster Management Plan (SDMP)? ', 
                type: 'radio', 
                options: [
                    { name: 'SDMP updated in the current academic year  ',score:1, weightage:2 }, 
                    { name: 'SDMP prepared but not updated',score:2 , weightage:2}, 
                    { name: ' SDMP not prepared',score:3 , weightage:2}, 
                ] 
            },
            //42
            { 
                que: 'Does the school have designated a Nodal Officer to carry out disaster management activities? ', 
                type: 'radio', 
                options: [
                    { name: ' Yes',score:0 , weightage:3}, 
                    { name: 'No',score:1, weightage:3 }, 
                    
                ] 
            },
            //43
            { 
                que: 'Does the school carry out mock drills on disaster risk management? ', 
                type: 'radio', 
                options: [
                    { name: 'Mockdrill conducted every year',score:1, weightage:3  }, 
                    { name: 'Mockdrill conducted but not every year',score:2, weightage:3  }, 
                    { name: 'Mockdrill not conducted ',score:3, weightage:3  }, 
                ] 
            },
            //44
            { 
                que: 'What percentage of teachers and staff of the school have received training on disaster risk management?  ', 
                type: 'radio', 
                options: [
                    { name: 'Above 80%',score:1 , weightage:2}, 
                    { name: '60%-80%',score:2, weightage:2 }, 
                    { name: '40%-60%',score:3 , weightage:2}, 
                    { name: '20%-40%',score:4, weightage:2 }, 
                    { name: 'Below 20%',score:5 , weightage:2}, 
                ] 
            },
            //45
            { 
                que: 'Are the teachers and staff regularly trained in disaster risk management? ', 
                type: 'radio', 
                options: [
                    { name: 'Trained every year',score:1, weightage:3 }, 
                    { name: 'Trained once in five year',score:2, weightage:3 }, 
                    { name: ' Not trained',score:3, weightage:3 }, 
                ] 
            },
            //46
            { 
                que: 'Does the school participate and celebrate "School Safety Week" every year?', 
                type: 'radio', 
                options: [
                    { name: ' Yes',score:0 , weightage:3}, 
                    { name: 'No',score:1, weightage:3 },
                ] 
            },
            //47
            { 
                que: 'Does the school management actively interact with local authorities, emergency response agencies, and nearby communities for disaster responses? ', 
                type: 'radio', 
                options: [
                    { name: ' Yes',score:0, weightage:2 }, 
                    { name: 'No',score:1, weightage:2 },
                ] 
            },
            //48
            { 
                que: 'Does the school integrate disaster risk management (DRM) into the school curriculum and teach DRM to students?', 
                type: 'radio', 
                options: [
                    { name: ' Yes',score:0, weightage:3 }, 
                    { name: 'No',score:1, weightage:3 },
                ] 
            },
            //49   
            { 
                que: 'Does the school have emergency funds to carry out disaster risk management activities? ', 
                type: 'radio', 
                options: [
                    { name: ' Yes',score:0, weightage:3 }, 
                    { name: 'No',score:1, weightage:3 },
                ] 
            },
            //50
            { 
                que: 'Which are the most prominent hazards in and around the school?', 
                type: 'checkbox', 
                multipleText: true,
                options: [
                    { name: 'Fire ',score:1 , weightage:3 },
                    { name: 'Earthquake ',score:1 , weightage:3 },
                    { name: 'Floods ',score:1 , weightage:3 },
                    { name: 'Cyclones ',score:1 , weightage:3 },
                    { name: 'Drought ',score:1 , weightage:3 },
                    { name: 'Landslides ',score:1 , weightage:3 },
                    { name: 'Heat Wave ',score:1, weightage:3  },
                    { name: 'Cold Wave ',score:1 , weightage:3 },
                    { name: 'Road Accidents ',score:1, weightage:3  },
                    { name: 'Epidemic ',score:1, weightage:3  },
                    { name: 'Gas Leakage ',score:1 , weightage:3 },
                    { name: 'Other ',score:1 , weightage:3 },
                ] 
            },
            //51
            {
                que: "How frequent are these hazards to which school is prone?",
                type: "radio",
                options: [
                  { name: "Very low (Once in more than 30 years)",score:1 , weightage:3},
                  { name: "Low (Once in 30 years)" ,score:2,weightage:3},
                  { name: "Medium (Once in 10 years) ",score:3,weightage:3 },
                  { name: "High (Once in 5 years) ",score:4,weightage:3},
                  { name: "Very high (Every year)",score:5,weightage:3 },
                ],
              },
            //52
            { 
                que: 'What is the severity of these hazards to which school is prone?', 
                type: 'radio', 
                multipleText: true,
                options: [
                    { name: 'No damage to school infrastructure and education',score:0 , weightage:3 }, 
                    { name: 'Damage to school infrastucture but could not disrupt education',score:1, weightage:3  },
                    { name: 'No damage to infrastructure but disrupt education ',score:1 , weightage:3 }, 
                    { name: 'Damage to both school infrastructure and disruption of education',score:2, weightage:3  },                 
                ] 
            },
            //53
            { 
                que: 'Is the school located within a one (1) km radius of the following? ', 
                type: 'checkbox', 
                multipleText: true,
                options: [
                    { name: 'Near Highway ',score:1, weightage:3  },
                    { name: 'Near Coast',score:1, weightage:3  },
                    { name: 'Near Industry ',score:1, weightage:3  },
                    { name: 'Near Hill Slope',score:1, weightage:3  },
                    { name: 'Near Forest',score:1, weightage:3  },
                    { name: 'Near River',score:1, weightage:3  },
                    { name: 'None of the above',score:0, weightage:3  },
                ] 
            },
            //54
            { 
                que: 'Does the school have transportation safety guidelines, and are parents, students and drivers aware of the same?', 
                type: 'radio', 
                options: [
                    { name: 'Parents, students and drivers are well aware of the transportation safety guideline of the school',score:1 , weightage:2}, 
                    { name: 'The school have documented the transportation safety guidelines but has not discussed them with parents, students and drivers',score:2 , weightage:2},
                    { name: 'The school does not have transportation safety guidelines ',score:3 , weightage:2}, 
                ] 
            },
            //55
            { 
                que: 'Does the school have internet security and ensures safe use of services in the school network? ', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 , weightage:1}, 
                    { name: 'No',score:1, weightage:1},
                ] 
            },
            //56
            { 
                que: 'Does the school have student and staff awareness classes on the safe use of social networking sites to check cyber-crimes?', 
                type: 'radio', 
                options: [
                    { name: 'Yes',score:0 , weightage:1}, 
                    { name: 'No',score:1, weightage:1},
                ] 
            },           
        ],
        
    });

    let aa = [
        `Question number 1  Select business type?aa option1 Agribusiness  option 2 Construction and Real estate option 3 Consultancy  option 4 Education  option 5 Electronics and Telecommunication  option 6 Food and Beverage option 7 Healthcare option 8 Hospitality option 9  Manufacturing  option 10 Media and Entertainment  option 11 Microfinance institutions  option 12 Retail and wholesale  option 13  Software/IT option 14 Transportation and Supply Chain  option 15  Travel and Tourism option 16 NGO/NPO`,
        `Question number 2  Are you one of the owners of the business? option1  Yes  option 2 No`,
        `Question number 3  Is one of the owners of the business a female? option1 Yes  option 2 No`,
        `Question number 4  What is the total number of offices/manufacturing units/stores/ warehouses the business has?`,
        `Question number 5  What is the business’s annual revenue (in local currency)?`,
        `Question number 6  What is the total number of staff/employees/workers the business has?`,
        `Question number 7  Type of business ? option1 Cooperative / Trust / Society  option 2 Corporation  option 3 Limited Liability Company option 4 Not yet registered option 5 Partnership option 6  Sole proprietor options 7 NGO/NPO `,
        `Question number 8  Select Country ?`,
        `Question number 9  Select Province ?`,
        `Question number 10 Postal/Zip/Pin code? `,
        `Question number 11 Does the business have a Business Continuity Plan (BCP)? option1 Yes, It has a plan and it considers health emergencies (pandemic/outbreak)  option 2 Yes, It has a plan but it does not consider health emergencies (pandemic/outbreak) option 3 It does not have a Business Continuity Plan option 4 I am unaware of the term "Business Continuity Plan" option 5 I don’t know if it has a BCP.`,
        `Question number 12 Has the business implemented its Business Continuity Plan(BCP)? option1  Yes (fully) option 2 Yes (partly) option 3 No`,
        `Question number 13 What has been COVID-19's impact on the business? 1 Impact on production and services option1 Increase option2 Decline option3 No change  2 Impact on market access option1 Increase option2 Decline option3 No change  3 Impact on cashflow and sales option1 Increase option2 Decline option3 No change  4 Overall impact on employees (productivity, retention) option1 Positive option2 Negative option3 Mixed option 4 No change`,
        `Question number 14 How long do you think it will take for the business to fully recover from the present situation? option1  Already fully recovered  option 2 Less than 6 months option 3 Between 6 months to 1 year option 4 More than 1 year option 5 Not sure/Cannot predict `,
        `Question number 15 How worried are you that the business operations would be impacted by employee unavailability or absenteeism? option1  Not at all worried as most of my systems are automated or staff are available  option 2 Not so worried as family members and/or friends can or are filling any employee shortages option 3 Worried as the business relies on staff and the business has no other support `,
        `Question number 16 Are the employees permanent/regular or temporary? (Permanent means no fixed end date of employment/have access to superannuation and eligible for company benefits such as pension fund, employer contribution; and temporary means they are paid by a daily wage or short term contract). option1 All of the employees are permanent or come from amongst the family members option 2  Approximately there are equal numbers of permanent and temporary employees option 3 Majority of the employees are permanent or come from amongst the family members (more than 50%) option 4 Majority of the employees are temporary (more than 50%) option 5 All of the employees are temporary `,
        `Question number 17 How would you describe most of the employees in the business? multiple answers can be selected option1  Family members  option 2 Friends and neighbours option 3 Seasonal / Migrant workers / Casual workers / Daily wagers  option 4 Others `,
        `Question number 18 What are the actions the business has  taken /or efforts made to ensure the well-being of the employees? multiple answers can be selected option1 Employees may work remotely/ office space transformed to minimise physical contact  option 2 Management regularly engages with employee and effectively communicates with them on company's position to COVID-19 and its possible implications option 3 Management periodically conducts employee support programs to help them with mental and physical wellbeing option 4 Management encourages employees to acquire new skill sets and knowledge to fill in for other employees who are unable to come to work and/or to increase their personal skills  option 5 Management guaranteeing income/salary of the employees even if the business has to temporarily close or downsize the operation option 6 None of these`,
        `Question number 19 Does the business require close physical contact or distance with people? option1  Close physical distance to customers and clients (shops, restaurants etc)  option 2 Close physical distance to other employees (manufacturing units, shops, etc) option 3 Both option1 and 2 option 4 None of these`,
        `Question number 20 What kind of Human Resource issues is the business facing due to COVID-19 pandemic? multiple answers can be selected option1 Absenteeism among the employees due to concern over the use of public transportation irrespective of lockdown  option 2 Migration leading to shortage of daily wage workers option 3 Absenteeism caused by mental and physical stress among employees coming to work leading to reduced working hours or productivity option 4 Absenteeism among the employees due to lockdown option 5 Absenteeism due to family members/child care option 6 None of these`,
        `Question number 21 If the business is highly dependent on Information Technology (IT), has it prepared for / or reviewed existing strategies for possible cyber security threats to the business? option1  Yes  option 2 No option 3 There is no awareness on such threats option 4 Not Applicable`,
        `Question number 22 Is the business using technology and /or innovative IT solutions (Digital transaction, virtual office, remote learning, virtual visits/tours, telemedicine, webinar, mobile application) to manage the disruptions or ensure business continuity? option1  'Yes, most of these  option 2 Some of these option 3No, there has not been any thought about these before option 4 Not applicable for the business`,
        `Question number 23 Is there any impact on the business operations due to disruption in basic utility services like electricity, gas, water, telecommunication (mobile, telephone, internet), banking and postal service in your area? option1 Business is highly impacted  option 2 Business is somewhat impacted option 3 Business had minimal impact option 4 No impact on the business`,
        `Question number 24 What kind of supply chain (flow of goods and services linking manufacturer, vendor/supplier, and customer) issues have affected the business? multiple answers can be selected option1 Goods and services have sold out or are unavailable  option 2 Vendors/suppliers/raw materials/products have been inaccessible or unavailable option 3 Logistics/transport issues option 4 No current impact on supply chain`,
        `Question number 25 Which of these are being promoted in the business for COVID-19 pandemic safety? multiple answers can be selected option1 Workplace sanitisation (e.g. increased cleaning of surfaces, installation of hand sanitising units, etc)  option 2 Promoting of good hygiene among staff (wearing mask, washing hands) option 3 Regular temperature checks of employees and customers option 4 Maintaining physical distancing at work place  (e.g. marking the floor to indicate distance between customers and staff, retrofitting of front desks to increase distance between people, etc) option 5 Provision of office transportation facilities to work for employees option 6 Staggering work shifts or introducing work from home policies to minimize employee density in the business/ office option 7 None of these`,
        `Question number 26 How do you describe the equipment and machinery status which are indispensable to the business? option1 There is no access to the office/manufacturing unit/warehouse/store/other establishment  option 2 There is no Annual Maintenance Contract (AMC) and many of the machinery/ equipment need regular maintenance option 3 There is an Annual Maintenance Contract (AMC) in place for most of the machinery/ equipment option 4 The business is not dependent on any such machinery/ equipment which may be rendered unserviceable due to lack of maintenance option 5 The business is not dependent on any such machinery/ equipment`,
        `Question number 27 What kind of existing financial liabilities did the business have before COVID-19 pandemic? multiple answers can be selected option1 High operational cost option 2 Pending taxes, cess, interest due to change in government’s financial policies (custom duty, tax, import/export regulations, etc.) option 3 Existing debt/ loans/ or any other financial burden option 4 None of these`,
        `Question number 28 How long can the business continue to operate with its present financial position (asset, shares, cash, government support)? option1 It cannot continue any further  option 2 It can sustain for 1-2 month option 3 It can sustain for 3-6 months option 4 It can sustain for 6 -12 months`,
        `Question number 29 Is the business insured ? option1 The business is insured with disaster insurance cover that includes pandemics  option 2 The business is insured with disaster insurance but it does not cover pandemics  option 3 Only a part of the business is insured for disasters and pandemics option 4 The business currently does not have or has never purchased any insurance option 5 The business does not have access to any insurance`,
        `Question number 30 What does the business insurance cover? multiple answers can be selected option1 Earthquakes  option 2 Floods option 3 Fires option 4 Cyclones/typhoons/tornados option 5 Pandemics/outbreaks/epidemics/endemics option 6 Terrorist attacks option 7 Volcanoes option 8 Droughts option 9 Crop damages option 10 Others option 11 None of these`,
        `Question number 31 How effective has been the government's COVID-19 stimulus package for the business? option1 Very effective  option 2 Somewhat effective option 3 Not effective option 4No such package by the government provided or accessed yet option 5 The business is not eligible for such package(s) option 6 There is no awareness of such packages`,
        `Question number 32 What is the impact of any lockdown on the business? option1 The business has completely shut down option 2 Business is operating at minimum capacity after an initial shutdown  option 3 Business is operating at reduced capacity without any shutdown option 4 Business is operating at full capacity after an initial shutdown option 5 No impact on business operations / There was no lockdown`,
        `Question number 33 What has been the impact of the government's regulations on the business? multiple answers can be selected option1 Difficult to procure raw materials and other supplies  option 2 Difficult to sell products in the market / accessing customers option 3 Delay in approval and quality checking of new products  option 4 Increase in cost of using public utilities (e.g. electricity, water, etc) option 5 Shortage/unavailability/ rise in cost of human resource option 6 None whatsoever`,
        `Question number 34 Under the COVID-19 scenario which of these market conditions are true for the business? multiple answers can be selected option1 There is a drop in consumer demand  option 2 Reliance on traditional/manual methods for customer outreach instead of digital platforms/ e-commerce option 3 No scope for diversifying products and services to take advantage of the change in market demand  option 4 The physical market is now in a high-risk zone and it has become unserviceable option 5 The market has become more competitive option 6 Inability to communicate with clients and suppliers option 7 None of these`,
        `Question number 35 Which of these hazards have a high likelihood of impacting the business in near future? multiple answers can be selected option1 Earthquakes  option 2 Cyclones/typhoons/storms and wind damage option 3 Floods option 4 Landslide  option 5 Industrial fires/forest fires option 6 Droughts option 7 Heat waves/cold waves option 8 Chemical leaks option 9 Conflicts and social unrests option 10 None of these`,
    ];

    let spaa = [
        `número de pregunta 1  ¿Seleccionar tipo de negocio? opción 1 Agribusiness  opción 2  Construcción e Inmobiliaria opción 3 Consultoría  opción 4 Educación  opción 5 Electrónica y Telecomunicación  opción 6 Alimentos y bebidas opción 7  Cuidado de la salud opción 8 Hospitalidad opción 9  Fabricación  opción 10 Medios de comunicación y entretenimiento  opción 11 Instituciones microfinancieras  opción 12 Minorista y mayorista  opción 13  Software / Tecnología de información opción 14 Transporte y cadena de suministro  opción 15  Viaje y Turismo opción 16 ONG / NPO`,
        `número de pregunta 2  ¿Es usted uno de los dueños del negocio? opción1  Sí  opción 2 No`,
        `número de pregunta 3   ¿Alguno de los dueños del negocio es mujer? opción1 Sí  opción 2 No`,
        `número de pregunta 4   ¿Cuál es el número total de oficinas / unidades de fabricación / tiendas / almacenes que tiene la empresa?`,
        `número de pregunta 5  ¿Cuáles son los ingresos anuales de la empresa (en moneda local)?`,
        `número de pregunta 6   ¿Cuál es la cantidad total de personal / empleados / trabajadores que tiene la empresa?`,
        `número de pregunta 7  ¿ Tipo de negocio ? opción1 Cooperativa / Fideicomiso / Sociedad  opción 2 Corporación  opción 3 De responsabilidad limitada opción 4 Empresa aún no registrada opción 5 Alianza empresarial opción 6  Propietario único opcións 7 ONG / NPO `,
        `número de pregunta 8  ¿Seleccionar país ?`,
        `número de pregunta 9  ¿Seleccionar provincia?`,
        `número de pregunta 10  ¿Código postal / postal / PIN?`,
        `número de pregunta 11  ¿Tiene la empresa un Plan de Continuidad Comercial (BCP)? opción1 Sí, tiene plan y toma en cuenta emergencias sanitarias (pandemia / brote)  opción 2 Sí, tiene plan pero no toma en cuenta emergencias de salud (pandemia / brote) opción 3 No cuenta con Plan de Continuidad Comercial" opción 4 No conozco el término "Plan de continuidad comercial" opción 5 No sé si tiene BCP.`,
        `número de pregunta 12 ¿La empresa ha implementado su Plan de Continuidad del Negocio (BCP)? opción1   Sí (completamente) opción 2 Sí (en parte) opción 3 No`,
        `número de pregunta 13  ¿Cuál ha sido el impacto de COVID-19 en el negocio? 1 Impacto en la producción y los servicios opción1 Incremento opción2 Disminución opción3 Ningún cambio  2 Impacto en el acceso al mercado opción1 Incremento opción2 Disminución opción3 Ningún cambio  3 Impacto en el flujo de caja y ventas opción1 Incremento opción2 Disminución opción3 Ningún cambio  4  Impacto general en los empleados (productividad, retención) opción1 Positivo opción2 Negativo opción3 Mezclado opción 4 Ningún cambio`,
        `número de pregunta 14  ¿Cuánto tiempo cree que le llevará a la empresa recuperarse por completo de la situación actual? opción1  Ya completamente recuperado  opción 2  Menos de 6 meses opción 3 Entre 6 meses y 1 año opción 4 Más de 1 año opción 5  No estoy seguro / No puedo predecir`,
        `número de pregunta 15 ¿Qué tanto le preocupa que sus operaciones empresariales o comerciales resulten afectadas debido al absentismo o a la falta de disponibilidad de los empleados? opción1 Sin preocupación, ya que la mayoría de los sistemas están automatizados o los empleados están disponibles.  opción 2 No me preocupa mucho, ya que mis familiares y amigos pueden o ya están llenando los vacíos por la escasez de empleados. opción 3 Me preocupa, ya que la empresa depende de los empleados y no cuenta con ningún otro apoyo. `,
        `número de pregunta 16 ¿Son los empleados permanentes/regulares o temporales? (Permanente significa que no tienen una fecha fija para dejar de trabajar/tienen acceso a sus pensiones y reúnen los requisitos necesarios para obtener beneficios y prestaciones de la empresa, tales como fondos de pensión, contribuciones del empleador, etc., mientras que temporal significa que se les paga una remuneración diaria o tienen un contrato de corto plazo). opción1 Todos los empleados son permanentes o son miembros de la familia opción 2  La mayoría de los empleados son permanentes o son miembros de la familia (más del 50%).  opción 3 Hay aproximadamente una cantidad igual de empleados permanentes y temporales.  opción 4 La mayoría de los empleados son temporales (más del 50%).  opción 5 Todos los empleados son temporales. `,
        `número de pregunta 17 ¿Cómo describiría a la mayoría de los empleados de la empresa? (Se pueden escoger varias respuestas). opción1 Familiares  opción 2 Amigos y vecinos opción 3 Trabajadores migrantes/ estacionales / ocasionales / con un sueldo diario. opción 4 Otros `,
        `número de pregunta 18 ¿Cuáles son las medidas que ha tomado o los esfuerzos que ha realizado la empresa para velar por el bienestar de los empleados? (Se pueden escoger varias respuestas). opción1 Los empleados pueden trabajar de forma remota/ espacio de oficina que se ha transformado de forma tal que se minimiza el contacto físico. opción 2 La gerencia interactúa con regularidad con los empleados y se comunica eficazmente con ellos sobre la posición de la empresa frente al COVID-19 y sus posibles implicaciones. opción 3 Cada cierto tiempo, la gerencia ejecuta programas de apoyo a los empleados para ayudarles con su bienestar físico y mental.  opción 4 La gerencia anima a los empleados a adquirir nuevas destrezas y conocimiento, a fin de sustituir a otros empleados que no puedan presentarse a trabajar o para desarrollar sus habilidades personales.  opción 5 La gerencia garantiza los ingresos/los salarios de los empleados, aun si la empresa tiene que cerrar sus puertas temporalmente o reducir sus operaciones o actividades.  opción 6 Ninguna de las anteriores.`,
        `número de pregunta 19 ¿Requiere la empresa que haya una distancia o un contacto físico cercano con las personas?  opción 1  a. Un contacto físico cercano con los clientes y los usuarios (tiendas, restaurantes, etc.)   opción 2 b. Una distancia física cercana con otros empleados (unidades de producción o fabricación, talleres, etc.)  opción 3 c. Tanto a como b.  opción 4 d. Ninguna de las anteriores.`,
        `número de pregunta 20 ¿Qué tipo de problemas de recursos humanos está enfrentando la empresa debido a la pandemia del COVID-19? (Se pueden escoger varias respuestas).  opción1 Absentismo entre los empleados debido a preocupaciones relacionadas con el uso de transporte público, independientemente del cierre general o la cuarentena  opción 2 Emigración, lo que da origen a la falta de jornaleros.  opción 3 Absentismo ocasionado por la tensión física o emocional entre los empleados que se presentan a trabajar, lo que ocasiona que se reduzcan las horas de trabajo o la productividad.  opción 4 Absentismo entre los empleados debido al cierre general o la cuarentena.  opción 5 Absentismo por tener que cuidar a sus niños o familiares.  opción 6 Ninguna de las anteriores.`,
        `número de pregunta 21 Si esta empresa depende altamente de las tecnologías de información (TI), ¿ha elaborado o analizado estrategias para abordar posibles amenazas a su ciberseguridad?  opción1  Sí  opción 2 No opción 3 No se tiene conocimiento sobre estas amenazas opción 4 No es pertinente.`,
        `número de pregunta 22 ¿Está la empresa utilizando tecnología y soluciones innovadoras de tecnologías de información (TI), tales como transacciones digitales, oficinas virtuales, aprendizaje a distancia, visitas/ giras virtuales, telemedicina, seminarios en línea y aplicaciones móviles, para abordar las interrupciones o velar por la continuidad empresarial?  opción1  Sí, la mayoría de estas.  opción 2 Algunas de estas opción 3 No, no se ha pensado en esta posibilidad.  opción 4 No es pertinente para esta empresa.`,
        `número de pregunta 23 ¿Ha surgido algún impacto en las operaciones o actividades de la empresa debido a una interrupción en los servicios básicos, tales como electricidad, gas, agua, telecomunicaciones (teléfonos celulares, Internet, líneas telefónicas fijas), servicios bancarios y postales en su área?  opción1 La empresa ha resultado sumamente afectada.  opción 2 La empresa ha resultado afectada hasta cierto punto.  opción 3 La empresa ha experimentado un impacto mínimo. opción 4 La empresa no ha experimentado ningún impacto.`,
        `número de pregunta 24 ¿Qué tipo de problemas en la cadena de suministro (movimiento de bienes y servicios, vínculos entre el fabricante, el proveedor/ distribuidor y el cliente) han repercutido en la empresa? (Se pueden escoger varias respuestas). opción 1 Los bienes y servicios están agotados o no están disponibles  opción 2 Los distribuidores/ proveedores/materias primas/ productos no han estado disponibles o accesibles.  opción 3 Hay problemas logísticos/de transporte. opción 4 Actualmente, no se experimenta ningún impacto en la cadena de suministro. `,
        `número de pregunta 25 ¿Cuáles de estas medidas se están promoviendo para la seguridad en la empresa debido a la pandemia del COVID-19? (Se pueden escoger varias respuestas). opción 1 Hay tareas para desinfectar el lugar de trabajo (por ejemplo, se limpian más las superficies, se instalan unidades de desinfectantes de manos, etc.)  opción 2 Se promueve una higiene adecuada entre el personal (el uso de máscaras, lavado frecuente de manos, etc.)  opción 3 Se toma con regularidad la temperatura de los empleados y los clientes. opción 4 Se mantiene una distancia física en el lugar de trabajo (por ejemplo, se colocan marcas en el suelo para indicar cuál debe ser la distancia entre los clientes y el personal, se reacondiciona el área de la recepción para aumentar la distancia entre las personas, etc.)  opción 5 Se pone a disposición servicios de transporte a la oficina para los empleados. opción 6 Hay horarios laborales escalonados o se introducen políticas para trabajar a distancia (desde la casa), a fin de minimizar la cantidad de empleados en la empresa/ la oficina. opción 7 Ninguna de las anteriores.`,
        `número de pregunta 26 ¿De qué forma describe la condición del equipo y la maquinaria que son indispensables para la empresa? opción1 No hay acceso a la/las oficina(s)/ unidad(es) de producción/ bodega(s) /tienda(s)/otra(s) instalaciones(s).   opción 2 No hay un contrato de mantenimiento anual (CMA) y gran parte del equipo/ la maquinaria necesita mantenimiento con regularidad.  opción 3 Hay un contrato de mantenimiento anual (CMA) para la mayor parte del equipo/ la maquinaria.  opción 4 La empresa no depende actualmente de este tipo de equipo/ maquinaria, que podría quedar inservible debido a la falta de mantenimiento.  opción 5 La empresa no depende de ningún tipo de este equipo/ maquinaria.`,
        `número de pregunta 27 ¿Qué tipo de pasivos u obligaciones financieras tenía la empresa antes de la pandemia del COVID-19? (Se pueden escoger varias respuestas). (Se pueden escoger varias respuestas) opción 1 Un alto costo operativo. opción 2 Impuestos pendientes, intereses por cambios en las políticas financieras del gobierno (derechos de aduana, impuestos, regulaciones a las importaciones y exportaciones, etc.) opción 3 Deudas/préstamos existentes o cualquier otra carga financiera.  opción 4 Ninguna de las anteriores.`,
        `número de pregunta 28 ¿Por cuánto tiempo puede funcionar la empresa con su situación financiera actual (activos, acciones, efectivo, ayuda del gobierno)? opción 1 Ya no puede continuar.  opción 2 Puede mantener sus operaciones durante 1-2 meses. opción 3 Puede mantener sus operaciones durante 3-6 meses. opción 4 Puede mantener sus operaciones durante 6 -12 meses.`,
        `número de pregunta 29 ¿Está asegurada la empresa? opción 1 La empresa está asegurada con una cobertura en caso de desastres, la cual incluye pandemias. opción 2 La empresa está asegurada con una cobertura en caso de desastres, pero no incluye pandemias.  opción 3 Solo una parte de la empresa está asegurada en caso de desastres y pandemias.  opción 4 Actualmente, la empresa no tiene o nunca ha adquirido un seguro.  opción 5 La empresa no tiene acceso a ningún seguro. `,
        `número de pregunta 30 ¿Qué cubre el seguro de la empresa? (Se pueden escoger varias respuestas). opción 1 Terremotos.  opción 2 Inundaciones. opción 3 Incendios. opción 4 Ciclones/ tifones/ tornados. opción 5 Pandemias/ brotes/ epidemias/ endemias. opción 6 Ataques terroristas opción 7 Actividades volcánicas. opción 8 Sequías. opción 9 Daños a cultivos. opción 10 Otros. opción 11 Ninguna de las anteriores.`,
        `número de pregunta 31 ¿Qué tan eficaz ha sido el paquete de estímulo del gobierno para las empresas debido al COVID-19?  opción 1 Muy eficaz.  opción 2 Algo eficaz. opción 3 No ha sido eficaz. opción 4 El gobierno no ha ofrecido este tipo de paquete o todavía no se tiene acceso al mismo.  opción 5 La empresa no reúne los requisitos necesarios para obtener este/estos paquete(s).  opción 6 No se tiene conocimiento sobre estos paquetes. `,
        `número de pregunta 32 ¿Cuáles son los efectos de un cierre general o cuarentena en la empresa?  opción 1 La empresa ha tenido que cerrar totalmente.  opción 2 La empresa está funcionando a una capacidad mínima después del cierre inicial.   opción 3  La empresa está funcionando a una capacidad reducida sin ningún cierre opción 4 La empresa está funcionando a capacidad plena después de un cierre inicial.  opción 5 No se ha experimentado ningún impacto en las actividades u operaciones de la empresa / no hubo ningún cierre. `,
        `número de pregunta 33 ¿Cuáles han sido los efectos de las regulaciones del gobierno en la empresa? (Se pueden escoger varias respuestas). opción 1 Dificultades para adquirir materia prima y otros suministros.   opción 2 Dificultades para vender productos en el mercado/ tener acceso a clientes.  opción 3 Retrasos en las aprobaciones y el control de calidad de nuevos productos.  opción 4 Aumento en el costo del uso de servicios públicos (por ejemplo, electricidad, agua, etc.)  opción 5 Escasez/ indisponibilidad/ aumento en el costo de los recursos humanos.  opción 6 Ningún efecto. `,
        `número de pregunta 34 Bajo el escenario del COVID-19, ¿cuáles de estas condiciones de mercado son pertinentes para la empresa? (Se pueden escoger varias respuestas). opción 1 Se observa una menor demanda de los consumidores.   opción 2 Se recurre a métodos manuales/tradicionales para llegar a los clientes, en lugar de plataformas digitales/ comercio electrónico. opción 3 No hay margen para diversificar productos y servicios, y aprovechar los cambios en la demanda del mercado.  opción 4 Ahora, el mercado físico se encuentra en una zona de alto riesgo y no es apto.  opción 5 El mercado ahora es más competitivo.  opción 6 No hay capacidad para comunicarse con los clientes y los proveedores.  opción 7 Ninguna de las anteriores.`,
        `número de pregunta 35 ¿Cuáles de estas amenazas presentan una alta probabilidad de repercutir en la empresa en el futuro inmediato? (Se pueden escoger varias respuestas). opción1 Terremotos.  opción 2 Ciclones/ tifones/ tormentas y daños debido a vientos.  opción 3  Inundaciones. opción 4 Derrumbes.  opción 5 Incendios industriales/ forestales. opción 6 Sequías. opción 7 Olas de calor/ frío  opción 8 Fuga de productos químicos. opción 9 Conflictos y disturbios sociales. opción 10 Ninguna de las anteriores.`,
    ];

    const [agreeed, setAgreeed] = useState(false);
    const [show, setShow] = useState(true);
    const [showQuestionarieModal, setShowQuestionarieModal] = useState(true);
    const [showAnimation, setShowAnimation] = useState(false);
    const [userId, setUserId] = useState('');
    const [position, setPosition] = useState([0, 0]);
    const location = useLocation();
    const [answerArray, SetAnswerArray] = useState(Array());
    const [frequentanswerArray, SetFrequentAnswerArray] = useState(Array());
    const [severityanswerArray, SetSeverityAnswerArray] = useState(Array());
    const [selectedQuestionariesArray, SetSelectedQuestionariesArray] = useState('');
    const [nextPopUP, setNextPopUP] = useState(true);
    const [questionNo, SetQuestionNo] = useState(0);
    const [error, SetError] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);
    const speechref = useRef(null);
    const [currency, setCurrancy] = useState(["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMW"])
    const [selectedCurruncy, setselectedCurruncy] = useState('');
    const [language, setLanguage] = useState('En');

    const topRef = useRef()
    const idleTimer = useRef(null);
    const [PSSI, setpPsi_total] = useState(0);
   
    const [submitflag, setsubmitFlag] =  useState(false);
    const [SDRI, setpSdri_total] = useState(0);
    const [orientation, setOrientation] = useState(0)
    const [orientationMode, setOrientationMode] = useState('portrait')
    const selectQuetionsArray = [{
        name: "Multi Hazards Questionnaire",
    },
  ];

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
        init();

        let lang = localStorage.getItem('language');
        setLanguage(lang);

    }, [])

    const init = () => {
        const speech = new Speech();
        speech
            .init({
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
                text: language == 'sp' ? spaa[questionNo] : aa[questionNo],
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

    useEffect(() => {
        init();
    }, [questionNo]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setPosition([position.coords.latitude, position.coords.longitude])
        })
    }, [position]);

    useEffect(() => {
        if (location.state && location.state.userId) {
            setUserId(location.state.userId);
        }
    }, [location]);

    const submitForm = (e) => {
        e.preventDefault()
        let num = questionNo, flag = false;
        let total_pssi,total_sdri=0
    
        if ((questionNo !== (allHazardsQuestionArray[language].length - 1)) &&
            ((answerArray[num].answer.length > 0) || (answerArray[num].answer !== ''))) {
            flag = true
        }

        if(questionNo > 10 && questionNo < 31){
            let pssi = answerArray[questionNo-1].answer.score * answerArray[questionNo-1].answer.weightage;       
            total_pssi = PSSI + pssi;            
            setpPsi_total(total_pssi);
        }else if(questionNo > 31 && questionNo < 58){
            if(!Array.isArray(answerArray[questionNo-1].answer) && questionNo!==51 && questionNo!==52){
                let sdri = answerArray[questionNo-1].answer.score * answerArray[questionNo-1].answer.weightage;
                total_sdri = SDRI + sdri;              
                setpSdri_total(total_sdri);
            }else{
                if(questionNo===51){                             
                    total_sdri = SDRI + (3 * answerArray[questionNo-1].answer.length);                   
                    setpSdri_total(total_sdri);
                }else if(questionNo===54){               
                    let sum=0;
                    for(let i=0; i<answerArray[questionNo-1].answer.length;i++){
                        if(answerArray[questionNo-1].answer[i]['score']!==0){
                            sum=sum+answerArray[questionNo-1].answer[i]['score']*3;
                        }else{
                            sum=sum+answerArray[questionNo-1].answer[i]['score']*0;
                        }
                    }                   
                    total_sdri = SDRI + sum;                   
                    setpSdri_total(total_sdri);
                }else if(frequentanswerArray.length>0 && questionNo===52){            
                    let filterData=[];
                    for(let i=0; i<frequentanswerArray.length;i++){
                        (frequentanswerArray.filter(function(items){
                            if(items.includes(answerArray[50].answer[i].name)){
                                filterData.push(items.replace(answerArray[50].answer[i].name,''))
                            }
                            return 0;
                        }   
                        ));
                    }   
                    for(let i=0; i<filterData.length;i++){
                        if(filterData[i] === 'Very low (Once in more than 30 years)'){
                            total_sdri = SDRI+3;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Low (Once in 30 years)'){
                            total_sdri = SDRI+6;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Medium (Once in 10 years)'){
                            total_sdri = SDRI+9;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'High (Once in 5 years)'){
                            total_sdri = SDRI+12;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Very high (Every year)'){
                            total_sdri = SDRI+15;
                            setpSdri_total(total_sdri);
                        }
                    } 
                } else if(severityanswerArray.length>0 && questionNo===53){            
                    let filterData=[];
                    for(let i=0; i<severityanswerArray.length;i++){
                        (severityanswerArray.filter(function(items){
                            if(items.includes(answerArray[50].answer[i].name)){
                                filterData.push(items.replace(answerArray[50].answer[i].name,''))
                            }
                            return 0;
                        }   
                        ));
                    } 
                    for(let i=0; i<filterData.length;i++){
                        if(filterData[i] === 'No damage to school infrastructure and education'){
                            total_sdri = SDRI+0;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Damage to school infrastucture but could not disrupt education'){
                            total_sdri = SDRI+3;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'No damage to infrastructure but disrupt education '){
                            total_sdri = SDRI+3;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Damage to both school infrastructure and disruption of education'){
                            total_sdri = SDRI+6;
                            setpSdri_total(total_sdri);
                        }else if(filterData[i] === 'Very high (Every year)'){
                            total_sdri = SDRI+15;
                            setpSdri_total(total_sdri);
                        }
                    } 
                } 
            } 
        } 

        
        // let  address='brahma angan society, Kondhwa, Pune, Maharashtra';


        // Geocode.fromAddress("Eiffel Tower").then(
        //     (response) => {
        //       const { lat, lng } = response.results[0].geometry.location;
        //       console.log(lat, lng);
        //     },
        //     (error) => {
        //       console.error(error);
        //     }
        //   );
       
       
        // geocodeByAddress(address)
        // .then(results => getLatLng(results[0]))
        // .then(latLng => console.log('Success', latLng))
        // .catch(error => console.error('Error', error));

        if (submitflag && ((questionNo) === (allHazardsQuestionArray[language].length - 1))) {
            let Total_PSSI_SDRI = PSSI + SDRI;       
            let risk_category = '';
            let risk_value =Total_PSSI_SDRI/2;
            if (risk_value > 120.50 && risk_value <= 145) {
                risk_category = 'very high'
            }
            else if ((risk_value >= 96) && (risk_value <= 120.5)) {
                risk_category = 'high'
            }
            else if ((risk_value > 71.5) && (risk_value < 96)) {
                risk_category = 'medium'
            }
            else if ((risk_value >= 47) && (risk_value <= 71.5)) {
                risk_category = 'low'
            }
            else {
                risk_category = 'very low'
            }
            let resultData;
            resultData = {
                PSSI,SDRI,risk_value
            }    
          
                let payload = {
                    score: JSON.stringify(resultData),
                    risk_category: risk_category,
                    latitude: position[0],
                    longitude: position[1],
                    questions_array: JSON.stringify(answerArray),
                    user_id: userId,
                    assesment_type: 'multihazard'
                }    

          
          
            saveQuesionsService(payload, (CB) => {
                if (CB.status === 'Success') {
                    if (location.state && location.state.prevData) {                      
                         props.history.replace({
                            pathname: 'dashboard',
                            state: { payload,resultData, position,  pastData: location.state.prevData, pastDataMultiHazard: location.state.prevMultiHazardData, assesment_type: 'multihazard' }
                        })
                    } else if (location.state && location.state.guestUser) {                      
                        props.history.replace({
                            pathname: 'dashboard',
                            state: {payload, resultData, position,  assesment_type: 'multihazard' }
                           // guestUser: true,
                        })
                    } else {                     
                        props.history.replace({
                            pathname: 'dashboard',
                            state: { payload,resultData, position, assesment_type: 'multihazard' }
                        })
                    }
                }
                else {
                    alert("Failed to submit")
                }
            });
        }

    }

  

    const handleChange = (e, item) => {
       // debugger
        const isChecked = e.target.checked;
        let arr = [...answerArray];
        let temp = _.filter(arr[questionNo].answer, function (o) { return (o.name.includes('None of these') || o.name.includes('Ninguna de las anteriores.') || o.name.includes("None whatsoever") || o.name.includes("Ningún efecto.") || o.name.includes("No current impact on supply chain") || o.name.includes("Actualmente, no se experimenta ningún impacto en la cadena de suministro.")) })
        if (isChecked) {
            if (item.name.includes('None of these') || item.name.includes('Ninguna de las anteriores.') || item.name.includes("None whatsoever") || item.name.includes("Ningún efecto.") || item.name.includes("No current impact on supply chain") || item.name.includes("Actualmente, no se experimenta ningún impacto en la cadena de suministro.")) {
                let temp = []
                temp.push(item)
                arr[questionNo].answer = temp
                SetAnswerArray(arr);
            }
            else if (temp.length) {
                let temp = []
                temp.push(item)
                arr[questionNo].answer = temp
                SetAnswerArray(arr);
            }
            else {
                arr[questionNo].answer.push(item)
                SetAnswerArray(arr);
            }

        } else {
            let filteredArr = _.filter(arr[questionNo].answer, function (o) { return o.name !== item.name });

            arr[questionNo].answer = filteredArr
            SetAnswerArray(arr);
        }

        SetError(false)

    }

    const handleClick = (event) => {
        setShowPopover(!showPopover);
        setTarget(event.target);
    };
  
    const handleClose = () => setShow(false);

    const handleRadioChange = (e,item) => {
        let arr = [...answerArray];
        arr[questionNo].answer = item;
        SetAnswerArray(arr);
        SetError(false)
    }
    const radiochange = (e,data,item)=>{       
        let array =[...frequentanswerArray];      
        if((frequentanswerArray.filter(x => x.includes(data))).length > 0){
          let filter = frequentanswerArray.filter(x => x.includes(data));
          let  newarr = frequentanswerArray.filter(items => !filter.includes(items));
          newarr.push(item);
          SetFrequentAnswerArray(newarr);
        }else{
            array.push(item);
            SetFrequentAnswerArray(array);
            SetError(false)
        }
    }
    const severityRadioChange = (e,data,item)=>{       
        let array =[...severityanswerArray];      
        if((severityanswerArray.filter(x => x.includes(data))).length > 0){
          let filter = severityanswerArray.filter(x => x.includes(data));
          let  newarr = severityanswerArray.filter(items => !filter.includes(items));
          newarr.push(item);
          SetSeverityAnswerArray(newarr);
        }else{
            array.push(item);
            SetSeverityAnswerArray(array);
            SetError(false)
        }
    }

    const handleQueSetRadioChange = () => {
        const item={name: "Multi Hazards Questionnaire"}
        SetSelectedQuestionariesArray(item.name);
        let arr = [];
        for (let index = 0; index < allHazardsQuestionArray[language].length; index++) {
            const element = allHazardsQuestionArray[language][index];
            if (element.type === 'checkbox') {
                arr.push({ questionNo: index + 1, question: element.que, answer: [] })
            }
            else if (element.type === 'radio') {
                arr.push({ questionNo: index + 1, question: element.que, answer: '' })
            }
            else if (element.type === 'select') {
                arr.push({ questionNo: index + 1, question: element.que, answer: '' })
            }
            else if (element.type === 'textinput') {
                arr.push({ questionNo: index + 1, question: element.que, answer: '' })
            }            
        }
        SetAnswerArray(arr);
    }

    const handleSelectChange = (e, item) => {
        let arr = [...answerArray];
        arr[questionNo].answer = e.target.value;
        SetAnswerArray(arr);
        SetError(false)
    }

    const nextClick = () => {        
        let hazardArray = [];
        let num = questionNo, flag = false;
        if ((answerArray[num].answer.length > 0) || (answerArray[num].answer !== '')) {
            SetQuestionNo(num + 1);
            SetError(false)               
        }else {
            SetError(true)
        }
    } 

    const handleOnIdle = event => {
        
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

    return (

        <IdleTimer
            ref={idleTimer}
            timeout={1000000 * 60 * 15}
            // onActive={handleOnActive}
            onIdle={handleOnIdle}
            // onAction={handleOnAction}
            debounce={250}
        >
            {/* {alert(language)} */}
            <section className="bg-img">
                <Modal
                    size='lg'
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}>
                    <>
                        {
                            nextPopUP ?
                                <>
                                    <Modal.Header>
                                        <Modal.Title style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                                            {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).genaralStatement : ''
                                            }
                                        </Modal.Title>
                                    </Modal.Header>

                                    <Modal.Body>
                                        <div className="row">
                                           
                                            <span style={{ display: 'flex', paddingLeft: '10px', paddingRight: '10px' }}>
                                            <img
                                                style={{ height: '20px', width: '20px', marginTop: '1vh', marginRight: '10px' }}
                                                alt="gear"
                                                src={require('./../assets/img/images/gear.png')}
                                                className="img-fluid" />
                                            <p style={{ fontFamily: 'Roboto', }}>
                                            This is a test tool.
                                            </p>
                                        </span>
                                            <span style={{ display: 'flex', paddingLeft: '10px', paddingRight: '10px' }}>
                                                <img
                                                    style={{ height: '20px', width: '20px', marginTop: '1vh', marginRight: '10px' }}
                                                    alt="navigation"
                                                    src={require('./../assets/img/images/navigation.png')}
                                                    className="img-fluid" />
                                                <p style={{ fontFamily: 'Roboto', }}>
                                                School is a critical infrastructure. This tool is designed to help you in the school selection process, considering academic performance and disaster safety as two important factors.
                                                    {
                                                        // localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).genaralStatement2 : ''
                                                    }
                                                </p>
                                            </span>
                                            <p style={{ fontFamily: 'Roboto', padding: '10px', marginBottom: '-0.5rem' }}>
                                                <span style={{ marginRight: '10px' }}>
                                                    <img
                                                        style={{ height: 18, width: 18 }}
                                                        alt="hourglass"
                                                        src={require('./../assets/img/images/hourglass.png')}
                                                        className="img-fluid" />
                                                </span>
                                                This survey may take 15-20 minutes to complete.

                                                {
                                                    // localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).genaralStatement3 : ''
                                                }
                                            </p>
                                       
                                        </div >
                                    </Modal.Body>

                                    <Modal.Header >
                                        <Modal.Title style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                                            {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).disclaimer : ''
                                            }
                                        </Modal.Title>
                                    </Modal.Header>

                                    <Modal.Body>
                                        <span style={{ display: 'flex', }}>
                                            <img
                                                style={{ height: '20px', width: '20px', marginTop: '1vh', marginRight: '10px' }}
                                                alt="gear"
                                                src={require('./../assets/img/images/gear.png')}
                                                className="img-fluid" />
                                            <p style={{ fontFamily: 'Roboto', }}>
                                            Please note that the outcome of the tool is an indicative risk arising based on your inputs. The outcome will vary with the accuracy of input by the respondent, change in the local conditions among others.

                                                {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).disclaimer1 : ''
                                                } */}
                                            </p>
                                        </span>
                                        <span style={{ display: 'flex', }}>
                                            <img
                                                style={{ height: '20px', width: '20px', marginTop: '1vh', marginRight: '10px' }}
                                                alt="interchange"
                                                src={require('./../assets/img/images/interchange.png')}
                                                className="img-fluid" />
                                            <p style={{ fontFamily: 'Roboto', }}>
                                            The tool does not collect any personal or confidential data of the respondents. Further, the data collected from the respondents will not be used for any commercial purpose.

                                                {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).disclaimer2 : ''
                                                } */}
                                            </p>
                                        </span>
                                        <span style={{ display: 'flex', }}>
                                            <img
                                                style={{ height: '20px', marginTop: '1vh', marginRight: '10px' }}
                                                alt="stop"
                                                src={require('./../assets/img/images/stop.png')}
                                                className="img-fluid" />
                                            <p style={{ fontFamily: 'Roboto' }}>
                                            CDRI fellows and the other organisations involved in the development of the tool will not be liable for any false, inaccurate, inappropriate or incomplete information provided or stored in the tool or any other damages as a result of using the software.

                                                {/* {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).disclaimer3 : ''
                                                } */}
                                            </p>
                                        </span>
                                       
                                        <div className="col-md-12">
                                            <div style={{ padding: 5, margin: 5, borderRadius: 20, }} >
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" aria-label={'I accept terms and conditions'} aria-required="true" checked={agreeed} id={'agreeed'} onChange={(e) => setAgreeed(e.target.checked)} className="custom-control-input" />
                                                    <label style={{ color: '#002a4a' }} className="custom-control-label" htmlFor={'agreeed'}>
                                                        {
                                                            localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).agreeTerm : ''
                                                        }
                                                    </label>
                                                </div>
                                            </div>
                                            <button style={{ backgroundColor: '#b91c26',color:'#ffffff' }} onClick={() => {setShow(false); setShowAnimation(false);handleQueSetRadioChange();  }} disabled={!agreeed} className='btn ' variant="primary">
                                                {
                                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).iAgree : ''
                                                }
                                            </button>
                                        </div>
                                    </Modal.Body>
                                </>:<></>
                        } 
                    </>
                </Modal>
                <div ref={topRef} className="container-fluid" style={{objectFit:'contain'}}>
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
                                {/* <div className="col-md-5 col-5" />
                                <div className="col-md-4 col-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <img
                                        onClick={() => props.history.replace({
                                            pathname: '/',
                                        })
                                        }
                                        alt="logo-covid-response"
                                        src={(window.orientation == 90 || window.orientation == 270) && window.innerWidth < 850 ? require('./../assets/img/images/logo-covid-response.png') : require('./../assets/img/images/logo-covid-response1.png')} style={{ width: '85%' }} className="img-fluid hederside_logo" />
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row" style={{ backgroundColor: '#dedede', margin: '0px' }}>
                    <div className="col-md-5 col-12 padd-0" style={{ width: '100vw', backgroundColor: '#dedede' }} >
                        <p style={{ color: '#b91c26', padding: '2vh', margin: 0, marginLeft: '1vw', fontFamily: 'Roboto' }}>
                        Risk-Informed School Evaluation Tool (RISE Tool)
                            {/* {
                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).toolName : ''
                            } */}
                        </p>
                    </div>
                    <div className="col-md-5 col-1 padd-0 AudioControl" style={{ backgroundColor: '#dedede', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
                        <div  >
                            <p style={{ color: '#b91c26', padding: '2vh', margin: 0, marginLeft: '1vw', fontFamily: 'Roboto' }}>
                                {
                                    localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).audioAssistance : ''
                                }
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
                        <button
                            className='btn'
                            style={{ backgroundColor: '#b91c26' }}
                            onClick={() => {
                                props.history.replace({
                                    pathname: 'dashboard',
                                    state: { resultData:location.state.prevData, position,  pastData: location.state.prevData, pastDataMultiHazard: location.state.prevMultiHazardData, assesment_type: 'multihazard' }
                                })
                              
                            }}>
                            <img alt="home" style={{ height: 25, width: 25 }} src={require('./../assets/img/home.png')} />
                        </button>
                    </div>
                    <div
                        className="col-md-1"
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
                            {
                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).logout : ''
                            }
                        </button>
                    </div>
                </div>
                <div class="container-fluid " style={{ backgroundColor: '#ffffff', height: '100%' }}>
                  <div className="row pbalignment" >
                        {/* <div className="row" style={{ height: '10vh', width: '100%' }}>
                            {
                                questionNo === 0 && showAnimation ?
                                    <React.Fragment>
                                        <span className='yoga1' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}>
                                            {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).letsStart : ''
                                            }
                                        </span>
                                        <img
                                            src={require('./../assets/img/images/gif/yoga1.gif')}
                                            alt="yoga1"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 6))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga2' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif6.gif')}
                                            alt="gif6"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 10))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga3' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/yoga2.gif')}
                                            alt="yoga2"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                               ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 15))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga4' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif7.gif')}
                                            alt="gif7"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 20))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga5' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/yoga3.gif')}
                                            alt="yoga3"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                 ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 25))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga6' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}>
                                            {
                                                localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).halfWay : ''
                                            }
                                        </span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif8.gif')}
                                            alt="gif8"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                 ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 30))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga7' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/yoga4.gif')}
                                            alt="yoga4"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                 ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 35))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga8' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif9.gif')}
                                            alt="gif9"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 40))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga9' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/yoga5.gif')}
                                            alt="yoga5"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 45))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga10' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif10.gif')}
                                            alt="gif10"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                            {
                                 ((selectedQuestionariesArray === 'Multi Hazards Questionnaire') && (questionNo === 52))
                                    ?
                                    <React.Fragment>
                                        <span className='yoga11' style={{ fontFamily: 'Roboto', fontSize: 12, marginTop: '4vh' }}></span>
                                        <img
                                            src={require('./../assets/img/images/gif/gif11.gif')}
                                            alt="gif11"
                                            style={{ height: '10vh' }}
                                            className="img-fluid" />
                                    </React.Fragment>
                                    :
                                    null
                            }
                        </div> */}
                        <Progress
                            percent={Math.round((questionNo + 1) / (allHazardsQuestionArray[language].length) * 100)} status="success"
                            theme={
                                {
                                    success: {
                                        symbol: Math.round((questionNo + 1) / (allHazardsQuestionArray[language].length) * 100) + '%',
                                        trailColor: 'lime',
                                        color: 'green'
                                    }
                                }
                            }
                        />
                    </div>
                    <div className="row padd-0" style={{  alignItems: 'center', justifyContent: 'center', marginTop: '10vh' }}>
                        <p style={{ color: '#1f6191', margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'Roboto' }}>
                        {
                            (questionNo <= 9 ? "School Profile"
                                        :
                                        (questionNo > 9 ) && (questionNo < 32 )?
                                           "Parental School Selection Indicators"
                                            :
                                            (questionNo >= 31) && (questionNo <= 57  )?
                                                "School Disaster Resilience Indicators ":<></>
                            )                                
                                                                    
                        }
                        </p>
                    </div>
                    <div class="row ">
                        <div class="col-md-6 col-center top-botm-10">
                            <form action="" onSubmit={submitForm} >
                                <div class="fields-container">
                                    <div style={{ display: 'flex', flexDirection: 'row' }} class="col-md-12 top-20 login-heading">
                                       {allHazardsQuestionArray[language][questionNo].que} 
                                       {/* <Overlay
                                            show={showPopover}
                                            target={target}
                                            placement="top"
                                            container={ref.current}
                                            containerPadding={20}>
                                            <Popover id="popover-contained">
                                                <Popover.Content>
                                                    <p style={{ fontFamily: 'Roboto' }}>
                                                         {i18n[language === 'En' ? 'en' : 'sp'].questionnaire.BCPDetails}
                                                       
                                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).BCPDetails : ''}
                                                    </p>
                                                </Popover.Content>
                                            </Popover>
                                        </Overlay> */}
                                    </div>
                                    <div class="col-md-12 login-wht-box">
                                        { 
                                            answerArray.length > 0 ?
                                                <div class="row">
                                                    {                                                           
                                                        questionNo === 4 ?
                                                            <div className="col-md-12">
                                                                <div style={{ padding: '10px 27px' }}>
                                                                    <CountryDropdown
                                                                        classes='custom-select custom-select-sm'
                                                                        value={answerArray[questionNo].answer}
                                                                        onChange={(val) => {
                                                                            let arr = [...answerArray];
                                                                            arr[questionNo].answer = val;
                                                                            SetAnswerArray(arr);
                                                                            SetError(false)
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            :
                                                            questionNo === 5 ?
                                                                <div className="col-md-12">
                                                                    <div style={{ padding: '10px 27px' }}>
                                                                        <RegionDropdown
                                                                            classes='custom-select custom-select-sm'
                                                                            country={answerArray[questionNo - 1].answer}
                                                                            value={answerArray[questionNo].answer}
                                                                            onChange={(val) => {
                                                                                let arr = [...answerArray];
                                                                                arr[questionNo].answer = val;
                                                                                SetAnswerArray(arr);
                                                                                SetError(false)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                :
                                                                
                                                                            allHazardsQuestionArray[language][questionNo].type === 'checkbox' ?
                                                                                ((questionNo == 12) && (answerArray[questionNo].answer.length && ((answerArray[questionNo].answer[0]['name'] == ('Others')) || (answerArray[questionNo].answer[0]['name'] == undefined)))) ?
                                                                                    <div className="col-md-12">
                                                                                        <div style={{ padding: '10px 27px' }}>
                                                                                            <select
                                                                                                style={{ border: '1px solid #b6b6b6' }}
                                                                                                value={answerArray[questionNo].answer}
                                                                                                className='custom-select custom-select-sm'
                                                                                                onChange={handleSelectChange} >
                                                                                                {/* <option value={''}>{'Select'}</option> */}
                                                                                                <option value={''}>
                                                                                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).select : ''}
                                                                                                </option>

                                                                                                {
                                                                                                    [{ name: 'Geological- Avalanches, Tsunami' },
                                                                                                    { name: 'Hydro-meteorological - Sandstorm, Heatwave, Cold spells' },
                                                                                                    { name: 'Technological hazard - Damaged infrastructure, lack of guards and shock proofing, chemical accidents' },
                                                                                                    { name: 'Environmental - Extreme pollution' },].sort(function (a, b) {
                                                                                                        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                                                                                                        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                                                                                                        if (nameA < nameB) {
                                                                                                            return -1;
                                                                                                        }
                                                                                                        if (nameA > nameB) {
                                                                                                            return 1;
                                                                                                        }

                                                                                                        return 0;
                                                                                                    }).map((item, index) => {
                                                                                                        return (
                                                                                                            <option value={item.name}>{item.name}</option>
                                                                                                        )
                                                                                                    })
                                                                                                }
                                                                                            </select>
                                                                                        </div>
                                                                                    </div>
                                                                                    :
                                                                                    allHazardsQuestionArray[language][questionNo].options && allHazardsQuestionArray[language][questionNo].options.length ?
                                                                                        language == 'sp' ?
                                                                                            allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                                var b = _.find(answerArray[questionNo].answer, ['name', item.name]);
                                                                                                return (
                                                                                                    <div key={item.name} className="col-md-12">
                                                                                                        <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: _.isObject(b) ? '#b91c26' : '#fafafa', color: _.isObject(b) ? '#ffffff' : '#000000' }} >
                                                                                                            <div className="custom-control custom-checkbox">
                                                                                                                <input aria-label={item.name} aria-required="true" type="checkbox" name={item.name} checked={(_.isObject(b)) ? true : false} id={item.name} onChange={(e) => handleChange(e, item)} className="custom-control-input" />
                                                                                                                <label className="custom-control-label" htmlFor={item.name}>{item.name}</label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                            :
                                                                                            allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                                var b = _.find(answerArray[questionNo].answer, ['name', item.name]);
                                                                                                return (
                                                                                                    <div key={item.name} className="col-md-12">
                                                                                                        <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: _.isObject(b) ? '#b91c26' : '#fafafa', color: _.isObject(b) ? '#ffffff' : '#000000' }} >
                                                                                                            <div className="custom-control custom-checkbox">
                                                                                                                <input aria-label={item.name} aria-required="true" type="checkbox" name={item.name} checked={(_.isObject(b)) ? true : false} id={item.name} onChange={(e) => handleChange(e, item)} className="custom-control-input" />
                                                                                                                <label className="custom-control-label" htmlFor={item.name}>{item.name}</label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                        :
                                                                                        null
                                                                                :(questionNo === 51 ) && allHazardsQuestionArray[language][questionNo].type === 'radio'? (
                                                                                    <div className="col-md-12">                                                                                   
                                                                                        {   answerArray[50].answer.map((data, index) => {
                                                                                                return (
                                                                                                <div className="col-md-12">
                                                                                                    <p style={{color:'#b91c26',fontWeight:700}}>{index+1}){data.name}</p>
                                                                                                    {allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                                        return (
                                                                                                            <div key={item.name} className="col-md-12">
                                                                                                                <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: (_.includes(frequentanswerArray, data.name+item.name)) ? '#b91c26' : '#fafafa', color: (_.includes(frequentanswerArray, data.name+item.name)) ? '#ffffff' : '#000000' }}>
                                                                                                                    <div className="custom-control custom-radio">
                                                                                                                        <input type="radio" aria-label={data.name+item.name} aria-required="true"  id={data.name+item.name} name={data.name+item.name}  checked={(_.includes(frequentanswerArray, data.name+item.name)) ? true : false}  onChange={(e) => {radiochange(e,data.name, data.name+item.name);handleRadioChange(e, item)}} className="custom-control-input" />
                                                                                                                        <label className="custom-control-label" htmlFor={data.name+item.name}>{item.name}</label>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )
                                                                                                    })}
                                                                                                </div>
                                                                                                )
                                                                                            })
                                                                                        }                                                                                      
                                                                                    </div>
                                                                                  ):(questionNo === 52 ) && allHazardsQuestionArray[language][questionNo].type === 'radio'? (
                                                                                    <div className="col-md-12">                                                                                     
                                                                                        {   answerArray[50].answer.map((data, index) => {
                                                                                                return (
                                                                                                <div className="col-md-12">
                                                                                                    <p style={{color:'#b91c26',fontWeight:700}}>{index+1}){data.name}</p>
                                                                                                    {allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                                        return (
                                                                                                            <div key={item.name} className="col-md-12">
                                                                                                                <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: (_.includes(severityanswerArray,data.name+item.name)) ? '#b91c26' : '#fafafa', color: (_.includes(severityanswerArray,data.name+item.name)) ? '#ffffff' : '#000000' }}>
                                                                                                                    <div className="custom-control custom-radio">
                                                                                                                        <input type="radio" aria-label={data.name+item.name} aria-required="true" name={data.name+item.name}id={data.name+item.name} checked={(_.includes(severityanswerArray, data.name+item.name)) ? true : false}  onChange={(e) => {severityRadioChange(e,data.name, data.name+item.name);handleRadioChange(e, item)}} className="custom-control-input" />
                                                                                                                        <label className="custom-control-label" htmlFor={data.name+item.name}>{item.name}</label>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ) 
                                                                                                    })}
                                                                                                </div>
                                                                                                )
                                                                                            })
                                                                                        }                                                                                      
                                                                                    </div>
                                                                                  ):
                                                                                allHazardsQuestionArray[language][questionNo].type === 'radio' ?
                                                                                    allHazardsQuestionArray[language][questionNo].options && allHazardsQuestionArray[language][questionNo].options.length ?
                                                                                        language == 'sp' ? allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                            return (
                                                                                                <div key={item.name} className="col-md-12">
                                                                                                    <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: (_.includes(answerArray[questionNo].answer, item.name)) ? '#b91c26' : '#fafafa', color: (_.includes(answerArray[questionNo].answer, item.name)) ? '#ffffff' : '#000000' }}>
                                                                                                        <div className="custom-control custom-radio">
                                                                                                            <input type="radio" aria-label={item.name} aria-required="true" name={item.name} checked={(_.includes(answerArray[questionNo].answer, item.name)) ? true : false} id={item.name} onChange={(e) => handleRadioChange(e, item)} className="custom-control-input" />
                                                                                                            <label className="custom-control-label" htmlFor={item.name}>{item.name}</label>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        })
                                                                                            : allHazardsQuestionArray[language][questionNo].options.map((item, index) => {
                                                                                                return (
                                                                                                    <div key={item.name} className="col-md-12">
                                                                                                        <div key={item.name} style={{ padding: 5, margin: 5, borderRadius: 20, backgroundColor: (_.includes(answerArray[questionNo].answer, item.name)) ? '#b91c26' : '#fafafa', color: (_.includes(answerArray[questionNo].answer, item.name)) ? '#ffffff' : '#000000' }}>
                                                                                                            <div className="custom-control custom-radio">
                                                                                                                <input type="radio" aria-label={item.name} aria-required="true" name={item.name} checked={(_.includes(answerArray[questionNo].answer, item.name)) ? true : false} id={item.name} onChange={(e) => handleRadioChange(e, item)} className="custom-control-input" />
                                                                                                                <label className="custom-control-label" htmlFor={item.name}>{item.name}</label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )
                                                                                            })
                                                                                        : null
                                                                                    :
                                                                                    allHazardsQuestionArray[language][questionNo].type === 'select' ?
                                                                                        <div className="col-md-12">
                                                                                            <div style={{ padding: '10px 27px' }}>
                                                                                                <select
                                                                                                    style={{ border: '1px solid #b6b6b6' }}
                                                                                                    value={answerArray[questionNo].answer}
                                                                                                    className='custom-select custom-select-sm'
                                                                                                    onChange={handleSelectChange} >
                                                                                                    {/* <option value={''}>{'Select'}</option> */}
                                                                                                    <option value={''}>
                                                                                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).select : ''}
                                                                                                    </option>
                                                                                                    {
                                                                                                        allHazardsQuestionArray[language][questionNo].options && allHazardsQuestionArray[language][questionNo].options.length ?
                                                                                                            language == 'sp' ? allHazardsQuestionArray[language][questionNo].options.sort(function (a, b) {
                                                                                                                var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                                                                                                                var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                                                                                                                if (nameA < nameB) {
                                                                                                                    return -1;
                                                                                                                }
                                                                                                                if (nameA > nameB) {
                                                                                                                    return 1;
                                                                                                                }
                                                                                                                return 0;
                                                                                                            }).map((item, index) => {
                                                                                                                return (
                                                                                                                    <option value={item.name}>{item.name}</option>
                                                                                                                )
                                                                                                            })
                                                                                                                : allHazardsQuestionArray[language][questionNo].options.sort(function (a, b) {
                                                                                                                    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                                                                                                                    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                                                                                                                    if (nameA < nameB) {
                                                                                                                        return -1;
                                                                                                                    }
                                                                                                                    if (nameA > nameB) {
                                                                                                                        return 1;
                                                                                                                    }

                                                                                                                    return 0;
                                                                                                                }).map((item, index) => {
                                                                                                                    return (
                                                                                                                        <option value={item.name}>{item.name}</option>
                                                                                                                    )
                                                                                                                })
                                                                                                            :
                                                                                                            null
                                                                                                    }
                                                                                                </select>
                                                                                            </div>

                                                                                        </div>
                                                                                        :
                                                                                        <div className="col-md-12">
                                                                                            <div className="row" style={{ padding: '10px' }}>
                                                                                                {
                                                                                                    questionNo === 4 ?
                                                                                                        <div className="col-md-3 col-4">
                                                                                                            <div style={{ padding: '12px' }}>
                                                                                                                <select
                                                                                                                    style={{ border: '1px solid #b6b6b6' }}
                                                                                                                    className='custom-select custom-select-sm'
                                                                                                                    value={selectedCurruncy} onChange={(e) => {
                                                                                                                        setselectedCurruncy(e.target.value);
                                                                                                                    }} >
                                                                                                                    <option value={''}>
                                                                                                                        {/* {i18n[language == 'en' ? 'en' : 'sp'].questionnaire.select} */}
                                                                                                                        {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).select : ''}
                                                                                                                    </option>
                                                                                                                    {
                                                                                                                        currency.sort().map((item, index) => {
                                                                                                                            return (
                                                                                                                                <option value={item}>{item}</option>
                                                                                                                            )
                                                                                                                        })
                                                                                                                    }
                                                                                                                </select>
                                                                                                            </div>

                                                                                                        </div>
                                                                                                        :
                                                                                                        null
                                                                                                }
                                                                                                <div className={questionNo === 4 ? "col-md-9 col-8" : "col-md-12 col-12"}>
                                                                                                    <div style={{ padding: '10px' }} className="input-group mb-3">
                                                                                                        {
                                                                                                            questionNo !== ((allHazardsQuestionArray[language].length - 1))?
                                                                                                            <input  aria-label={allHazardsQuestionArray[language][questionNo].que} aria-required="true" type="text" className="form-control" 
                                                                                                            onChange={(e) => {                                                                                                                   
                                                                                                                let arr = [...answerArray];                                                                                                                    
                                                                                                                    arr[questionNo].answer = e.target.value;
                                                                                                                    SetError(false)
                                                                                                                    SetAnswerArray(arr);                                                                                                                  
                                                                                                                }}
                                                                                                            value={answerArray[questionNo].answer}
                                                                                                            style={{ height: 40 }} />:<></>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                    }
                                                   
                                                </div>

                                                :  
                                              <></>
                                                                                     }
                                    </div>
                                    <div style={{ height: '5vh', }}></div>
                                    <div className='bottombutton' >
                                        {
                                            questionNo === ((allHazardsQuestionArray[language].length - 1)) ?
                                                <button className='btn ' style={{ backgroundColor: '#b91c26',color:'#ffffff' }}  onClick={() => setsubmitFlag(true)} type="submit">
                                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).submit : ''}
                                                </button>
                                                :
                                                <button className='btn ' style={{ backgroundColor: '#b91c26' ,color:'#ffffff'}} disabled={questionNo === ((selectedQuestionariesArray === "Covid-19 Questionnaire") ? (allQuestionArray[language].length - 1) : (allHazardsQuestionArray[language].length - 1))} onClick={nextClick} >
                                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).next : ''}
                                                </button>
                                        }
                                        <button className='btn ' style={{ backgroundColor: '#b91c26',color:'#ffffff' }} disabled={questionNo === 0} onClick={() => {
                                           // debugger
                                            let num = questionNo;
                                            SetQuestionNo(num - 1);
                                            SetError(false)
                                        }} >{localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).prev : ''}</button>
                                    </div>
                                    <div className='mobileButton' >
                                        {
                                            questionNo === (allHazardsQuestionArray[language].length - 1) ?
                                                <button className='btn ' style={{ backgroundColor: '#b91c26' ,color:'#ffffff' }} onClick={() => setsubmitFlag(true)} type="submit">
                                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).submit : ''}
                                                </button>
                                                :
                                                <button className='btn ' style={{ backgroundColor: '#b91c26' ,color:'#ffffff' }} disabled={questionNo ===  (allHazardsQuestionArray[language].length - 1)} onClick={nextClick} >
                                                    {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).next : ''}
                                                </button>
                                        }
                                        <button className='btn ' style={{ backgroundColor: '#b91c26' ,color:'#ffffff' }} disabled={questionNo === 0} onClick={() => {
                                            let num = questionNo;
                                            SetQuestionNo(num - 1);
                                            SetError(false)
                                        }}>
                                            {localStorage.getItem(`LangDataFor${language}`) ? JSON.parse(localStorage.getItem(`LangDataFor${language}`)).prev : ''}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </IdleTimer>

    );
}

export default geolocated({
    positionOptions: {
        enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
})(Questionnaire);
