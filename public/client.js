$("#loginButton").click(function() {
    var login = $("[name='login']").val();
    var password = $("[name='password']").val();

    $.ajax({
        url: "/",
        method: "POST",
        data: {
            "login": login,
            "password": password
        },
    }) . then(function(res) {
    console.log(res);
});


});