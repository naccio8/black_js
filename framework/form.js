'use strict';
const log = require('bows')('form');
const moment=require('moment');
const _ = require('lodash/core');
const $ = require("jquery");
module.exports=class Form{
  constructor(tag,params){
    log(tag,params);
    if(typeof tag!='undefined'){
      this.tag=tag;
      this.params=params;
      const form_name=(tag.attributes.form_name) ? tag.attributes.form_name:tag.attributes.model;
      this.frm_str=local_require(`form/${form_name}_frm.json`);
      return new Promise((r,e)=>{
        new Promise((r_data,e_data)=>{
          if(tag.attributes.load && tag.attributes.load!='0'){
            const model=local_require(`models/${tag.attributes.model}`)
            const filter=tag.attributes.filter ? tag.attributes.filter:'get';
            const res=eval(`model${typeof model=='function' ? '()':''}.${filter}(tag.attributes.load)`);
            res.then((data)=>{
              log('form_data',data);
              r_data(Object.values(data)[0]);
            })
          }else{
            r_data({});
          }
        }).then((data_load)=>{
          if(tag.attributes.init_data && window.global[tag.attributes.init_data]){
            log(tag.attributes.init_data,'aa')
            data_load=Object.assign(data_load,window.global[tag.attributes.init_data]);
          }
          this.renderFormEl(this.frm_str,data_load).then((data)=>{
            if(!tag.attributes.method) tag.attributes.method='POST';
            if(!tag.attributes.action) tag.attributes.action='set';
            this.form=$(`<form class="form_${tag.attributes.model}" action="${tag.attributes.action}" method="${tag.attributes.method}" data-model="${tag.attributes.model}">${(data)}<div class="cont_btn"><button type="submit">${tag.attributes.submit}</button></div></form>`);
            r(this.form[0].outerHTML);
          });
        });

      });
    }
  }
  getAttr(obj){
    const attr= _.map(obj, (v,k)=>`${k}="${v}"`);
    return attr.join(' ');
  }
  getValues(values,param){
    const def_param={type:'select'};
    param=Object.assign(def_param,param);
    return new Promise((r,e)=>{
      let ret='';
      if(typeof values=='string'){
        log(values);
        let data=local_require(`data/${values}.json`);
        log(data,param);
        if(param.vkey){
          log(typeof param.vkey,param.vkey);
          if(typeof param.vkey=='object'){
            data=_.reduce(param.vkey,(prev,val,key)=>{
              log(val,data[val]);
              return prev[val];
            },data)
          }else{
            data=data[param.vkey];
          }
          log(data);
        }
        _.each( data, (val, key)=>{
          if(typeof val=='object'){
            ret+=_.map(val,(v,k)=>{
              return this.typeValue(k,v,param);
            });
          }else{
            ret+=this.typeValue(key,val,param);
          }
        })
        r(ret);
      }else{
        log('data select',values,param);
        _.each( values, (val,key)=>{
          if(typeof val=='object'){
            ret+=_.map(val,(v,k)=>{
              return this.typeValue(k,v,param);
            });
          }else{
            ret+=this.typeValue(key,val,param);
          }
        })
        r(ret);
      }
    })
  }
  typeValue(k,v,param){
    if(param){
      switch(param.type){
        case 'radio':
          return `<div class="val_${k}"><input type="radio" name="${param.name}" value="${k}"><label>${v}</label></div>`;
        break;
        default:
          const selected=(k==param.data_val) ? 'selected':'';
          return `<option value="${k}" ${selected}>${v}</option>`;
        break;
      }
    }
  }
  async renderFormEl(frm,data){
    log(data);
    let opt='';
    let ret='';
    for (let key in frm){
      let val=frm[key];
      if(!val.property_label) val.property_label={};
      if(!val.property_input) val.property_input={};
      if(!val.property_indiv) val.property_indiv={};
      const label=(typeof val.label!='undefined' ? `<label ${this.getAttr(val.property_label)}>${(val.label==''?key:val.label)+(val.required ? '<span class="star">*</span>':'')}<span class="semicolon">: </span></label>`:'');
      if(!val.property_indiv.class) val.property_indiv.class='';
      val.property_indiv.class+=` indiv ${val.type}_indiv`;
      if(val.placeholder) val.property_input.placeholder=val.placeholder;
      let data_val=''
      switch (val.type) {
        case 'hidden':
          if(data && data[key]) data_val=data[key];
          ret+=`<input name="${key}" type="hidden" value="${data_val}">`;
        break;
        case 'pwd':
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<input name="${key}" type="password" ${this.getAttr(val.property_input)}><div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'input':
        case 'email':
          if(data && data[key]) data_val=data[key];
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<input name="${key}" value="${data_val}" type="text" ${this.getAttr(val.property_input)}><div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'text':
          if(data && data[key]) data_val=data[key];
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<textarea name="${key}" ${this.getAttr(val.property_input)}>${data_val}</textarea><div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'check':
          if(data && data[key]) data_val='checked="checked"';
          ret+=`<div ${this.getAttr(val.property_indiv)}><input name="${key}" ${data_val} type="checkbox" value="1" ${this.getAttr(val.property_input)}>${label}<div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'file':
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<div class="virtual_input"></div><input name="${key}" type="file" ${this.getAttr(val.property_input)}><div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'select':
          if(data && data[key]) data_val=data[key];
          opt=(val.values ? await this.getValues(val.values,{data_val:data_val}).then(d=>{return d}) : '');
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<select name="${key}" ${this.getAttr(val.property_input)}>${opt}</select><div class="cont_fail fail_${key}"></div></div>`;
        break;
        case 'fieldset':
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label+await this.renderFormEl(val.group).then(dat=>dat)}</div>`;
        break;
        case 'div':
          ret+=`<div ${this.getAttr(val.property_indiv)}>${val.value}</div>`;
        break;
        case 'birthday':
          let day=[{"0":"GG"}];
          let month=[{"0":"MM"}];
          let year={"0":"AAAA"};
          let date_now = parseInt(moment().format('YYYY'));
          let nf;
          for(let i=1;i<=31;i++){
            nf=("0" + i).slice(-2);
            day.push({[nf]:nf});
          }
          for(let i=1;i<=12;i++){
            nf=("0" + i).slice(-2);
            month.push({[nf]:nf});
          }
          if(!val.data_range) val.data_range=[18,90];
          if(val.data_range[1]>val.data_range[0]){
            for(let i=date_now-parseInt(val.data_range[1]);i<=date_now-parseInt(val.data_range[0]);i++){
              year[i]=i;
            }
          }else{
            for(let i=date_now-parseInt(val.data_range[1]);i<=date_now+parseInt(val.data_range[0]);i++){
              year[i]=i;
            }
          }
          ret+=`<div ${this.getAttr(val.property_indiv)}>
            ${label}
            <select name="${key}_Day" ${this.getAttr(val.property_input)}>${(await this.getValues(day))}</select>
            <select name="${key}_Month" ${this.getAttr(val.property_input)}>${(await this.getValues(month))}</select>
            <select name="${key}_Year" ${this.getAttr(val.property_input)}>${(await this.getValues(year))}</select>
            <div class="cont_fail fail_${key}"></div>
          </div>`;
        break;
        case 'radio':
          opt=(val.values ? await this.getValues(val.values,{type:val.type,name:key}).then(d=>d) : '');
          ret+=`<div ${this.getAttr(val.property_indiv)}>${label}<div class="cont_option">${opt}</div><div class="cont_fail fail_${key}"></div></div>`;
        break;
      }
    };
    return ret;
  }
  checkForm(sent_data,frm_str,form){
    let success_frm=true;
    if(typeof frm_str=='undefined') frm_str=this.frm_str;
    for (let key in frm_str){
      var val=frm_str[key]
      switch (val.type) {
        case 'fieldset':
          let tmp_success=this.checkForm(sent_data,val.group,form);
          if(!tmp_success) success_frm=false;
        break;
        case 'birthday':
          if(val.required && (sent_data[`${key}_Day`]=="0" || sent_data[`${key}_Month`]=="0" || sent_data[`${key}_Year`]=="0")){
            success_frm=false;
            $(`[name="${key}"]`,form).addClass('error');
            $(`.fail_${key}`,form).html('* Campo obbligatorio');
          }
        break;
        case 'radio':
        case 'email':
        case 'input':
        case 'text':
        case 'select':
          if(val.required && (!sent_data[key] || sent_data[key]=="0")){
            success_frm=false;
            $(`[name="${key}"]`,form).addClass('error')
            $(`.fail_${key}`,form).html('* Campo obbligatorio')
          }else if (val.menouno){
            sent_data[key]=parseInt(sent_data[key])-1;
          }
        break;
        case 'file':
          if(val.required && !$(`[name="${key}"]`,form)[0].files[0]){
            success_frm=false;
            $(`[name="${key}"]`,form).addClass('error')
            $(`[name="${key}"]`,form).parent().addClass('error')
            $(`.fail_${key}`,form).html('* Campo obbligatorio')
          }
          if($(`[name="${key}"]`,form).parent().hasClass('error')){
            success_frm=false;
          }
        break;
      }
    }
    return success_frm ? sent_data:false;
  }

}


/*function showErrorResult(form){
  $('.error_cont_mg').remove();
  $('.error',form).removeClass('error')
  $('.cont_fail',form).html('')
  form.show()
  $('#loading').hide();
}*/
