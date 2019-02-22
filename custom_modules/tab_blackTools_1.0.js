const $ = require("jquery");
exports.init=()=>{
	$(document).on('click','.link_tab',function(e){
		e.preventDefault();
		var cont=$(this).parents('.menu_tab:first').parent();
		var ind=$('.link_tab',cont).index($(this))
		$('.link_tab.active,.li_tab.active',cont).removeClass('active');
		$('.li_tab',cont).eq(ind).addClass('active');
		$(this).addClass('active');
		return false;
	})
}
exports.addTab=(el)=>{
	$('.link_tab:first',el).addClass('active')
	$('.li_tab:first',el.parent()).addClass('active')
}

/*BASIC TEMPLATE
<div>
	<ul class="menu_tab">
		<li><a href="#" class="link_tab"></a></li>
	</ul>
	<ul class="cont_tab">
		<li class="li_tab"></li>
	</ul>
</div>*/
