var tilePixelWidth = 64;
var tilePixelHeight = 64;
var tileWidth = 15;
var tileHeight = 8;
var boardWidth = tilePixelWidth * tileWidth;
var boardHeight = tileHeight * tilePixelHeight;

var tileRatios = {
    'Stone': 3,
    'Fertilizer': 2,
    'Sunlight': 2,
    'Water': 2
};


var startGame = function() {
    var gameWidth = tileWidth * tilePixelWidth;
    var gameHeight = tileHeight * tilePixelHeight;
    Crafty.init(gameWidth, gameHeight);
    Crafty.background('black');
    Crafty.e('TileBoard');
};

var randomTile = function() {
    var total = tileRatios.Stone +
        tileRatios.Fertilizer +
        tileRatios.Sunlight +
        tileRatios.Water;
    var stone = tileRatios.Stone / total;
    var fertilizer = tileRatios.Fertilizer / total;
    var sunlight = tileRatios.Sunlight / total;

    var num = Math.random();
    if (num < stone) {
        return Crafty.e('Stone');
    } else if (num < stone + fertilizer) {
        return Crafty.e('Fertilizer');
    } else if (num < stone + fertilizer + sunlight) {
        return Crafty.e('Sunlight');
    } else {
        return Crafty.e('Water');
    }
};



Crafty.c('TileBoard', {
    init: function() {
        var draggable = Crafty.e('DraggableTiles');
        var tiles = Crafty.e('TileMap');
        draggable.bind('TileDragStart', function(e) {
            console.log('TileDragStart: {x: ' + e.x + ', ' + 'y: ' + e.y + '}');
        });
        draggable.bind('TileDragEnd', function(e) {
            tiles.reposition(e);
        });
        draggable.bind('TileDragging', function(e) {
            tiles.drag(e);
        });
    }
});

Crafty.c('DraggableTiles', {
    init: function() {
        this.requires('2D, DragEvent');
        this.attr({x: 0, y: 0, w: boardWidth, h: boardHeight});
        this._moving = false;
        this._direction = null;
        this._start = null;
        this.bind('DragStart', function(e) {
            if (this._moving === true) {
                console.log("We shouldn't start dragging when we are already dragging!");
                return;
            }
            this._start = e;
            this.trigger('TileDragStart', this._tileConvert(e));
            this._moving = true;
        });
        this.bind('DragEnd', function(e) {
            if (this._moving === false) {
                console.log("We shouldn't stop dragging when we haven't started!");
                return;
            }
            var oldDirection = this._direction;
            this.trigger('TileDragEnd', this._createDraggingEvent(e));
            this._moving = false;
            this._direction = null;
            this._start = null;
        });
        this.bind('Dragging', function(e) {
            if (this._moving === false) {
                console.log("We shouldn't stop dragging when we haven't started!");
                return;
            }
            if (this._direction === null) {
                this._direction = this._findDirection(e);
            }

            this.trigger('TileDragging', this._createDraggingEvent(e));
        });
    },


    _findDirection: function(m) {
        var delta = this._movementDelta(m);
        if (delta.x === 0 && delta.y === 0) {
            console.log('We are trying to set a direction for a nonmovement.');
        }
        if (Math.abs(delta.x) >= Math.abs(delta.y)) {
            return 'horizontal';
        } else {
            return 'vertical';
        }
    },

    _createDraggingEvent: function(m) {
        var delta = this._movementDelta(m);
        if (this._direction === 'horizontal') {
            return {
                direction: this._direction,
                delta: delta.x,
                index: Math.floor(this._start.y / tilePixelHeight)
            };
        } else {
            return {
                direction: this._direction,
                delta: delta.y,
                index: Math.floor(this._start.x / tilePixelWidth)
            };
        }
    },

    _movementDelta: function(m) {
        return {
            x: m.x - this._start.x,
            y: m.y - this._start.y
        };
    },

    _tileConvert: function(m) {
        return {x: m.x / tilePixelWidth, y: m.y / tilePixelHeight};
    }


});


Crafty.c('Tile', {
    init: function() {
        this.requires('2D, Canvas, Grid, Color');
        this.color(randomColor());
        this.attr({
            w: tilePixelWidth,
            h: tilePixelHeight
        });
    },

    create: function(x, y) {
        this.attr({
            x: x * tilePixelWidth,
            y: y * tilePixelHeight
        });
        return this;
    }
});

Crafty.c('Stone', {
    init: function() {
        this.requires('Tile');
        this.color('#BDB4B3'); //#FF0D00
    }
});

Crafty.c('Fertilizer', {
    init: function() {
        this.requires('Tile');
        this.color('#00C618');
    }
});

Crafty.c('Sunlight', {
    init: function() {
        this.requires('Tile');
        this.color('#FFFD00');
    }
});

