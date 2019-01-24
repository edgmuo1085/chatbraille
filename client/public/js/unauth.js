$('form .message a').on('click', e => {
    e.preventDefault();
    if($('.login:visible').length > 0) {
        $('.login').css('display','none');
        $('.register').css('display','block');
    } else {
        $('.register').css('display','none');
        $('.login').css('display','block');
    }
});

function response (data) {
    let resp = data.responseText;
    try {
        if (data.message != void (0)) {
            resp = data.message;
        } else {
            resp = JSON.parse(data.responseText);
            resp = resp.message;
        }
    } catch (e) {}
    return resp;
}

$('form').on('submit', e => {
    e.preventDefault();
    let value = $(e.target).attr('id');
    let selector = '#' + value;
    $.ajax({
        url: '/' + value,
        type: 'POST',
        data: $('#register').serialize(),
        data: {
            username: $(selector + ' [name=username]').val(),
            email: $(selector + ' [name=email]').val(),
            password: $(selector + ' [name=password]').val(),
            nacimiento: $(selector + ' [name=nacimiento]').val()
        },
        beforeSend: () => {
            $(selector + ' button').prop('disabled', true);
        },
        success: (res) => {
            $('#msg').empty();
            //alert(response(res));
            $('#msg').append(response(res));
            //location.reload();
            location.href = 'chat';
        },
        error: (res) => {
            $('#msg').empty();
            //alert(response(res));
            $('#msg').append(response(res));
        },
        complete: () => {
            $(selector + ' button').prop('disabled', false);
        }
    })
});