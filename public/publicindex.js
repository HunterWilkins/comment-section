$.getJSON("/articles", function(data){
    console.log(data);
    for (var i = 1; i < data.length; i++){
        $(".articles").append(
            `
            <h1 class = "title" id="${data[i]._id}">${data[i].title}</h1>
            <a href = "${data[i].link}">Link to Original Article</a>
            <p>${data[i].summary}</p>
            `);
    }
});

$(document).on("click", ".title", function(){
    var thisIdDawg = $(this).attr("id");

    $.ajax({
        method: "GET",
        url: "/articles/" + thisIdDawg
    }).then(function(data){
        console.log(data);
        $(".comments").html(
            `
            <h2>${data.title}</h2>
            <input id = "comment-title-input" name="title">
            <textarea id = "comment-body-input" name="body"></textarea>
            <button data-id="${data._id}" id="save-comment">Submit Comment</button>

            <div id = "all-comments">
            </div>
            `
        ); 
        if (data.comment !== null) {
            for (var i = 0; i <data.comment.length; i++){
                $("#all-comments").append(`<h3>${data.comment[i].title}</h3>`);
                $("#all-comments").append(`<p>${data.comment[i].body}</p>`);
            }
            
            $("#comment-title-input").val(data.comment[0].title);
            $("#comment-body-input").val(data.comment[0].body);
           
        }
    });
    
    $("#comment-title-input").val("");
    $("#comment-body-input").val("");

});

$(document).on("click", "#save-comment", function(){
    var thisIdDawg = $(this).attr("data-id");
    console.log("The Title of the Comment: " + $("#comment-title-input").val() + "\nThe Body of the Comment: " + $("#comment-body-input").val());
    $.ajax({
        method: "POST",
        url: "/articles/" + thisIdDawg,
        data:{
            title: $("#comment-title-input").val(),
            body: $("#comment-body-input").val()
        }
    }).then(function(data){
        console.log(data);
    });
});
