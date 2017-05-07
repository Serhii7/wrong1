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
        if (typeof res.redirectTo === 'string') {
            window.location = res.redirectTo;
        }else{
            $("#error").text(res);
        }
    });
    return false;

});

$("#signOut").click(function(){
     var cookies = document.cookie.split(";");

         for (var i = 0; i < cookies.length; i++) {
             var cookie = cookies[i];
             var eqPos = cookie.indexOf("=");
             var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
             document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
         }
})

$("#add_repost").click(function(e) {
   e.preventDefault();
    var textpost = $("[name='text']").val();

    if(textpost.length != 0 ){
        $.ajax({
            url: "/addposts",
            method: "POST",
            data: {
                "text":textpost,
                "picture":"",
            },
        }).then(function(res) {
            console.log(res);
            // var $bookTemplate = $("#template > div").clone();
            // $bookTemplate.find(".text-post").text(textpost);
            // $bookTemplate.find(".deletePost").attr("data-id",res);
            // $("#wrapper-posts").append($bookTemplate);
             location.reload();
            });
        }else{
            alert("error");
        }
        


});
$("button[post-id]").click(function(e){
    e.preventDefault();
    var id = $(e.currentTarget).attr("post-id");
    var commentText =$(e.currentTarget).prev().val().trim();
    if(commentText.length >1){
    console.log(commentText); 
    $.ajax({
        url: "/comment",
        method: "POST",
        data: {
            "id": id,
            "option":"add",
            "text":commentText
        },
    }).then(function(res) {
        console.log(res);
        location.reload();
    });
    }else{
        alert("Empty Comment");
    }

});
$("#adds").submit(function(e){
    e.preventDefault();

    // console.log($("#filea").val());

    if($("#filea").val() ==""){
        e.preventDefault();
         var textpost = $("[name='text']").val();
         if(textpost.length != 0 ){
             $.ajax({
                 url: "/addposts",
                 method: "POST",
                 data: {
                     "text":textpost,
                     "picture":"",
                 },
             }).then(function(res) {
                 console.log(res);
                  location.reload();
                 });
             }else{
                 alert("error");
             }
    }else{
    var formData = new FormData($(this)[0]);

    var text = $("#textPost").val();
    formData.append('text', text);
   $.ajax({
       url: '/uploadsPost',
       type: 'POST',
       data:formData,
       //async: false,
       cache: false,
       contentType: false,
       enctype: 'multipart/form-data',
       processData: false,
       success: function (response) {
         alert(response);
       }
   });}
});
$("div.delete[comment-id]").click(function(e){
    e.preventDefault();
    var idP = $(e.currentTarget).attr("post-id");
    var idC = $(e.currentTarget).attr("comment-id");

    $.ajax({
        url: "/comment",
        method: "POST",
        data: {
            "idP": idP,
            "idC": idC,
            "option":"delete"
        },
    }).then(function(res) {
        console.log(res);
        $(e.currentTarget).parent().remove();
    });
});
$("div.likes").click(function(e){
    e.preventDefault();
    var idP = $(e.currentTarget).attr("post-id");
    var idC = $(e.currentTarget).attr("comment-id");
    $.ajax({
        url: "/comment",
        method: "POST",
        data: {
            "idP": idP,
            "idC": idC,
            "option":"like"
        },
    }).then(function(res) {
        console.log(res);
        
    });

});
$("#findPerson").click(function(e){
    e.preventDefault();
    var user = $('input[name="searchPerson"]').val().trim();
    $.ajax({
        url: "/searchUser",
        method: "POST",
        data: {
            "user": user,
        },
    }).then(function(res) {
        console.log(res);
    });
})
$(".likesPost").click(function(e){
    e.preventDefault();
   var id = $(e.currentTarget).attr("post-id");
   $.ajax({
       url: "/likePost",
       method: "POST",
       data: {
           "id": id,
       },
   }).then(function(res) {
       console.log(res);
    $( e.currentTarget).parent().remove();
   });
})
$("div.deletePost[data-id]").click(function(e){
    e.preventDefault();
    var id = $(e.currentTarget).attr("data-id");
    console.log(id);
    $.ajax({
        url: "/deletePost",
        method: "POST",
        data: {
            "id": id,
        },
    }).then(function(res) {
        console.log(res);
     $( e.currentTarget).parent().remove();
    });
});
$("#bowntags").click(function(e){
    e.preventDefault();
    var owntag = $("#owntages").val();
    $.ajax({
        url: "/tags",
        method: "POST",
        data: {
            "tag":owntag,
            "oparation":"owntags"
        },
    }).then(function(res) {
        console.log(res);
    });
});
$("#btag").click(function(e){
    e.preventDefault();
    var owntag = $("#tag").val();
    $.ajax({
        url: "/tags",
        method: "POST",
        data: {
            "tag":owntag,
            "oparation":"tag"
        },
    }).then(function(res) {
        console.log(res);
    });
});
$("#writeMessage").click(function(e){
    var userId = $(e.currentTarget).attr("user-id");
    $.ajax({
        url: "/sendMessege",
        method: "POST",
        data: {
            "userId":userId
        },
    }).then(function(res) {
        console.log(res);
    });
});
$("#follow").click(function(e){
    var userId = $(e.currentTarget).attr("user-id");
    $.ajax({
        url: "/follow",
        method: "POST",
        data: {
            "userId":userId
        },
    }).then(function(res) {
        $("#follow").text(res);
        console.log(res);
    });
})
$("#loginSignUp").click(function() {
    var login = $("[name='login']").val();
    var password = $("[name='password']").val();
    var email = $("[name='email']").val();
    $.ajax({
        url: "/reg",
        method: "POST",
        data: {
            "login": login,
            "password": password,
            "email": email
        },
    }) . then(function(res) {
        console.log(res);
});
});



