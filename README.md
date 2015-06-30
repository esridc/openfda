[![Build Status](https://travis-ci.org/esridc/openfda.svg?branch=master)](https://travis-ci.org/esridc/openfda)

http://esridc.github.io/openfda

## Objective

Provide food-related decisions makers actionable insights based [open FDA](https://open.fda.gov) enforcement reports.

## Collaboration

- [Development Backlog on Huboard](https://huboard.com/esridc/openfda/)
- [Wiki Documentation](https://github.com/esridc/openfda/wiki)
- [Continuous Integration Testing](https://travis-ci.org/esridc/openfda)

### Backlog

We are using Huboard for our backlog - 

## Team

- product owner - Gerry
- scrum master - Mike
- development engineers - Brendan, Andrew, Daniel
- UI design - Mike
- UX & Usability design - Jennie
- scrum coach - Marten
- domain experts - Este
- user testers - Liza, Jody

## Development

### Front-End application

* Install: `npm install` and `bower install`
* Run locally: `gulp serve`
* Watch files + automatically run tests: `gulp watch`
* Build: `gulp build`
* Deploy to gh-pages: `gulp deploy`

### Testing

* `gulp test`


## Methodology

Esri adopted an agile approach to developing the FDA Data Prototype. 

![uploads/d748e8ab-0796-4d89-8c5a-03dc399481a2/EsriPrototypeApproach.JPG](https://s3-us-west-2.amazonaws.com/prod.huboard.com/uploads%2Fd748e8ab-0796-4d89-8c5a-03dc399481a2%2FEsriPrototypeApproach.JPG)

Our Prototype team was assembled and met for the first time on Tuesday, June 23.  

Our immediate first steps was to embark on the Define, Prioritize and Plan approach that allowed us to clearly define who the users would be for the prototype, what their business needs were, and stand up the initial architecture that would support the prototype.

Defining the users of the prototype and what their needs are is a critical first step.  We reviewed the data that was made available through the API at https://open.fda.gov and had a brain storming session that sought to 

1. Better understand the available data 
2. Sketch initial personas.  

We then performed **Expert Interviews** to provide insight into the FDA data and various user needs – this included the Director of Health and Human Services at Esri as well as friends and family that have medical backgrounds.  

Based on their feedback we crafted three **User Personas** to represent the needs of the FDA Data prototype – we ultimately settled on personas for Mary and Dr. Bob for who we defined user stories and also set up the fundamental technology stack that was needed to support these tasks.

The Technical Architect set up **Remote Collaboration Tools** including a GitHub repository including a wiki for documentation, HuBoard for backlog management and tracking, Balsamiq for interface wireframes, and TravisCI for continuous integration testing. The development team used Yeoman to generate a web application using Bootstrap CSS framework, Leaflet for visualization, Gulp for build tools, and Mocha for unit tests. 

The Product manager set up **Daily Standups** for 1pm ET every day – with a team that was spread across different time zones. During these calls we reviewed status, what everybody was working on, what they needed and what was blocking their progress.  

At the second daily call we recognized that we needed to support a back-end implementation in order to meet some of the evaluation requirements – so we expanded the Dr. Bob use cases to include more analytical business needs and decided to extend and deploy the [Koop](https://github.com/esri/koop) open-source project.

Between Each set of wireframes we performed **Usability Testing** with colleagues adopting the Mary and Dr. Bob personas. They outlined a number of issues – color schemes, working, and confusion over workflow – that were provided to the UI/UX team for **Iteration and Development**.  


## License 

Copyright 2015 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's LICENSE.txt file. 
