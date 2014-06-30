var knexDbConfig = require('../config/config').knexDbConfig,
    knex = require('knex')(knexDbConfig),
    bookshelf = require('bookshelf')(knex),
    request = require("request"),
    // UserList = require('../models/list').UserList,
    List = require('../models/list').List,
    List_Investor = require('../models/list').List_Investor,
    List_Investor_Reason = require('../models/list').List_Investor_Reason,
    Investor = require('../models/angelData.js').Investor,
    Q = require('q');


// Create a new list
exports.create = function(req, res) {
  console.log("in create route");

  var investors = req.body.investors;
  var name = req.body.tableName;
  var user = req.user;
  var date = new Date();
  var listId;

  List.forge({user_id: user.id, list_name: name, date_created: date}).save().then(function(list){
    console.log("Done creating the table.");
    listId = list.attributes.id;

    // we will need to adjust this to show 'hidden' investors
    for(var i = 0; i < investors.length; i++){
      var currInvestor = investors[i];
      var hidden;

      console.log("hidden: "+ currInvestor.hidden);

      if(currInvestor.hidden === 1){
        hidden = 1;
      } else{
        hidden = null;
      }
      List_Investor.forge({investor_id: currInvestor.id, list_id: listId, hidden: hidden}).save().then(function(investor){
        console.log("forged a new investor "+ i + " of " + investors.length);
        console.log(investor);
        var market;
        var company;
        console.log("current investor:");
        console.log(currInvestor);

        // need to loop through reasons

        for(var i =0; i<currInvestor.search_reason.length;i++){
          if(currInvestor.search_reason[i].hasOwnProperty("market")){
          market = currInvestor.search_reason[i].market;
          company = null;
        } else if (currInvestor.search_reason[i].hasOwnProperty("company")){
          company = currInvestor.search_reason[i].company;
          market = null;
        };
        }
        console.log(company);
        console.log(market);
        List_Investor_Reason.forge({investor_id:investor.attributes.investor_id, company_id: company, market_id: market, list_id: listId}).save().then(function(){
          console.log("done saving");
          res.json(200);
        });
      });
    }
  });
};

exports.getAll = function(req, res) {
  var user = req.user;
  console.log('in get all route');
  List.fetchAll({user_id: user.id}).then(function(models){
    res.json(models);
  })
};

exports.list = function(req, res) {
  console.log(req.params.id);
  List.query({where: {id: req.params.id}})
  .fetch({withRelated:['investors','company_reason','market_reason']})
  .then(function(model){
    console.log("one list");
    console.log(model.related('investors').models);
    console.log("company reasons:");
    console.log(model.related('company_reason').models);
    console.log("market reasons:");
    console.log(model.related('market_reason').models);

    // List.query({where: {id: req.params.id}})
    // .fetch({withRelated:['company_reason','market_reason']}).then(function(reason){
    //   console.log("company reasons:");
    //   console.log(reason.related('company_reason').models);
    //   console.log("market reasons:")
    //   console.log(reason.related('market_reason').models);
    // })
    // // List_Investor_Reason.query({where: {list_investor_id: model.id}})
    // // .fetch({withRelated:[]})

    res.json(model.related('investors').models);
  })
};