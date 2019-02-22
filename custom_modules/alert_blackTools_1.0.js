//CONTROL CUSTOM CONFIRM
const $ = require("jquery");
const modal = require("./modal_blackTools_1.0")();
class Alert{
  constructor(params) {
    window.confirm = (e, yesCallback, noCallback, param)=>{
        //$('body').append('<div class="cont_modal popAlert"><div class="view_modal"><div class="title_view"><?php echo SITE_NAME?> Confirm<div class="close_modal"></div></div>'+e+'<div class="frm_cont_btn"><button class="no salva_record">No</button><button class="yes">Si</button></div></div></div>'
        if(typeof e!='object'){
            e={title:"Confirm",txt:e};
        }
        modal.openModal({ title: e.title, txt: e.txt + '<div class="frm_cont_btn"><button class="yes">Yes</button><button class="no" type="submit">No</button></div>' }, 'popAlert');
        $('.popAlert .no').click((ev)=>{
            noCallback(param);
            modal.closeModal($(ev.currentTarget).parents('.cont_modal'))
        })
        $('.popAlert .yes').click((ev)=>{
            yesCallback(param);
            modal.closeModal($(ev.currentTarget).parents('.cont_modal'))
        })
    };
    window.alert = (e)=>{
        //console.log(typeof e)
        if(typeof e!='object'){
            e={title:"Alert",txt:e};
        }
        modal.openModal({ title: e.title, txt: e.txt + '<div class="frm_cont_btn"><button class="yes" type="submit">OK</button></div>' }, 'popAlert');

        $('.popAlert .yes').click((ev)=>{
            modal.closeModal($(ev.currentTarget).parents('.cont_modal'));
        });
    };
  }
  notice(text,set_param){
    const param={type:'success',time:2000}; //type def:warning, success, info, danger;
    $.extend(param, set_param);
    if(!$('#notice_cont').length) $('body').append('<div id="notice_cont"></div>');
    const notice_el=$('<div class="notice alert-'+param.type+'">'+text+'</div>');
    $('#notice_cont').append(notice_el);
    notice_el.fadeIn('fast',()=>{
      setTimeout(()=>{
        notice_el.fadeOut('fast',function(){
          notice_el.remove();
          if(!$('.notice').length) $('#notice_cont').remove();
        })
      },param.time);
    })
  }
}
module.exports=()=>{
  return new Alert();
}
