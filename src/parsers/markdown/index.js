var marked = require('marked'),
    sysPath = require('path'),
    stash = {},
    utils = require('../../utils/utils.js');
function addNumberWhileSameName(id) {
    if (typeof stash[id] !== 'undefined') {
        stash[id]++;
        id += stash[id];
    } else {
        stash[id] = 0;
    }
    return id;
}

function parser(contents, options) {
    var renderer = new marked.Renderer(),
        menuLevel = options.menuLevel || -1,
        subMenuLevel = options.subMenuLevel || (options.menuLevel && (options.menuLevel + 1)) || -1,
        menus = [];
    renderer.heading = function(text, level) {
        var realText = text;
        if (level == menuLevel) {
            var text = addNumberWhileSameName(text);
            menus.push({
                name: realText,
                href: utils.deepEncode(text)
            });
        }else if (level == subMenuLevel) {
            var text = addNumberWhileSameName(text);
            menus.push({
                name: realText,
                href: utils.deepEncode(text),
                sub: true
            });
        }
        stash = {}; // 清空stash watch时清空scope中的缓存
        if(text.match(/<.*>/) && (text.match(/<.*>/).length > 0)){
            return '<h' + level + '>' + realText + '</h' + level + '>';
        }else{
            return '<h' + level + ' class="subject" id="' + utils.deepEncode(text) + '">' + realText + ' <a class="hashlink" href="#' + utils.deepEncode(text) + '">#</a></h' + level + '>';
        }

    };
    renderer.listitem = function(text) {
        if (/^\s*\[[x ]\]\s*/.test(text)) {
            text = text
            .replace(/^\s*\[ \]\s*/, '<i class="empty checkbox">&#xf35f;</i> ')
            .replace(/^\s*\[x\]\s*/, '<i class="checked checkbox">&#xf35e;</i> ');
            return '<li class="task-list">' + text + '</li>';
        } else {
            return '<li>' + text + '</li>';
        }
    };
    renderer.link = function(href, title, text) {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase();
            } catch (e) {
                return '';
            }
            if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                return '';
            }
        }
        if (href.indexOf('://') == -1) {
            if (sysPath.extname(href) == '.md') {
                href = href.replace(/\.md$/, '.html');
            }
        }
        var out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    }
    return {
        type: 'html',
        menus: menus,
        content: marked(contents.join('\n'), {
            renderer: renderer
        })
    };
}

module.exports = {
    type: "markdown",
    extNames: ['.md', '.markdown'],
    parser: parser
};
