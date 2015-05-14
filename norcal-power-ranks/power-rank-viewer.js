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

var playerJSON = '[{"displayName":"1UP | X","normalizedName":"x","type":"ranked","wins":["PumpMagic","Virus","Ikez","Nanerz","Scourge","DSS"],"losses":["Ito","Trevonte"]},{"displayName":"Trevonte","normalizedName":"trevonte","type":"ranked","wins":["Phancy","Nanerz","DSS","Villain","AD"],"losses":["ZeRo","Arikie","Scourge","Villain"]},{"displayName":"UC | DSS","normalizedName":"dss","type":"ranked","wins":["TwicH","Rice","X","pumpmagic","bobatapioca","Arikie","Kronos","Nanerz"],"losses":["Zex","ito","ito","Trevonte","X"]},{"displayName":"Sean","normalizedName":"sean","type":"ranked","wins":["Waael","Legit"],"losses":["Arikie","Villain"]},{"displayName":"SilentSpectre","normalizedName":"silentspectre","type":"ranked","wins":[],"losses":["Virus","Villain"]},{"displayName":"1UP | Nitro","normalizedName":"nitro","type":"ranked","wins":["Rice","Villain","Bandt","Nitro","X","DSS"],"losses":["ZeRo","ZeRo","Trevonte"]},{"displayName":"Jeepy","normalizedName":"jeepy","type":"ranked","wins":[],"losses":[]},{"displayName":"Rice","normalizedName":"rice","type":"ranked","wins":["Kronos","Boba Tapioca"],"losses":[]},{"displayName":"TwicH","normalizedName":"twich","type":"ranked","wins":[],"losses":["DSS","Hitaku"]},{"displayName":"Scourge","normalizedName":"scourge","type":"ranked","wins":["Trevonte","Kronos"],"losses":["X"]},{"displayName":"1UP | Phancy","normalizedName":"phancy","type":"ranked","wins":["Soulimar","Solitary"],"losses":["Trevonte","Virus"]},{"displayName":"CrispyTacoz","normalizedName":"crispytacoz","type":"ranked","wins":[],"losses":["3Hai","ss3katen"]},{"displayName":"AD","normalizedName":"ad","type":"ranked","wins":[],"losses":["Bandt"]},{"displayName":"Bandt","normalizedName":"bandt","type":"ranked","wins":["AD"],"losses":["Nitro","Crow"]},{"displayName":"Hitaku","normalizedName":"hitaku","type":"ranked","wins":["TwicH"],"losses":["Virus"]},{"displayName":"Soulimar","normalizedName":"soulimar","type":"previously-ranked","wins":["Soronie"],"losses":["Phancy","Waael","superoven"]},{"displayName":"Fangfire","normalizedName":"fangfire","type":"previously-ranked","wins":[],"losses":["ChaosPro"]},{"displayName":"Boba Tapioca","normalizedName":"bobatapioca","type":"previously-ranked","wins":["fangfire","scourge","phancy","phancy"],"losses":["ZeRo","Rice","DSS"]},{"displayName":"BKO Legit","normalizedName":"bkolegit","type":"previously-ranked","wins":["Boba Tapioca"],"losses":["Ito","Sean"]},{"displayName":"Ito","normalizedName":"ito","type":"previously-ranked","wins":["pump magic","dss","Legit"],"losses":["ZeRo"]},{"displayName":"Phoenix D","normalizedName":"phoenixd","type":"previously-ranked","wins":[],"losses":["BKO Virus","Dragoomba"]},{"displayName":"Kronos2560","normalizedName":"kronos2560","type":"previously-ranked","wins":["GenD","Solitary","Nitro"],"losses":["DSS","Scourge"]},{"displayName":"Nanerz","normalizedName":"nanerz","type":"unranked","wins":["Virus","Solitary","GenD"],"losses":["Trevonte","Arikie","X","DSS"]},{"displayName":"Waael","normalizedName":"waael","type":"unranked","wins":["Soulimar"],"losses":["Zex"]},{"displayName":"Arikie","normalizedName":"arikie","type":"unranked","wins":["Scourge","Nanerz","Trevonte","Solitary","Sean"],"losses":["Ito","Zex","Zex","DSS"]},{"displayName":"BKO | Virus","normalizedName":"virus","type":"unranked","wins":["Hitaku","Phancy","Phoenix D","SilentSpectre","Scourge","Villain\\n"],"losses":["Nanerz","Zex","Ito"]},{"displayName":"1UP | Soilitary","normalizedName":"soilitary","type":"unranked","wins":["Waael","Hitaku","Nitro"],"losses":["Arikie","Nanerz","Kronos"]},{"displayName":"Soronie","normalizedName":"soronie","type":"unranked","wins":["Soulimar"],"losses":["superoven","soulimar"]},{"displayName":"ChaosPro","normalizedName":"chaospro","type":"unranked","wins":["Fangfire"],"losses":["ApologyMan"]},{"displayName":"GEN D","normalizedName":"gend","type":"unranked","wins":["Fangfire"],"losses":["ZeRo","Nanerz"]},{"displayName":"3Hai","normalizedName":"3hai","type":"unranked","wins":[],"losses":["CrispyTacoz"]}]'

