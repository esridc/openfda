[![Build Status](https://travis-ci.org/esridc/openfda.svg?branch=master)](https://travis-ci.org/esridc/openfda)

http://esridc.github.io/openfda

## Objective

Provide food-related decisions makers actionable insights based [open FDA](https://open.fda.gov) enforcement reports.

## Collaboration

- [Development Backlog on Huboard](https://huboard.com/esridc/openfda/)
- [Wiki Documentation](https://github.com/esridc/openfda/wiki)
- [Continuous Integration Testing](https://travis-ci.org/esridc/openfda)

### Backlog

We are using Huboard for our backlog

## Team

- product owner - Gerry
- scrum master - Mike/Andrew
- development engineers - Brendan, Andrew, Daniel
- UI design - Mike
- UX & Usability design - Jennie
- domain experts - Este
- user testers - Liza, Jody

## Front-End application

* Install: `npm install` and `bower install`
* Run locally: `gulp serve`
* Watch files + automatically run tests: `gulp watch`
* Build: `gulp build`
* Deploy to gh-pages: `gulp deploy`

### Testing

* `gulp test`

## Back-End application

Plugin to [Koop](https://github.com/esri/koop) written in Javascript for Node.js supports filtered downloads in `kml, csv, shapefile, and geojson`. Also supports Esri Featureservice requests

* Code style: [Standard Format] (https://github.com/feross/standard)
* Testing: `standard && mocha test/*.js`
* Continuous integration testing: [Travis CI](https://travis-ci.org/koopjs/koop-fda)
* Complexity monitoring: [Code Climate](https://codeclimate.com/github/koopjs/koop-fda)
* Package management: [NPM](https://travis-ci.org/koopjs/koop-fda) 
* Container image builds: [Docker](https://registry.hub.docker.com/u/esridc/openfda-koop/)

### Installation

[See docs](koop-docker/README.md)

### Deployment

* 2x `t2.medium` instances on Amazon Web Services
* 1 Service running 2 deployments of a task on [Amazon Container Services](http://aws.amazon.com/ecs/)
* Elastic load balancer to manage web traffic: http://koop-fda-1504637322.us-east-1.elb.amazonaws.com/
* Cloudwatch monitors healthy instance counts
* Launch configuration manages instance settings
* Autoscaling group manages instance launches in response to Cloudwatch alarms

## Approach used to create prototype

Esri adopted an agile approach to developing the FDA Data Prototype. 

![uploads/d748e8ab-0796-4d89-8c5a-03dc399481a2/EsriPrototypeApproach.JPG](https://s3-us-west-2.amazonaws.com/prod.huboard.com/uploads%2Fd748e8ab-0796-4d89-8c5a-03dc399481a2%2FEsriPrototypeApproach.JPG)

Our Prototype team was assembled and met for the first time on Tuesday, June 23.  The team was assembled by the Delivery Manager and included individuals from across Esri - at least 6 different labor categories were involved in the development of the prototype.  The Delivery Manager has the authority and responsibility for delivering a quality prototype.

Our first steps were to embark on the Define, Prioritize and Plan approach that allowed us to clearly define who the users would be for the prototype, what their business needs were, and stand up the initial architecture that would support the prototype.

Defining the users of the prototype and what their needs are is a critical first step.  The Team reviewed the data that was made available through the API at https://open.fda.gov and had a brain storming session that sought to:

1. Better understand the available data 
2. Sketch initial personas 

We then performed **Expert Interviews** to provide insight into the FDA data and various user needs – this included the Director of Health and Human Services at Esri as well as friends and family that have medical backgrounds.  

Based on their feedback the Team crafted three **User Personas** to represent the needs of the FDA Data prototype – we ultimately settled on personas for Mary and Dr. Bob for whom we defined user stories and also set up the fundamental technology stack that was needed to support these tasks.  Our focus was to bring the data alive with a map component - illustrate how they could navigate through the data in a more spatial way.  We wanted Mary and Dr Bob to be able to answer the following questions:

1.  How many types of recall happened in your state in the past 6 months - we added pull-down menus to allow Mary and Dr Bob to pick a subset of the data by a date range.
2.  What was the potential impact of that recall - we sought to illustrate this by supplementing the FDA API data with population data on each state.  If there had been additional time/resources we would have liked to add more meaningful analytical charts (showing population by age or specific impact group - elderly or youth).

The Technical Architect set up **Remote Collaboration Tools** including a GitHub repository including a wiki for documentation, HuBoard for backlog management and tracking, Balsamiq for interface wireframes, and TravisCI for continuous integration testing. The development team used Yeoman to generate a web application using Bootstrap CSS framework, Leaflet for visualization, Gulp for build tools, and Mocha for unit tests. More than 5 modern and open-source technologies were utilized to develop the prototype.  We utilized the bootstrap default design guide to support the design of the prototype.

The Product Manager set up **Daily Standups** for 1pm ET every day – with a team that was spread across different time zones. During these calls we reviewed status, what everybody was working on, what they needed and what was blocking their progress.  
At the second daily call we recognized that we needed to support a back-end implementation in order to meet some of the evaluation requirements (deploying on an IaaS and within a container) – so we expanded the Dr. Bob use cases to include more analytical business needs and decided to extend and deploy the [Koop](https://github.com/esri/koop) open-source project. The Koop project was deployed on the Amazon Web Services architecture and was set up to run in a DOCKER container.  We chose to implement the prototype as a HTML 5 application so that it could run on multiple devices in a responsive design without building separate apps for unique devices.  We tested on Android, iOS and Windows and were able to verify that the design responded accordingly.

Between each set of wireframes we performed **Usability Testing** with colleagues adopting the Mary and Dr. Bob personas. They outlined a number of issues – color schemes, working, and confusion over workflow – that were provided to the UI/UX team for **Iteration and Development**.  

We worked to prioritize the issues that came back from user feedback - for example, during our expert interview it was noted that incorporating additional data to show the magnitude of a recall would be extremely useful to our end users.  We identified this in issue #41 and prioritized it over some other development issues.  

We broadcasted the URL to a wide range of staff within the Esri organization and asked staff to test on a variety of devices. We identified a number of issues on the Android and iOS devices (issues #63 and #64) and were able to correct and redeploy for testing.

As code was developed, continuous unit testing was conducted by the team.  Configuration management and continuous monitoring was supported via AWS components to manage the overall backend configuration (AWS Launch Configurations
AWS Auto Scaling Group and AWS Launch Configurations).  In addition, we set up a Cloudwatch monitor for the main prototype URL. All of the documentation to install and run this prototype can be found in (INSERT LINK). 

A final deployment meeting was held on Thursday July 2 to review the status of the prototype.  One issue was identified in testing (issue #80) that needs to be addressed.  The Team worked to address and deploy over the long weekend.  A final test will be conducted on Monday July 6 and the team will confirm that prototype is ready for deployment to the GSA.  No further work is expected to take place on the prototype - we chose to wait until July 7 to submit the prototype and supporting documentation - in case any additional amendments were issued and changed any of the submission requirements.

All of the tools used to build this prototype come from Esri's stack of open source technology. Open Source License is the Apache license.  Data services, such as base maps, locators and demographics are from Esri and are free for public use.  Additional information can be found at http://esri.github.io/ 

## License 

Copyright 2015 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's LICENSE.txt file. 
