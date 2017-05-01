$('#saveForm').click(function(e){
	e.preventDefault();
	var data = {};
	$('#formSetting input[type=text]').serializeArray().forEach(function (ell) {
		if(ell.value.trim() != ""){
			var name = ell.name;
			var val = ell.value;
		 	data[name] = ell.value;
		}
	});
	$.ajax({
        url: "/setting",
        method: "POST",
        data: data,
    }).then(function(res) {
        console.log(res);
    });
})