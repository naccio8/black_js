'use strict';
const log = require('bows')('firebase');
const $ = require("jquery");
const firebase = require('firebase/app');
const templ = require("../framework/templ");
require('firebase/auth');
require('firebase/firestore');
require('firebase/storage');
module.exports=class Frb{
  constructor(params){
    this.params=params;
    log('checkapp',this.params);
    if (!firebase.apps.length) {
      log('initapp');
      firebase.initializeApp({
        apiKey: "AIzaSyAlLYpTROvlBYVxYn1CBx3SJ1NhrZJFWTA",
        authDomain: "quattrolinee-erica.firebaseapp.com",
        databaseURL: "https://quattrolinee-erica.firebaseio.com",
        projectId: "quattrolinee-erica",
        storageBucket: "quattrolinee-erica.appspot.com",
        messagingSenderId: "244979820543"
      });
    }
    const firestore=firebase.firestore();
    firestore.settings({timestampsInSnapshots: true});
    if(this.params && this.params.model) this.model= firestore.collection(this.params.model);

  }
  auth(){return firebase.auth()}
  set(data){
    const id= (data.id) ? data.id:0;
    delete data.id;
    log(data,id);
    data=_.reduce(data,(ret,val,key)=>{
      log(key,val);
      if(typeof val=='object' && !_.isEmpty(val) && val.lat && val.lng){
        ret[key]=new firebase.firestore.GeoPoint(val.lat, val.lng);
      }else{
        ret[key]=val;
      }
      return ret;
    },{});
    if(typeof id=='undefined' || id=='0' || id===0){
      log('insert',this.params);
      return this.model.add(data);
    }else{
      log('updated');
      return this.model.doc(id).update(data);
    }
  }

  get(id,params){
    if(typeof params=='object') this.params=Object.assign(this.params,params);
    log('get firestore',id,params,this.params);
    return new Promise((resolve, reject)=>{
      const {model,ret}=(()=>{
        switch(typeof id){
          case 'object':
            if(typeof id[0]=='object'){
              return {model:_.reduce(id,(ret,val,key)=>{
                let eval_var2=val[2];
                if(typeof eval_var2=='string' && eval_var2.indexOf("eval_")>=0){
                  try {
                    eval_var2=eval_var2.replace('eval_','');
                    eval_var2=eval(eval_var2);
                  }
                  catch(err) {
                    log(err);
                  }
                }
                log('eval_var2',eval_var2,params);
                return ret.where(val[0],val[1],eval_var2)
              },this.model),ret:'array'};
            }else{
              let eval_var2=id[2];
              if(typeof eval_var2=='string' && eval_var2.indexOf("eval_")>=0){
                try {
                  log('try eval');
                  eval_var2=eval_var2.replace('eval_','');
                  eval_var2=eval(eval_var2);
                }
                catch(err) {
                  log(err);
                }
              }
              log('eval_var2',eval_var2,id,params);
              return {model:this.model.where(id[0],id[1],eval_var2),ret:'array'};
            }
          break;
          case 'string':
            return {model:this.model.doc(id),ret:'single'};
          break;
          case 'undefined':
            return {model:this.model,ret:'array'};
          break;
        }
      })();
      const qs=(snapshot) => {
        log(snapshot,id,this.model,snapshot.size);
        let data={};
        if(ret=='single'){
          log('isSingle');
          if(snapshot.exists){
            data[snapshot.id]=Object.assign({id:snapshot.id},snapshot.data());
            if(data[snapshot.id].image) {
              firebase.storage().ref(data[snapshot.id].image).getDownloadURL().then(function(url) {
                data[snapshot.id].image=url;
                resolve(data);
              })
            }else{
              resolve(data);
            }
          }
        }else{
          snapshot.docChanges().forEach(change => {
            log('change_data',change,params);
            const doc=change.doc;
            data[doc.id]=Object.assign({id:doc.id},doc.data());
            if(typeof this.change==='function'){
              this.change(change.type,data[doc.id]);
            }else if(params && params.uuid){
              log('changed',change.type,change.doc.data());
              switch(change.type){
                case 'added':
                  if($(`#${params.uuid}`).length){
                    log('add new element',params);
                    if(params && params.content){
                      templ.parse(params.content,data[doc.id]).then((t_to)=>{
                        const type=(!params.attributes.type) ? 'div':params.attributes.type;
                        const type_class=(!params.attributes.type_class) ? '':params.attributes.type_class;
                        switch(type){
                          case 'div':
                          case 'li':
                            $(`#${params.uuid}`).append(`<${type} id="${params.uuid}_${doc.id}" class="${type_class}">${t_to}</${type}>`);
                          break;
                          case 'ul':
                            $(`#${params.uuid} > ul`).append(`<li id="${params.uuid}_${doc.id}">${t_to}</li>`);
                          break;
                        }
                      });
                    }
                  }
                break;
                case 'modified':
                  if(params && params.content){
                    templ.parse(params.content,data[doc.id]).then((t_to)=>{
                      log(t_to,`#${params.uuid}_${doc.id}`);
                      $(`#${params.uuid}_${doc.id}`).html(t_to);
                    });
                  }
                break;
                case 'removed':
                  if(params){
                    $(`#${params.uuid}_${doc.id}`).hide('fast');
                  }
                break;
              }
            }
          });
          log('isDouble',params,data);

          resolve(data);
        }
      }
      const qe=(err) => {
        log('Error getting documents', err);
      }
      if(ret=='single'){
        model.get().then(qs).catch(qe);
      }else{
        model.onSnapshot(qs,qe);
      }

    });
  }
}