$(function() {
    $.isLoading({
        position: 'overlay',
        'class': 'isloading-icon'});
    var players = JSON.parse(playerJSON);
    completeWinLossRecords(players);
    var links = createWinnerLinks(players);

    createGraph(players, links);
});

var usersFromPage = function(page) {
    return $.ajax({
        type: 'GET',
        url: page.url,
        dataType: 'text',
    }).then(csvToArrays).then(function(arr) {return usersFromArrays(arr, page.type)});
};

var completeWinLossRecords = function(players) {
    players.forEach(function(player) {
        player.wins.forEach(function(nameOfPersonTheyBeat) {
            var nodeOfPersonTheyBeat = findPlayerNode(nameOfPersonTheyBeat, players);
            if (nodeOfPersonTheyBeat !== null &&
                nodeOfPersonTheyBeat.losses.indexOf(player.displayName) === -1) {
                nodeOfPersonTheyBeat.losses.push(player.displayName);
            }
        });
        player.wins.forEach(function(nameOfPersonTheyLostTo) {
            var nodeOfPersonTheyLostTo = findPlayerNode(nameOfPersonTheyLostTo, players);
            if (nodeOfPersonTheyLostTo !== null &&
                nodeOfPersonTheyLostTo.wins.indexOf(player.displayName) === -1) {
                nodeOfPersonTheyLostTo.wins.push(player.displayName);
            }
        });
    });
    normalizeWinLossRecords(players);
};

var normalizeWinLossRecords = function(players) {
    players.forEach(function(player) {
        player.wins = normalizePlayerList(player.wins, players);
        player.losses = normalizePlayerList(player.losses, players);
    });
};

var normalizePlayerList = function(list, players) {
    var normalizedPlayers = list.map(function(name) {
        return normalizeName(name);
    });
    var isUnique = function(name, index, self) {
        return self.indexOf(name) === index &&
            findPlayerNode(name, players) !== null;
    }
    var filteredPlayers = normalizedPlayers.filter(isUnique);
    return filteredPlayers.map(function(normalizedName) {
        if (normalizedName === '') {
            console.log(normalizedPlayers);
        }
        var node = findPlayerNode(normalizedName, players);
        return node.displayName;
    });
};

var createWinnerLinks = function(players) {
    var links = [];
    players.forEach(function(player, wi) {
        player.wins.forEach(function(losingPlayer, li) {
            var index = findIndex(players, playerSearcher(losingPlayer));
            if (index !== -1) {
                links.push({source: wi, target: index});
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

var findPlayerNode = function(name, players) {
    return findElement(players, playerSearcher(name));
}

var highlightPlayerByNode = function(playerNode, players) {
    highlightPlayer(playerNode.normalizedName, players);
};

var highlightPlayer = function(player, players) {
    var FADE_TIME = 1400;

    $('line:not([source="' + player + '"])')
        .filter('line:not([target="' + player + '"])').fadeOut(FADE_TIME / 2);

    $('line[source="' + player + '"], line[target="' + player + '"]').fadeIn(FADE_TIME / 2);

    var playerNode = findPlayerNode(player, players);
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
