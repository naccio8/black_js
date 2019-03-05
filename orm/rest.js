'use strict';
const log = require('bows')('rest');
const $ = require("jquery");
module.exports=class Rest{
  constructor(params){
    this.params=params;
    this.model= this.params.host;
    if(this.params.model) this.model+=this.params.model;
    this.force_json= this.params.force_json ? this.params.force_json:false;
  }
  set(data,method){
    if(this.force_json) data=JSON.stringify(data);
    log('prova',this,data,method);
    return new Promise((resolve, reject)=>{
      $.ajax({
  			type: method,
  			url: this.model,
        dataType:"json",
        cache:false,
  			data: data,
  			success: function(obj){
          log(obj,'result');
          return resolve(obj);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
  			  log(XMLHttpRequest);
          reject(XMLHttpRequest);
  			}
      })
    })
  }
  get(data,method){
    return this.set(data,method);
  }
}
