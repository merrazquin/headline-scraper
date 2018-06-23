var $grid = $('.grid').masonry();

$grid.imagesLoaded().progress(function () {
    $grid.masonry('layout');
});

function updateCommentCount(badge, commentCount) {
    badge.text(commentCount);
    badge.attr('data-badge-caption', commentCount == 1 ? 'comment' : 'comments');
}

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
        comments = $(this).parents('.comments')

        $.ajax({
            url: '/comment/' + id, type: 'DELETE', success: function (result) {
                $('#' + result).fadeOut(function() {
                    this.remove()
                    updateCommentCount(comments.parents('.card').find('.badge'), comments.children().length)
                })
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

            input.trigger('blur');
            form.trigger('reset');
            comments.append(data.html);
            updateCommentCount(comments.parents('.card').find('.badge'), comments.children().length)
            d.animate({ scrollTop: d.prop("scrollHeight") }, 200)
        });
    });
});