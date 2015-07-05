
[![npm version][npm-img]][npm-url][![Build Status](https://travis-ci.org/koopjs/koop-fda.svg?branch=master)](https://travis-ci.org/koopjs/koop-fda)[![Code Climate](https://codeclimate.com/github/koopjs/koop-fda/badges/gpa.svg)](https://codeclimate.com/github/koopjs/koop-fda)[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

# koop-fda

> A FDA Food Recall Enforcement provider for Koop 

## How it works
1. All the data is requested from the [Open FDA](https://open.fda.gov/) food recalls enforcement API in pages
2. States affected are parsed out of the distribution_pattern.
3. Geometries are added to match the states from step 2 and merged into a single shape covering the area of the recall
4. All results are converted into GeoJSON
5. GeoJSON is loaded into Postgres
6. [Koop](http://github.com/esri/koop) handles conversions to Esri Feature Services, KML, Shapefile, GeoJSON and CSV


## Usage

- To download the full dataset simply append your requested file type to the end of this URL: http://koop.dc.esri.com/FDA
  - Options are: `[csv, zip, kml, geojson]`
- If you wish to filter the data, append `?where=` followed by a [URI Encoded](http://www.w3schools.com/tags/ref_urlencode.asp) SQL string 
  - [See this](http://meyerweb.com/eric/tools/dencoder/) for an easy in browser encoder
  - The full list of available parameters is here: https://open.fda.gov/food/enforcement/

- Example: accessing a feature service
```
http://koop.dc.esri.com/FDA/FeatureServer/0
```
Note: the first time you run this it may kick off a very long process

- Example requesting GeoJSON of all the zucchini recalls ever: `where=product_description like '%zucchini%'`
```
http://koop.dc.esri.com/FDA.geojson?where=product_description%20like%20%27%25zucchini%25%27
```

- Example requesting a CSV of listeria cases in 2015: `where=reason_for_recall like '%listeria%' AND recall_initiation_date >= 20150101`
```
http://koop.dc.esri.com/FDA.csv?where=reason_for_recall%20like%20%27%25listeria%25%27%20AND%20recall_initiation_date%20%3E%3D%2020150101
```

- Example requesting a shapefile of all recalls of products originating in Texas: `state = TX`
  - Note: Make sure to capitalize the state or you will get no results
```
http://koop.dc.esri.com/FDA.zip?where=state%20%3D%20TX
```

- Example requesting kml of all ongoing class III recalls: `where=status = Ongoing AND classification = 'Class III'`
```
http://koop.dc.esri.com/FDA.kml?where=status%20%3D%20Ongoing%20AND%20classification%20%3D%20%27Class%20III%27
```

## Installation
1. In your [Koop app](https://github.com/koopjs/koop-sample-app) register the koop-fda provider
2. [Get an API key from the FDA](https://open.fda.gov/api/reference/#your-api-key)
3. Add this to your koop config/default.json
```json
{
  "fda":
    {
      "key": "your key"
    }
}
```

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## License

Copyright 2015 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](license.txt) file.

[npm-img]: https://img.shields.io/npm/v/koop-fda.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koop-fda
