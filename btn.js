
$("button").click(function(){ 
    const call = io();
    var button = $(this).val();
    console.log(button);
    call.emit('btnaction', {
        value: button.toString()
    });
})


$('#radio input').click(function(){ 
    const call = io();
    var button = $(this).val();
    console.log(button);
    call.emit('btnaction', {
        value: button.toString()
    });
    
    if(button == 'm1'){ 
        $(this).addClass('disabled');
    }else{
        var element = document.getElementById("option1");
        element.classList.remove("disabled")
    }
    
    if(button = 'm3'){
        $(this).addClass('disabled');
    }else{
        var element = document.getElementById("option3");
        ElementInternals.classList.remove("disabled");
    }

    
})
