describe('Recalls... ', function(){
    var recalls; 

    beforeEach(function () {
      recalls = new Recalls({});
    });
 
    it('has api property', function(){
      expect(recalls.api).toBe('food/enforcement.json');
    });
 
    it('has base_url', function(){
      expect(recalls.base_url).toBe('https://api.fda.gov/');
    });

    it('can initialize with custom base_url', function(){
      recalls = new Recalls( {url: 'http://test.url'} );
      expect(recalls.base_url).toBe('http://test.url');
    });

    it('expect count to call getData()', function(){
      spyOn(recalls, "getData");
      recalls.count({});
      expect(recalls.getData).toHaveBeenCalled();
    });

    it('expect count to call getData with...', function(){
      spyOn(recalls, "getData");
      recalls.count({
        type: 'state'
      });
      expect(recalls.getData).toHaveBeenCalledWith(
        'https://api.fda.gov/food/enforcement.json?api_key=J9fMuXQVgb0ftI7BPSEDGMT49c9yXdHxKPWRxaVN&count=state', 
        Object({  }), 
        undefined
      )
    });

    it('expect find to call getData()', function(){
      spyOn(recalls, "getData");
      recalls.find({});
      expect(recalls.getData).toHaveBeenCalled();
    });
    
});




describe('App... ', function(){
    var app, url = null, options = null;

    beforeEach(function () {
      spyOn(App.prototype, 'createMap').and.callFake(function(){});
      spyOn(App.prototype, 'addStatesLayer').and.callFake(function(){});
      spyOn(App.prototype, 'constructUI').and.callFake(function(){});
      spyOn(App.prototype, '_wire').and.callFake(function(){});

      spyOn(Recalls.prototype, 'count').and.callFake(function(){});
  
      recalls = new Recalls({});
      app = new App({});
    });
 
    it('has searchOptions', function(){
      expect(app.searchOptions).toBeDefined();
    });

    it('update download url when search params changed', function(){
      spyOn(app, '_updateDownloadUrl');
      spyOn(recalls, 'find').and.callFake(function() {});

      app._find({});
      expect(app._updateDownloadUrl).toHaveBeenCalled();
    });


    it('download url should equal...', function(){
      spyOn(app, '_updateDownloadUrl').and.callThrough();
      
      app._updateDownloadUrl({
        'location': 'CO',
        'date': [123, 456]
      });

      expect(app.downloadUrl).toBe("http://koop-fda-1504637322.us-east-1.elb.amazonaws.com/FDA.csv?where=distribution_pattern%20like%20'%25CO%25'%20AND%20report_date%20%3E%20123");
    });
});
