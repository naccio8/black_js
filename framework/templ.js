'use strict';
const log = require('bows')('templ');
const uuid = require('uuid/v4');
const Shortcode = require('../custom_modules/shortcode-naccio');
const _ = require('lodash/core');
const Form = require('../framework/form');
const short = Shortcode({
    start: '[[',
    end: ']]'
});
const repl = Shortcode({
    start: '{{',
    end: '}}',
    single:true
});
repl.add(/.+/, (tag,param)=>{
  return (eval(`param.${tag.tagName}`)) ? eval(`param.${tag.tagName}`):`{{${tag.tagName}}}`;
});
short.add('form', (tag,param)=>{
  return new Promise((resolve, reject)=>{
    log('form param',param);
    const form=new Form(tag,param);
    form.then((frm)=>{
      resolve(frm)
    })

  })
})
short.add('list', (tag,param)=>{
  log('parse model',tag.attributes.model);

  log('TAG CONTENT',tag.content);
  tag.uuid=uuid();
  const model=local_require(`models/${tag.attributes.model}`);
  const filter=tag.attributes.filter ? tag.attributes.filter:'get';
  tag.content=(tag.attributes.views)?local_require(`views/data_views/${tag.attributes.views}.html`):tag.content;
  return new Promise((resolve, reject)=>{
    if(tag.attributes.where) param.id=tag.attributes.where.split(',');
    const res=eval(`model${typeof model=='function' ? '()':''}.${filter}(param.id,tag)`);
    res.then((data)=>{
      log('result model',tag.attributes.model);
      log(data);
      //data is an object of result, parse it with repl and put in pdo for PromiseALL
      let pdo=_.map(data,(val,key)=>{
        return new Promise((r,e)=>{
          repl.parse(tag.content,val)
          .then((val)=>{
            log('parsed result model',tag.attributes.model);
            r({id:key,cont:val});
          })
          .catch((err)=>{
            e(err);
          });
        });
      });
      Promise.all(pdo).then(values => {
        log(values);
        let cont_ret='';
        const type=(!tag.attributes.type) ? 'div':tag.attributes.type;
        const type_class=(!tag.attributes.type_class) ? '':tag.attributes.type_class;
        switch(type){
          case 'div':
          case 'li':
            cont_ret=_.reduce(values,(ret_red,val,key)=>{
              return ret_red+`<${type} id="${tag.uuid}_${val.id}" class="${type_class}">${val.cont}</${type}>`;
            },'');
            log('resolve model',tag.attributes.model);
          break;
          case 'ul':
            cont_ret=_.reduce(values,(ret_red,val,key)=>{
              return ret_red+`<li id="${tag.uuid}_${val.id}">${val.cont}</li>`;
            },'');
            log('resolve model',tag.attributes.model);
            cont_ret=`<ul class="${type_class}">${cont_ret}</ul>`;
          break;
        }
        let main_class='list_main';
        if(tag.attributes.main_class) main_class+=' '+tag.attributes.main_class;
        resolve(`<div id="${tag.uuid}" class="${main_class}">${cont_ret}</div>`);
      });
    })
  });
});

exports.parse=(source,data)=>{
  if(!data) data={};
  const txt=(typeof source=='object') ? source.html():source;
  return new Promise((resolve, reject)=>{
    //log(txt,data);
    repl.parse(txt,data).then(parsedText=>{
      short.parse(parsedText,data).then(parsedText=>{
        //log('short parsed',parsedText);
        repl.parse(parsedText,data).then(parsedText=>{
          //log('repl parsed',parsedText);
          resolve(parsedText.replace(/(\{\{[^\}]+\}\})/g,''));
        });
      });
    });

  });

}
