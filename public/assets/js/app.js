var $grid = $('.grid').masonry();

$grid.imagesLoaded().progress(function () {
    $grid.masonry('layout');
});

$(function () {
    $(document).on('click', '.addComment', function (event) {
        var d = $(this).parents('.card-reveal'),
            form = d.find('form'),
            input = form.find('input'),
            speed = Math.abs(d.prop('scrollTop') - d.prop('scrollHeight')) / 100;

        form.removeClass('hide');
        var speed = d.prop('scrollTop')
        d.animate({ scrollTop: d.prop("scrollHeight") }, speed, function () {
            input.focus();
        });
    });

    $(document).on('click', '.deleteComment', function (event) {
        var id = $(this).attr('data-id'),
            obj = $(this).parents('#' + id);

        $.ajax({
            url: '/comment/' + id, type: 'DELETE', success: function (result) {
                $('#' + result).fadeOut()
            }
        });
    });

    $(document).on('blur', '.commentForm', function (event) {
        $(this).addClass('hide');
    });

    $(document).on('submit', '.commentForm', function (event) {
        event.preventDefault();

        var input = $(this).find('input');
        var articleID = input.attr('data-id');
        var comment = input.val();
        var form = $(this)

        $.post('/comment', { articleID: articleID, comment: comment }, function (data) {
            var comments = $('#' + data.articleID + ' .comments'),
                d = comments.parents('.card-reveal');

            form.trigger('reset');
            comments.append(data.html);
            d.animate({ scrollTop: d.prop("scrollHeight") }, 200)
        });
    });
});