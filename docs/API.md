## API explorations

- [Count of Enforcement by Provider state](https://api.fda.gov/food/enforcement.json?&count=state)
- [Count of Enforcement by Recall Pattern](https://api.fda.gov/food/enforcement.json?&count=distribution_pattern) 
 - tokenizes long strings such as "Massachusetts, Connecticut, Maine, New Hampshire and Vermont" 
- [Recalls mentioning “lettuce”](https://api.fda.gov/food/enforcement.json?search=reason_for_recall:%22lettuce%22)

![localhost_9000_chart_html](https://cloud.githubusercontent.com/assets/1218/8328961/802ff1a6-1a43-11e5-999e-0a6aa9e466ed.png)


## Example

"Recalls in California"

```json
{
   meta: {
      disclaimer: "openFDA is a beta research project and not for clinical use. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated.",
      license: "http://open.fda.gov/license",
      last_updated: "2015-05-31",
      results: {
         skip: 0,
         limit: 1,
         total: 2271
      }
   },
   results: [
      {
         recall_number: "F-0291-2014",
         reason_for_recall: "The recalled products are potentially contaminated with Listeria monocytogenes.",
         status: "Ongoing",
         distribution_pattern: "Distribution was made to AL, AR, AZ, CA, CO, CT, DE, FL, GA, HI, IA, IL, IN, KS, KY, LA, MA, MD, ME, MI, MO, MS, NC, NE, NH, NJ, NM, NV, NY, OH, OK, OR, PA, SC, SD, TN, TX, VA, WI, WV AND WY.   Distribution was also made to Canada.",
         product_quantity: "1,320,899 cases total for all products",
         recall_initiation_date: "20131022",
         state: "OR",
         event_id: "66563",
         product_type: "Food",
         product_description: "Dillons Red Potato Salad, Formula PO.87, packaged in 12/16-oz carton cases. Distributed by Dillons Stores, Hutchinson, KS.",
         country: "US",
         city: "Beaverton",
         recalling_firm: "Reser's Fine Foods, Inc.",
         report_date: "20140101",
         "@epoch": 1424553174.836488,
         voluntary_mandated: "Voluntary: Firm Initiated",
         classification: "Class I",
         code_info: "Use by dates 10/10/13-11/25/13.",
         "@id": "001f1a01cf97443383676c96f8945070f3e5c2bdef087e9c82648a907a61448f",
         "openfda": {},
         initial_firm_notification: "Two or more of the following: Email, Fax, Letter, Press Release, Telephone, Visit"
      }
   ]
}
```

## Linked Data

* [Access FDA by Recall ID](http://www.accessdata.fda.gov/scripts/enforcement/enforce_rpt-Product-Tabs.cfm?action=select&recall_number=F-0291-2014&w=01012014&lang=eng)