var pages = [{
    url: 'https://docs.google.com/spreadsheets/d/1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU/export?format=csv&id=1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU',
    type: 'ranked'
}, {
    url: 'https://docs.google.com/spreadsheets/d/1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU/export?format=csv&id=1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU&gid=858288699',
    type: 'previously-ranked'
}, {
    url: 'https://docs.google.com/spreadsheets/d/1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU/export?format=csv&id=1wlKWFVcheH5wNY85zsByhXzKVwagYcqnk1Oj7-oYngU&gid=991209167',
    type: 'unranked'
}]

$(function() {
    $.isLoading({
        position: 'overlay',
        'class': 'isloading-icon'});
    var promises = pages.map(function(page) {return usersFromPage(page);});
    $.when.apply(null, promises).done(function() {
        var players = Array.prototype.concat.apply([], arguments);
        var links = createWinnerLinks(players);

        createGraph(players, links);
    });
});

var usersFromPage = function(page) {
    return $.ajax({
        type: 'GET',
        url: page.url,
        dataType: 'text',
    }).then(csvToArrays).then(function(arr) {return usersFromArrays(arr, page.type)});
};

var createWinnerLinks = function(players) {
    var links = [];
    players.forEach(function(player, wi) {
        player.wins.forEach(function(losingPlayer, li) {
            var index = findIndex(players, playerSearcher(losingPlayer));
            if (index !== -1) {
                links.push({source: wi, target: li});
            }
        });
    });
    return links;
};

var createGraph = function(nodes, links) {
    var width = $(window).width() - 350;
    var height = $(window).height() - 200;

    var svg = d3.select('#player-graph').append('svg')
        .attr('width', width)
        .attr('height', height);

    var force = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(links)

    force.linkDistance(width/4.8);

    var link = svg.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');

    var node = svg.selectAll('.node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'node');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {return d.displayName;});

    node.call(tip)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(node) {return highlightPlayerByNode(node, nodes)});

    force.on('end', function() {

        node.attr('r', width/200)
            .attr('cx', function(d) { return d.x;})
            .attr('cy', function(d) { return d.y;})
            .attr('class', function(d) { return 'node ' + d.type})
            .attr('sm4sh:id', function(d) { return d.normalizedName});

        link.attr('x1', function(d) { return d.source.x;})
            .attr('y1', function(d) { return d.source.y;})
            .attr('x2', function(d) { return d.target.x;})
            .attr('y2', function(d) { return d.target.y;})
            .attr('sm4sh:source', function(d) { return d.source.normalizedName;})
            .attr('sm4sh:target', function(d) { return d.target.normalizedName;})
        highlightPlayer('dss', nodes);
        $('body').isLoading('hide');
    });

    force.start();
}

var csvToArrays = function(csvText) {
    return $.csv.toArrays(csvText);
};

var usersFromArrays = function(arrays, type) {
    var users = [];
    var i = 2;
    while (i < arrays.length && arrays[i].length !== 0) {
        users.push({
            displayName: arrays[i][0].trim(),
            normalizedName: normalizeName(arrays[i][0]),
            type: type,
            wins: arrays[i].slice(2).filter(function(v) {return v.length !== 0;}),
            losses: arrays[i + 1].slice(2).filter(function(v) {return v.length !== 0;})
        })
        i += 3;
    }
    return filterBrokenUsers(users);
};

var filterBrokenUsers = function(users) {
    // temporary while nanerz fixes his spreadsheet
    return users.filter(function(user) {
        return user.normalizedName !== '';
    });
}

var normalizeName = function(name) {
    var normalized = removeTeamNames(name);
    normalized = removeWhitespace(normalized);
    return normalized.toLowerCase()
};

var removeTeamNames = function(name) {
    return name.replace(/(.*)\| (.*)/, '$2');
};

var removeWhitespace = function(name) {
    return name.replace(/\s/g, '');
}

var findIndex = function(array, callback) {
    for (var i = 0; i < array.length; ++i) {
        if (callback(array[i])) {
            return i;
        }
    }
    return -1;
};

var findElement = function(array, callback) {
    for (var i = 0; i < array.length; ++i) {
        if (callback(array[i])) {
            return array[i]
        }
    }
    return null;
}

var playerSearcher = function(name) {
    return function(player) {
        return player.normalizedName === normalizeName(name);
    }
};

var highlightPlayerByNode = function(playerNode, players) {
    highlightPlayer(playerNode.normalizedName, players);
};

var highlightPlayer = function(player, players) {
    var FADE_TIME = 1400;

    $('line:not([source="' + player + '"])')
        .filter('line:not([target="' + player + '"])').fadeOut(FADE_TIME / 2);

    $('line[source="' + player + '"], line[target="' + player + '"]').fadeIn(FADE_TIME / 2);

    var playerNode = findElement(players, playerSearcher(player));
    var html = '<div class="centered">'
    html += '<h2 class="current-player">' + playerNode.displayName + '</h2>'
    html += playerHTML('Wins', 'wins', playerNode.wins, players);
    html += playerHTML('Losses', 'losses', playerNode.losses, players);
    html += '</div>'

    $('#player-sidebar').html(html).hide().fadeIn(FADE_TIME);
}

var playerHTML = function(title, cls, playerNames, players) {
    var html = '<div class="' + cls + ' player-column"><h2>' + title + '</h2>'
    html += playerNames.map(function(name) {
        return '<span>' + name + '</span></br>';
    }).join('');
    html += '</div>'
    return html;
};