$("#filea").change(function(){
   if($("#filea").val() ==""){
    console.log("no");
    $("#chosen").hide();

   }else{
    console.log("yes");
    $("#chosen").show();
     $("#chosen").html($("#filea").val());
   }
});

var dialog = false;
$('#loadDialogs').click(function(){
    if(!dialog){
        dialog =true;
    $.ajax({
        url: "/loadDialogs",
        method: "POST"
        }) . then(function(res) {
            console.log(res);
            var $dialogWrapper = $('#dialogWrapper');
            res.forEach(function(dial) {
                var $dialogTemplate = $("#templateDialog > div").clone();
                $dialogTemplate.find("[lastMessege]").text(dial.user);
                $dialogTemplate.find("[avatar]").attr("src","../" + dial.img);
                $dialogTemplate.find("[textMsg]").text(dial.mess);
                $dialogTemplate.find("[lastMessege]").attr('href','/chat/?dialog='+dial.id);
                $dialogWrapper.append($dialogTemplate);
            })
        })
    }
})

var News = false;
var number = 0;
$('#loadNews').click(function(){

    if(!dialog){
        number++;
        dialog =true;
    $.ajax({
        url: "/loadNews",
        method: "POST",
        data:{
            number:number
        }
        }) . then(function(res) {
            console.log(res);
           TemplateNews('#wrapperNewsComments', res.dataComment);
           TemplateNews('#wrapperNewsLikes', res.dataLikes);
           TemplateNews('#wrapperNewsPosts', res.dataPost);
        })
    }
})
function TemplateNews(id, data){
    var $wrapper = $(id);
    data.forEach(function(ell){
        var $template = $('#templateNewsWrapper > div').clone();
        if(data.picture == "undefined"){
            $template.find("[img-href]").attr("src",'../'+ noavatar.jpg);
        } else {
            $template.find("[img-href]").attr("src",'../'+ ell.picture);
        }
        $template.find("[a-href]").attr("href",'./userpage/'+ell.userName);
        $template.find("[a-href]").text(ell.userName);
        $template.find("[date-wrapper-news]").text(ell.date);
        $template.find("[text-wrapper-text]").text(ell.text);

        $wrapper.append($template)
    })
}