Crafty.c('Water', {
    init: function() {
        this.requires('Tile');
        this.color('#104BA9');
    }
});

Crafty.c('DragEvent', {
    init: function() {
        this._pressed = false;
        this.requires('Mouse');
        this.bind('MouseDown', function(e) {
            if (this._pressed === true) {
                console.log("We shouldn't be pressing when we are pressed!");
                return;
            }
            this._pressed = true;
            this.trigger('DragStart', e);
        });
        this.bind('MouseUp', function(e) {
            if (this._pressed === false) {
                console.log("We shouldn't be releasing when we aren't pressed!");
                return;
            }
            this._pressed = false;
            this.trigger('DragEnd', e);
        });
        this.bind('MouseMove', function(e) {
            if (this._pressed === false) return;

            this.trigger('Dragging', e);
        });
    }
});

Crafty.c('TileMap', {
    init: function() {
        this._makeMap();
    },

    _makeMap: function() {
        this._map = [];
        for (var x = 0; x < tileWidth; ++x) {
            for (var y = 0; y < tileHeight; ++y) {
                if (y === 0) {
                    this._map[x] = [];
                }
                this._map[x][y] = randomTile().create(x, y);
            }
        }
    },

    drag: function(dragArgs) {
        if (dragArgs.direction === 'horizontal') {
            for (var x = 0; x < tileWidth; ++x) {
                this._map[x][dragArgs.index].x = this._horizontalPos(x, dragArgs.delta);
            }
        } else {
            for (var y = 0; y < tileHeight; ++y) {
                this._map[dragArgs.index][y].y = this._verticalPos(y, dragArgs.delta);
            }
        }
    },


    reposition: function(reposArgs) {
        var indexDelta;
        if (reposArgs.direction === 'horizontal') {
            indexDelta = this._indexDelta(reposArgs.delta, tilePixelWidth);
            this.drag({
                direction: 'horizontal',
                index: reposArgs.index,
                delta: indexDelta * tilePixelWidth
            });
            this._resetRow(reposArgs.index, indexDelta);
        }
        else {
            indexDelta = this._indexDelta(reposArgs.delta, tilePixelHeight);
            this.drag({
                direction: 'vertical',
                index: reposArgs.index,
                delta: indexDelta * tilePixelHeight
            });
            this._resetColumn(reposArgs.index, indexDelta);
        }
    },

    _resetRow: function(yIndex, indexDelta) {
        var row = this._newHorizontalRow(yIndex, indexDelta);
        for (var x = 0; x < tileWidth; ++x) {
            this._map[x][yIndex] = row[x];
        }
    },

    _resetColumn: function(xIndex, indexDelta) {
        var column = this._newVerticalColumn(xIndex, indexDelta);
        this._map[xIndex] = column;
    },

    _newVerticalColumn: function(xIndex, indexDelta) {
        var newColumn = [];
        for (var y = 0; y < tileHeight; ++y) {
            var nindex = y + indexDelta;
            if (nindex < 0) {
                nindex += tileHeight;
            } else if (nindex >= tileHeight) {
                nindex -= tileHeight;
            }
            newColumn[nindex] = this._map[xIndex][y];
        }
        return newColumn;
    },

    _newHorizontalRow: function(yIndex, indexDelta) {
        var newRow = [];
        for (var x = 0; x < tileWidth; ++x) {
            var nindex = x + indexDelta;
            if (nindex < 0) {
                nindex += tileWidth;
            } else if (nindex >= tileWidth) {
                nindex -= tileWidth;
            }
            newRow[nindex] = this._map[x][yIndex];
        }
        return newRow;
    },


    _indexDelta: function(delta, mod) {
        if (delta === 0) return 0;

        var index = delta / mod;
        if (index > 0) {
            return Math.round(index);
        } else {
            return -Math.round(Math.abs(index));
        }
    },

    _horizontalPos: function(index, delta) {
        var halfWidth = tilePixelWidth / 2;
        var pos = tilePixelWidth * index + delta;
        if (pos < -halfWidth) {
            pos += boardWidth;
        } else if (pos > (boardWidth - halfWidth)) {
            pos -= boardWidth;
        }
        return pos;
    },

    _verticalPos: function(index, delta) {
        var halfHeight = tilePixelHeight / 2;
        var pos = tilePixelHeight * index + delta;
        if (pos < -halfHeight) {
            pos += boardHeight;
        } else if (pos > (boardHeight - halfHeight)) {
            pos -= boardHeight;
        }
        return pos;
    }

});



var randomColor = function() {
    var random255 = function() {
        return Math.floor(Math.random() * 255);
    };
    var r = random255();
    var g = random255();
    var b = random255();
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
};
