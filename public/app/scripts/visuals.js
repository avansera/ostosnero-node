
function isIE() {
    var ie = false;
    if (~navigator.userAgent.indexOf('MSIE') < 0) {
        ie = true;
    }

    return ie;
}



/**
 * Alerts
 * - closing alert boxes and labels
 */

var container = $('.app-container');

container.on('click', '.close', function(e) {
    e.preventDefault();
    console.log('clsoe deråp');
    $(this).parent().hide();
});


/**
 * password reveal for form inputs
 */
container.on('click', '.pass-reveal', function(e) {
    e.preventDefault();
    var elem = $(this).parent().find('input');
    if (elem.attr('type') === 'password') {
        elem.attr('type', 'text');
        $(this).find('i').addClass('icon-eye-open').removeClass('icon-eye-close');
    } else {
        elem.attr('type', 'password');
        $(this).find('i').addClass('icon-eye-close').removeClass('icon-eye-open');
    }
});


/**
 * menu slide animation
 */

container.on('click', '.title-bar .menu', function(e) {
    console.log('huehuehue');
});

container.on('click', '.list-item-menu-link', function(e) {
    e.preventDefault();
    var menu = $(this).parent().parent().parent();
    var menuButton = $(this);
    menu.toggleClass('expanded');
    menuButton.toggleClass('open');
    console.log(menu);
    console.log(menuButton);
    console.warn('huehuehue');
});

container.on('click', '.btn.menu', function(e){
    e.preventDefault();
    var page = $('.app-page'),
        trans = window.innerWidth-46,
        transString = 'translate3d(' + trans + 'px, 0, 0)';

    console.log('menu button clicked');
    console.log(transString);



    if(page.hasClass('nav-active')) {
        if (isIE()) {
            page.css({
                left: 'auto'
            });
        }
        else {
            page.css({
                '-webkit-transform': 'translate3d(0, 0, 0)',
                '-moz-transform': 'translate3d(0, 0, 0)',
                'transform': 'translate3d(0, 0, 0)'
            });
        }
        page.removeClass('nav-active');
    }
    else {
        if (isIE()) {
            page.css({
                left: trans
            });
        } else {
            page.css({
                '-webkit-transform': transString,
                '-moz-transform': transString,
                'transform': transString
            });
        }
        page.addClass('nav-active');
    }

});


var page = $('.app-page'),
    trans = window.innerWidth-46,
    transString = 'translate3d(' + trans + 'px, 0, 0)';

container.on('click', '.switch-wrapper', function(e){
    e.preventDefault();
    console.log('switch');
    $(this).toggleClass('on');
});


