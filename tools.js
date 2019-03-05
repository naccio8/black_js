'use strict';
const $ = require("jquery");
const templ = require("./framework/templ");
class Tools{
  constructor(params) {
  }
  loadView(to,parse_param,promise=false){
    const html=local_require(`views/data_views/${to}.html`);
    const parse_html=(resolve)=>{
      templ.parse(html,parse_param).then((t_to)=>{
        if(!promise){
          $('#'+to).html(t_to);
          viewIn('#'+to);
        }else{
          resolve(t_to);
        }
      });
    }
    if(!promise){
      parse_html();
    }else{
      return new Promise((resolve, reject)=>{
        parse_html(resolve);
      });
    }

  }
  viewIn(id){
    const el=$(id);
    focusOut();
    el.addClass('view_active');
    let zind=2;
    $('.view_active').not(el).each(function(){
      if(parseInt($(this).css("z-index"))>=zind) zind=parseInt($(this).css("z-index"))+1
    })
    el.css('z-index',zind);
    el.animate({
      left: 0
    }, 500, function() {

    });
  }

  viewOut(id){
    const el=$(id);
    focusOut();
    el.removeClass('view_active');
    el.animate({
      left: '100%'
    }, 500, function() {
      el.css('z-index',1);
    });
  }
  setTap(){
    tap = true;
    if(tap_timer!=null) {
      clearTimeout(tap_timer);
      tap_timer=null;
    }
    tap_timer=setTimeout(function() {
      tap = false;
    }, 300);
  }
  checkTouch(ev) {
    switch(ev.type) {
      case 'click':
        //return false;
        ev.preventDefault();
        if(!tap) {
          return true;
        }
        break;
      case 'touchstart':
        setTap();
        prevX = startX = getCoord(ev, 'X');
        prevY = startY = getCoord(ev, 'Y');
        break;
      case 'touchend':
        ev.preventDefault();
        if(inmove) {
          inmove = false;
          return false;
        }
        setTap();
        if(Math.abs(getCoord(ev, 'X') - startX) < 20 && Math.abs(getCoord(ev, 'Y') - startY) < 20) {
          return true;
        }
        break;
    }
    return false;
  }
}
module.exports=(param)=>{
  return new Tools(param);
}
