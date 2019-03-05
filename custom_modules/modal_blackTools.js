const $ = require("jquery");
const log = require('bows')('modal');
const tools=require("black_js/tools")();
let close_modal=true;
let open_modal=true;
class Modal{
  constructor(params) {
		$(document).off('click','.cont_modal').on('click','.cont_modal',(ev)=>{
			if(close_modal) this.closeModal($(ev.currentTarget));
			close_modal=true;
		});
		$(document).off('click','.view_modal').on('click','.view_modal',()=>{
			close_modal=false;
		});
		$(document).off('click','.close_modal').on('click','.close_modal',(ev)=>{
			$(ev.currentTarget).parents('.cont_modal:first').click();
			return false;
		});
		$(document).off('click','.open_modal_link').on('click','.open_modal_link',(ev)=>{
			ev.preventDefault();
			$.ajax({
				type: "GET",
				url: HOST+"loadPage.php",
				data: {
					'url':$(ev.currentTarget).attr('href')
				},
				success: (msg)=>{
					this.openModal({'title':"",'txt':msg},'modal_link')
				},
				error : (XMLHttpRequest, textStatus, errorThrown)=>{
				}
			});
			return false;
		});
	}
	openModal(cont,classMod,ajaxbody){
		if(open_modal){
			open_modal=false;
			if(typeof classMod=='undefined'){
				cont.slideDown('fast');
				$('body').addClass('overflow');
			}else{
				const modal=$('<div class="cont_modal '+classMod+'"><div class="view_modal"><div class="title_view">'+cont.title+'<div class="close_modal"></div></div><div class="body_modal">'+(!ajaxbody? cont.txt:'')+'</div></div></div>');
				$('body').append(modal);
				modal.slideDown('fast',()=>{
					modal.scrollTop(0);
					if(ajaxbody) $('.body_modal',modal).html(cont.txt);
					open_modal=true;
				});
				$('body').addClass('overflow');
				$('[type="submit"]',modal).focus();
			}
		}
	}
	closeModal(el){
		el.slideUp('fast',()=>{
			$('body').removeClass('overflow');
			if(!$(el).hasClass('no_remove')) $(el).remove();
			if($(el).hasClass('reload')) document.location.reload();
			if($(el).hasClass('auto_setting_modal')) $("[activeSetting]").removeAttr("activeSetting");
		});
	};
	ajaxInModal(aj_action,aj_data,mdl_title,mdl_class,ajaxbody){
		if(typeof ajaxbody=='undefined') ajaxbody=false
		if(open_modal){
			open_modal=false;
			$.ajax({
				type: "GET",
				url: aj_action,
				/*dataType:"json",*/
				data: aj_data,
				success: (msg)=>{
					open_modal=true;
					this.openModal({title:mdl_title,txt:msg},mdl_class,ajaxbody);
				},
				error : (XMLHttpRequest, textStatus, errorThrown)=>{
					console.log(XMLHttpRequest);
				}
			});
		}
	};
  viewInModal(aj_action,aj_data,mdl_title,mdl_class,ajaxbody){
		if(open_modal){
			open_modal=false;
      const view=tools.loadView(aj_action,aj_data,true);
      view.then((msg)=>{
        open_modal=true;
        this.openModal({title:mdl_title,txt:msg},mdl_class,ajaxbody);
      })
    }
	};
	openWait(txt){
		if(typeof txt =='undefined') txt="Wait..loading content";
		$("body").append('<div id="over_all"></div><div id="loader_cont"><span id="wait_txt">'+txt+'</span><img src="'+HOST+'images/cms/ajax-loader.gif"></div>');
		$("#loader_cont").show();
		$("#over_all").show();
	}
	closeWait(){
		$("#over_all").fadeOut("slow",()=>{
			$("#over_all").remove();
		});
		$("#loader_cont").fadeOut("slow",()=>{
			$("#loader_cont").remove();
		});
	}
}
module.exports=()=>{
  return new Modal();
}
