(function() {
  var InteractiveGraph, data, lineGraph, xlabels;

  InteractiveGraph = (function() {
    InteractiveGraph.prototype.createTransform = function(domain, range) {
      var alpha, beta;
      alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
      beta = range[0] - (alpha * domain[0]);
      return function(x) {
        return alpha * x + beta;
      };
    };

    function InteractiveGraph(xticks, yticks, data) {
      this.xticks = xticks;
      this.yticks = yticks;
      this.data = data;
      this.canvas = document.querySelector('#canvas');
      this.overlay = document.querySelector('#overlay');
      this.tooltip = document.querySelector('#tooltip');
      this.overlayctx = this.overlay.getContext('2d');
      this.context = this.canvas.getContext('2d');
      this.context.font = "11px Arial";
      this.xmin = Number.POSITIVE_INFINITY;
      this.ymin = Number.POSITIVE_INFINITY;
      this.xmax = Number.NEGATIVE_INFINITY;
      this.ymax = Number.NEGATIVE_INFINITY;
      this.ysize = Number.NEGATIVE_INFINITY;
      this.calculateDimensions();
      this.calculateYWidth();
      this.initGraph();
      this.drawX();
      this.drawY();
      this.drawData();
    }

    InteractiveGraph.prototype.calculateYWidth = function() {
      var tick, width, yvalue, _i, _ref, _results;
      _results = [];
      for (tick = _i = 0, _ref = this.yticks; 0 <= _ref ? _i <= _ref : _i >= _ref; tick = 0 <= _ref ? ++_i : --_i) {
        yvalue = this.ymax - (tick * this.ticknum);
        width = this.context.measureText(yvalue).width;
        if (width > this.ysize) {
          _results.push(this.ysize = width);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    InteractiveGraph.prototype.calculateDimensions = function() {
      var dp, i, _ref, _results;
      _ref = this.data;
      _results = [];
      for (i in _ref) {
        dp = _ref[i];
        i = parseInt(i);
        if (i < this.xmin) {
          this.xmin = i;
        }
        if (i > this.xmax) {
          this.xmax = i;
        }
        if (dp.y < this.ymin) {
          this.ymin = dp.y;
        }
        if (dp.y > this.ymax) {
          _results.push(this.ymax = dp.y);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    InteractiveGraph.prototype.drawX = function() {
      var labelText, position, tick, xpos, _i, _j, _ref, _ref1;
      this.context.save();
      this.context.beginPath();
      this.context.moveTo(this.x, this.y + this.drawheight);
      this.context.lineTo(this.x + this.drawwidth, this.y + this.drawheight);
      this.context.strokeStyle = 'black';
      this.context.stroke();
      this.context.restore();
      for (tick = _i = 0, _ref = this.xticks; 0 <= _ref ? _i <= _ref : _i >= _ref; tick = 0 <= _ref ? ++_i : --_i) {
        this.context.beginPath();
        xpos = this.x + ((tick + 1) * (this.drawwidth / this.xticks));
        this.context.moveTo(xpos, this.y + this.drawheight);
        this.context.lineTo(xpos, this.y + (this.drawheight - this.tickheight));
        this.context.stroke();
      }
      this.context.fillStyle = 'black';
      this.context.textAlign = 'right';
      this.context.textBaseline = 'middle';
      for (tick = _j = 0, _ref1 = this.xticks - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; tick = 0 <= _ref1 ? ++_j : --_j) {
        this.context.save();
        position = Math.round((tick + 1) * (this.xmax / this.xticks));
        labelText = this.data[position].x;
        this.context.translate((tick + 1) * (this.drawwidth / this.xticks) + this.x, this.y + this.drawheight + this.padding);
        this.context.fillText(labelText, 0, 0);
        this.context.restore();
      }
      this.context.save();
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.translate(this.canvas.width / 2, this.y + this.drawheight + this.fontsize + (this.padding * 2));
      this.context.font = '20px Arial';
      this.context.fillText('Datum van temperatuuropname', 0, 0);
      return this.context.restore();
    };

    InteractiveGraph.prototype.drawY = function() {
      var labelText, tick, ypos, _i, _j, _ref, _ref1;
      this.context.save();
      this.context.beginPath();
      this.context.moveTo(this.x, this.y);
      this.context.lineTo(this.x, this.y + this.drawheight);
      this.context.strokeStyle = 'black';
      this.context.stroke();
      this.context.restore();
      for (tick = _i = 0, _ref = this.yticks - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; tick = 0 <= _ref ? ++_i : --_i) {
        this.context.beginPath();
        ypos = this.y + (tick * (this.drawheight / this.yticks));
        this.context.moveTo(this.x, ypos);
        this.context.lineTo(this.x + this.ticknum, ypos);
        this.context.stroke();
      }
      this.context.fillStyle = 'black';
      this.context.textAlign = 'right';
      this.context.textBaseline = 'middle';
      for (tick = _j = 0, _ref1 = this.yticks; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; tick = 0 <= _ref1 ? ++_j : --_j) {
        this.context.save();
        labelText = Math.round(this.ymax - (tick * ((this.ymax - this.ymin) / this.yticks)));
        this.context.translate(this.x - this.padding, tick * (this.drawheight / this.yticks) + this.y);
        this.context.fillText(labelText, 0, 0);
        this.context.restore();
      }
      this.context.save();
      this.context.translate(this.padding, this.canvas.height / 2);
      this.context.rotate(-Math.PI / 2);
      this.context.textAlign = 'center';
      this.context.textBaseline = 'top';
      this.context.font = '20px Arial';
      this.context.fillText('Temperatuur (in °C)', 0, 0);
      return this.context.restore();
    };

    InteractiveGraph.prototype.drawData = function() {
      var dp, i, _ref;
      this.context.save();
      this.context.translate(this.x, this.y + this.drawheight);
      this.context.scale(1, -1);
      this.context.beginPath();
      this.context.moveTo(this.xtransform(this.data[0].x), this.ytransform(this.data[0].y));
      _ref = this.data;
      for (i in _ref) {
        dp = _ref[i];
        i = parseInt(i);
        this.context.lineTo(this.xtransform(i), this.ytransform(dp.y));
      }
      this.context.stroke();
      this.context.closePath();
      return this.context.restore();
    };

    InteractiveGraph.prototype.drawTooltip = function(x, y, value) {
      var distance;
      distance = 5;
      this.tooltip.style.left = x + distance + 'px';
      this.tooltip.style.top = y + distance + 'px';
      this.tooltip.innerHTML = value + ' &#x2103;';
      return this.tooltip.style.visibility = 'visible';
    };

    InteractiveGraph.prototype.handleMouseEvent = function(event) {
      var clientRect, datapos, relativepos, xpos, xscale, ypos;
      clearTimeout(this.timeout);
      this.tooltip.style.visibility = 'hidden';
      clientRect = this.overlay.getBoundingClientRect();
      relativepos = event.clientX - clientRect.left;
      if (relativepos < this.x || relativepos > this.x + this.drawwidth) {
        return;
      }
      xscale = this.drawwidth / (this.xmax - this.xmin);
      datapos = Math.round((relativepos - this.x) / xscale);
      ypos = this.ytransform(data[datapos].y);
      xpos = this.xtransform(datapos);
      this.overlayctx.save();
      this.overlayctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.overlayctx.translate(this.x, this.y + this.drawheight);
      this.overlayctx.scale(1, -1);
      this.overlayctx.beginPath();
      this.overlayctx.moveTo(0, ypos);
      this.overlayctx.lineTo(this.xtransform(this.xmax), ypos);
      this.overlayctx.moveTo(xpos, this.ytransform(this.ymax));
      this.overlayctx.lineTo(xpos, this.ytransform(this.ymin));
      this.overlayctx.stroke();
      this.overlayctx.closePath();
      this.overlayctx.restore();
      return this.timeout = setTimeout((function(_this) {
        return function() {
          return _this.drawTooltip(event.clientX, event.clientY, data[datapos].y);
        };
      })(this), 1000);
    };

    InteractiveGraph.prototype.initGraph = function() {
      this.ticknum = 10;
      this.fontsize = 11;
      this.titlesize = 20;
      this.padding = 5;
      this.tickheight = 10;
      this.xrange = this.xmax - this.xmin;
      this.yrange = this.ymax - this.ymin;
      this.y = this.padding * 2;
      this.x = this.ysize + this.titlesize + (this.padding * 2);
      this.drawwidth = this.canvas.width - this.x - (this.padding * 2);
      this.drawheight = this.canvas.height - this.y - (this.padding * 2) - (this.fontsize + this.titlesize);
      this.xtransform = this.createTransform([this.xmin, this.xmax], [0, this.drawwidth]);
      this.ytransform = this.createTransform([this.ymin, this.ymax], [0, this.drawheight]);
      return this.overlay.addEventListener("mousemove", (function(_this) {
        return function(e) {
          return _this.handleMouseEvent(e);
        };
      })(this));
    };

    return InteractiveGraph;

  })();

  xlabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  data = [
    {
      'y': 9,
      'x': '2014/01/01'
    }, {
      'y': 10,
      'x': '2014/01/02'
    }, {
      'y': 12,
      'x': '2014/01/03'
    }, {
      'y': 9,
      'x': '2014/01/04'
    }, {
      'y': 8,
      'x': '2014/01/05'
    }, {
      'y': 14,
      'x': '2014/01/06'
    }, {
      'y': 12,
      'x': '2014/01/07'
    }, {
      'y': 10,
      'x': '2014/01/08'
    }, {
      'y': 12,
      'x': '2014/01/09'
    }, {
      'y': 8,
      'x': '2014/01/10'
    }, {
      'y': 7,
      'x': '2014/01/11'
    }, {
      'y': 6,
      'x': '2014/01/12'
    }, {
      'y': 9,
      'x': '2014/01/13'
    }, {
      'y': 7,
      'x': '2014/01/14'
    }, {
      'y': 6,
      'x': '2014/01/15'
    }, {
      'y': 8,
      'x': '2014/01/16'
    }, {
      'y': 9,
      'x': '2014/01/17'
    }, {
      'y': 8,
      'x': '2014/01/18'
    }, {
      'y': 7,
      'x': '2014/01/19'
    }, {
      'y': 6,
      'x': '2014/01/20'
    }, {
      'y': 5,
      'x': '2014/01/21'
    }, {
      'y': 4,
      'x': '2014/01/22'
    }, {
      'y': 5,
      'x': '2014/01/23'
    }, {
      'y': 6,
      'x': '2014/01/24'
    }, {
      'y': 6,
      'x': '2014/01/25'
    }, {
      'y': 6,
      'x': '2014/01/26'
    }, {
      'y': 6,
      'x': '2014/01/27'
    }, {
      'y': 6,
      'x': '2014/01/28'
    }, {
      'y': 2,
      'x': '2014/01/29'
    }, {
      'y': 5,
      'x': '2014/01/30'
    }, {
      'y': 7,
      'x': '2014/01/31'
    }, {
      'y': 8,
      'x': '2014/02/01'
    }, {
      'y': 8,
      'x': '2014/02/02'
    }, {
      'y': 8,
      'x': '2014/02/03'
    }, {
      'y': 9,
      'x': '2014/02/04'
    }, {
      'y': 10,
      'x': '2014/02/05'
    }, {
      'y': 9,
      'x': '2014/02/06'
    }, {
      'y': 10,
      'x': '2014/02/07'
    }, {
      'y': 9,
      'x': '2014/02/08'
    }, {
      'y': 7,
      'x': '2014/02/09'
    }, {
      'y': 9,
      'x': '2014/02/10'
    }, {
      'y': 8,
      'x': '2014/02/11'
    }, {
      'y': 9,
      'x': '2014/02/12'
    }, {
      'y': 6,
      'x': '2014/02/13'
    }, {
      'y': 8,
      'x': '2014/02/14'
    }, {
      'y': 13,
      'x': '2014/02/15'
    }, {
      'y': 9,
      'x': '2014/02/16'
    }, {
      'y': 10,
      'x': '2014/02/17'
    }, {
      'y': 8,
      'x': '2014/02/18'
    }, {
      'y': 11,
      'x': '2014/02/19'
    }, {
      'y': 10,
      'x': '2014/02/20'
    }, {
      'y': 10,
      'x': '2014/02/21'
    }, {
      'y': 10,
      'x': '2014/02/22'
    }, {
      'y': 11,
      'x': '2014/02/23'
    }, {
      'y': 12,
      'x': '2014/02/24'
    }, {
      'y': 12,
      'x': '2014/02/25'
    }, {
      'y': 11,
      'x': '2014/02/26'
    }, {
      'y': 7,
      'x': '2014/02/27'
    }, {
      'y': 8,
      'x': '2014/02/28'
    }, {
      'y': 8,
      'x': '2014/03/01'
    }, {
      'y': 9,
      'x': '2014/03/02'
    }, {
      'y': 9,
      'x': '2014/03/03'
    }, {
      'y': 10,
      'x': '2014/03/04'
    }, {
      'y': 12,
      'x': '2014/03/05'
    }, {
      'y': 13,
      'x': '2014/03/06'
    }, {
      'y': 12,
      'x': '2014/03/07'
    }, {
      'y': 16,
      'x': '2014/03/08'
    }, {
      'y': 19,
      'x': '2014/03/09'
    }, {
      'y': 18,
      'x': '2014/03/10'
    }, {
      'y': 14,
      'x': '2014/03/11'
    }, {
      'y': 16,
      'x': '2014/03/12'
    }, {
      'y': 16,
      'x': '2014/03/13'
    }, {
      'y': 12,
      'x': '2014/03/14'
    }, {
      'y': 11,
      'x': '2014/03/15'
    }, {
      'y': 12,
      'x': '2014/03/16'
    }, {
      'y': 12,
      'x': '2014/03/17'
    }, {
      'y': 10,
      'x': '2014/03/18'
    }, {
      'y': 15,
      'x': '2014/03/19'
    }, {
      'y': 21,
      'x': '2014/03/20'
    }, {
      'y': 11,
      'x': '2014/03/21'
    }, {
      'y': 10,
      'x': '2014/03/22'
    }, {
      'y': 9,
      'x': '2014/03/23'
    }, {
      'y': 10,
      'x': '2014/03/24'
    }, {
      'y': 10,
      'x': '2014/03/25'
    }, {
      'y': 9,
      'x': '2014/03/26'
    }, {
      'y': 13,
      'x': '2014/03/27'
    }, {
      'y': 17,
      'x': '2014/03/28'
    }, {
      'y': 19,
      'x': '2014/03/29'
    }, {
      'y': 20,
      'x': '2014/03/30'
    }, {
      'y': 20,
      'x': '2014/03/31'
    }, {
      'y': 20,
      'x': '2014/04/01'
    }, {
      'y': 21,
      'x': '2014/04/02'
    }, {
      'y': 22,
      'x': '2014/04/03'
    }, {
      'y': 15,
      'x': '2014/04/04'
    }, {
      'y': 17,
      'x': '2014/04/05'
    }, {
      'y': 17,
      'x': '2014/04/06'
    }, {
      'y': 21,
      'x': '2014/04/07'
    }, {
      'y': 13,
      'x': '2014/04/08'
    }, {
      'y': 14,
      'x': '2014/04/09'
    }, {
      'y': 15,
      'x': '2014/04/10'
    }, {
      'y': 15,
      'x': '2014/04/11'
    }, {
      'y': 15,
      'x': '2014/04/12'
    }, {
      'y': 13,
      'x': '2014/04/13'
    }, {
      'y': 11,
      'x': '2014/04/14'
    }, {
      'y': 10,
      'x': '2014/04/15'
    }, {
      'y': 14,
      'x': '2014/04/16'
    }, {
      'y': 17,
      'x': '2014/04/17'
    }, {
      'y': 12,
      'x': '2014/04/18'
    }, {
      'y': 16,
      'x': '2014/04/19'
    }, {
      'y': 20,
      'x': '2014/04/20'
    }, {
      'y': 15,
      'x': '2014/04/21'
    }, {
      'y': 19,
      'x': '2014/04/22'
    }, {
      'y': 21,
      'x': '2014/04/23'
    }, {
      'y': 20,
      'x': '2014/04/24'
    }, {
      'y': 23,
      'x': '2014/04/25'
    }, {
      'y': 17,
      'x': '2014/04/26'
    }, {
      'y': 15,
      'x': '2014/04/27'
    }, {
      'y': 16,
      'x': '2014/04/28'
    }, {
      'y': 17,
      'x': '2014/04/29'
    }, {
      'y': 17,
      'x': '2014/04/30'
    }, {
      'y': 18,
      'x': '2014/05/01'
    }, {
      'y': 12,
      'x': '2014/05/02'
    }, {
      'y': 13,
      'x': '2014/05/03'
    }, {
      'y': 13,
      'x': '2014/05/04'
    }, {
      'y': 18,
      'x': '2014/05/05'
    }, {
      'y': 17,
      'x': '2014/05/06'
    }, {
      'y': 16,
      'x': '2014/05/07'
    }, {
      'y': 13,
      'x': '2014/05/08'
    }, {
      'y': 16,
      'x': '2014/05/09'
    }, {
      'y': 15,
      'x': '2014/05/10'
    }, {
      'y': 11,
      'x': '2014/05/11'
    }, {
      'y': 14,
      'x': '2014/05/12'
    }, {
      'y': 15,
      'x': '2014/05/13'
    }, {
      'y': 13,
      'x': '2014/05/14'
    }, {
      'y': 15,
      'x': '2014/05/15'
    }, {
      'y': 18,
      'x': '2014/05/16'
    }, {
      'y': 20,
      'x': '2014/05/17'
    }, {
      'y': 23,
      'x': '2014/05/18'
    }, {
      'y': 24,
      'x': '2014/05/19'
    }, {
      'y': 27,
      'x': '2014/05/20'
    }, {
      'y': 21,
      'x': '2014/05/21'
    }, {
      'y': 23,
      'x': '2014/05/22'
    }, {
      'y': 20,
      'x': '2014/05/23'
    }, {
      'y': 19,
      'x': '2014/05/24'
    }, {
      'y': 21,
      'x': '2014/05/25'
    }, {
      'y': 22,
      'x': '2014/05/26'
    }, {
      'y': 17,
      'x': '2014/05/27'
    }, {
      'y': 14,
      'x': '2014/05/28'
    }, {
      'y': 11,
      'x': '2014/05/29'
    }, {
      'y': 16,
      'x': '2014/05/30'
    }, {
      'y': 19,
      'x': '2014/05/31'
    }, {
      'y': 18,
      'x': '2014/06/01'
    }, {
      'y': 20,
      'x': '2014/06/02'
    }, {
      'y': 21,
      'x': '2014/06/03'
    }, {
      'y': 17,
      'x': '2014/06/04'
    }, {
      'y': 17,
      'x': '2014/06/05'
    }, {
      'y': 22,
      'x': '2014/06/06'
    }, {
      'y': 27,
      'x': '2014/06/07'
    }, {
      'y': 24,
      'x': '2014/06/08'
    }, {
      'y': 27,
      'x': '2014/06/09'
    }, {
      'y': 25,
      'x': '2014/06/10'
    }, {
      'y': 21,
      'x': '2014/06/11'
    }, {
      'y': 22,
      'x': '2014/06/12'
    }, {
      'y': 22,
      'x': '2014/06/13'
    }, {
      'y': 18,
      'x': '2014/06/14'
    }, {
      'y': 20,
      'x': '2014/06/15'
    }, {
      'y': 17,
      'x': '2014/06/16'
    }, {
      'y': 19,
      'x': '2014/06/17'
    }, {
      'y': 20,
      'x': '2014/06/18'
    }, {
      'y': 16,
      'x': '2014/06/19'
    }, {
      'y': 18,
      'x': '2014/06/20'
    }, {
      'y': 20,
      'x': '2014/06/21'
    }, {
      'y': 20,
      'x': '2014/06/22'
    }, {
      'y': 21,
      'x': '2014/06/23'
    }, {
      'y': 21,
      'x': '2014/06/24'
    }, {
      'y': 19,
      'x': '2014/06/25'
    }, {
      'y': 22,
      'x': '2014/06/26'
    }, {
      'y': 21,
      'x': '2014/06/27'
    }, {
      'y': 21,
      'x': '2014/06/28'
    }, {
      'y': 19,
      'x': '2014/06/29'
    }, {
      'y': 18,
      'x': '2014/06/30'
    }, {
      'y': 19,
      'x': '2014/07/01'
    }, {
      'y': 20,
      'x': '2014/07/02'
    }, {
      'y': 26,
      'x': '2014/07/03'
    }, {
      'y': 28,
      'x': '2014/07/04'
    }, {
      'y': 22,
      'x': '2014/07/05'
    }, {
      'y': 24,
      'x': '2014/07/06'
    }, {
      'y': 23,
      'x': '2014/07/07'
    }, {
      'y': 17,
      'x': '2014/07/08'
    }, {
      'y': 17,
      'x': '2014/07/09'
    }, {
      'y': 27,
      'x': '2014/07/10'
    }, {
      'y': 23,
      'x': '2014/07/11'
    }, {
      'y': 24,
      'x': '2014/07/12'
    }, {
      'y': 23,
      'x': '2014/07/13'
    }, {
      'y': 22,
      'x': '2014/07/14'
    }, {
      'y': 22,
      'x': '2014/07/15'
    }, {
      'y': 25,
      'x': '2014/07/16'
    }, {
      'y': 28,
      'x': '2014/07/17'
    }, {
      'y': 31,
      'x': '2014/07/18'
    }, {
      'y': 32,
      'x': '2014/07/19'
    }, {
      'y': 27,
      'x': '2014/07/20'
    }, {
      'y': 21,
      'x': '2014/07/21'
    }, {
      'y': 27,
      'x': '2014/07/22'
    }, {
      'y': 28,
      'x': '2014/07/23'
    }, {
      'y': 26,
      'x': '2014/07/24'
    }, {
      'y': 22,
      'x': '2014/07/25'
    }, {
      'y': 25,
      'x': '2014/07/26'
    }, {
      'y': 26,
      'x': '2014/07/27'
    }, {
      'y': 23,
      'x': '2014/07/28'
    }, {
      'y': 25,
      'x': '2014/07/29'
    }, {
      'y': 23,
      'x': '2014/07/30'
    }, {
      'y': 24,
      'x': '2014/07/31'
    }, {
      'y': 25,
      'x': '2014/08/01'
    }, {
      'y': 27,
      'x': '2014/08/02'
    }, {
      'y': 25,
      'x': '2014/08/03'
    }, {
      'y': 23,
      'x': '2014/08/04'
    }, {
      'y': 24,
      'x': '2014/08/05'
    }, {
      'y': 21,
      'x': '2014/08/06'
    }, {
      'y': 23,
      'x': '2014/08/07'
    }, {
      'y': 22,
      'x': '2014/08/08'
    }, {
      'y': 23,
      'x': '2014/08/09'
    }, {
      'y': 22,
      'x': '2014/08/10'
    }, {
      'y': 20,
      'x': '2014/08/11'
    }, {
      'y': 20,
      'x': '2014/08/12'
    }, {
      'y': 21,
      'x': '2014/08/13'
    }, {
      'y': 20,
      'x': '2014/08/14'
    }, {
      'y': 19,
      'x': '2014/08/15'
    }, {
      'y': 18,
      'x': '2014/08/16'
    }, {
      'y': 16,
      'x': '2014/08/17'
    }, {
      'y': 17,
      'x': '2014/08/18'
    }, {
      'y': 15,
      'x': '2014/08/19'
    }, {
      'y': 17,
      'x': '2014/08/20'
    }, {
      'y': 18,
      'x': '2014/08/21'
    }, {
      'y': 17,
      'x': '2014/08/22'
    }, {
      'y': 17,
      'x': '2014/08/23'
    }, {
      'y': 17,
      'x': '2014/08/24'
    }, {
      'y': 16,
      'x': '2014/08/25'
    }, {
      'y': 16,
      'x': '2014/08/26'
    }, {
      'y': 20,
      'x': '2014/08/27'
    }, {
      'y': 21,
      'x': '2014/08/28'
    }, {
      'y': 21,
      'x': '2014/08/29'
    }, {
      'y': 18,
      'x': '2014/08/30'
    }, {
      'y': 19,
      'x': '2014/08/31'
    }, {
      'y': 21,
      'x': '2014/09/01'
    }, {
      'y': 21,
      'x': '2014/09/02'
    }, {
      'y': 21,
      'x': '2014/09/03'
    }, {
      'y': 23,
      'x': '2014/09/04'
    }, {
      'y': 22,
      'x': '2014/09/05'
    }, {
      'y': 20,
      'x': '2014/09/06'
    }, {
      'y': 21,
      'x': '2014/09/07'
    }, {
      'y': 20,
      'x': '2014/09/08'
    }, {
      'y': 17,
      'x': '2014/09/09'
    }, {
      'y': 18,
      'x': '2014/09/10'
    }, {
      'y': 20,
      'x': '2014/09/11'
    }, {
      'y': 21,
      'x': '2014/09/12'
    }, {
      'y': 21,
      'x': '2014/09/13'
    }, {
      'y': 20,
      'x': '2014/09/14'
    }, {
      'y': 22,
      'x': '2014/09/15'
    }, {
      'y': 24,
      'x': '2014/09/16'
    }, {
      'y': 25,
      'x': '2014/09/17'
    }, {
      'y': 25,
      'x': '2014/09/18'
    }, {
      'y': 24,
      'x': '2014/09/19'
    }, {
      'y': 24,
      'x': '2014/09/20'
    }, {
      'y': 19,
      'x': '2014/09/21'
    }, {
      'y': 17,
      'x': '2014/09/22'
    }, {
      'y': 17,
      'x': '2014/09/23'
    }, {
      'y': 16,
      'x': '2014/09/24'
    }, {
      'y': 17,
      'x': '2014/09/25'
    }, {
      'y': 19,
      'x': '2014/09/26'
    }, {
      'y': 20,
      'x': '2014/09/27'
    }, {
      'y': 22,
      'x': '2014/09/28'
    }, {
      'y': 19,
      'x': '2014/09/29'
    }, {
      'y': 20,
      'x': '2014/09/30'
    }, {
      'y': 20,
      'x': '2014/10/01'
    }, {
      'y': 19,
      'x': '2014/10/02'
    }, {
      'y': 22,
      'x': '2014/10/03'
    }, {
      'y': 21,
      'x': '2014/10/04'
    }, {
      'y': 15,
      'x': '2014/10/05'
    }, {
      'y': 16,
      'x': '2014/10/06'
    }, {
      'y': 15,
      'x': '2014/10/07'
    }, {
      'y': 16,
      'x': '2014/10/08'
    }, {
      'y': 18,
      'x': '2014/10/09'
    }, {
      'y': 17,
      'x': '2014/10/10'
    }, {
      'y': 15,
      'x': '2014/10/11'
    }, {
      'y': 16,
      'x': '2014/10/12'
    }, {
      'y': 18,
      'x': '2014/10/13'
    }, {
      'y': 13,
      'x': '2014/10/14'
    }, {
      'y': 18,
      'x': '2014/10/15'
    }, {
      'y': 18,
      'x': '2014/10/16'
    }, {
      'y': 18,
      'x': '2014/10/17'
    }, {
      'y': 23,
      'x': '2014/10/18'
    }, {
      'y': 21,
      'x': '2014/10/19'
    }, {
      'y': 17,
      'x': '2014/10/20'
    }, {
      'y': 14,
      'x': '2014/10/21'
    }, {
      'y': 13,
      'x': '2014/10/22'
    }, {
      'y': 15,
      'x': '2014/10/23'
    }, {
      'y': 12,
      'x': '2014/10/24'
    }, {
      'y': 15,
      'x': '2014/10/25'
    }, {
      'y': 15,
      'x': '2014/10/26'
    }, {
      'y': 17,
      'x': '2014/10/27'
    }, {
      'y': 14,
      'x': '2014/10/28'
    }, {
      'y': 12,
      'x': '2014/10/29'
    }, {
      'y': 15,
      'x': '2014/10/30'
    }, {
      'y': 16,
      'x': '2014/10/31'
    }, {
      'y': 18,
      'x': '2014/11/01'
    }, {
      'y': 17,
      'x': '2014/11/02'
    }, {
      'y': 15,
      'x': '2014/11/03'
    }, {
      'y': 10,
      'x': '2014/11/04'
    }, {
      'y': 9,
      'x': '2014/11/05'
    }, {
      'y': 8,
      'x': '2014/11/06'
    }, {
      'y': 9,
      'x': '2014/11/07'
    }, {
      'y': 12,
      'x': '2014/11/08'
    }, {
      'y': 12,
      'x': '2014/11/09'
    }, {
      'y': 12,
      'x': '2014/11/10'
    }, {
      'y': 12,
      'x': '2014/11/11'
    }, {
      'y': 12,
      'x': '2014/11/12'
    }, {
      'y': 13,
      'x': '2014/11/13'
    }, {
      'y': 12,
      'x': '2014/11/14'
    }, {
      'y': 11,
      'x': '2014/11/15'
    }, {
      'y': 9,
      'x': '2014/11/16'
    }, {
      'y': 12,
      'x': '2014/11/17'
    }, {
      'y': 8,
      'x': '2014/11/18'
    }, {
      'y': 9,
      'x': '2014/11/19'
    }, {
      'y': 8,
      'x': '2014/11/20'
    }, {
      'y': 9,
      'x': '2014/11/21'
    }, {
      'y': 11,
      'x': '2014/11/22'
    }, {
      'y': 13,
      'x': '2014/11/23'
    }, {
      'y': 11,
      'x': '2014/11/24'
    }, {
      'y': 9,
      'x': '2014/11/25'
    }, {
      'y': 6,
      'x': '2014/11/26'
    }, {
      'y': 8,
      'x': '2014/11/27'
    }, {
      'y': 9,
      'x': '2014/11/28'
    }, {
      'y': 4,
      'x': '2014/11/29'
    }, {
      'y': 3,
      'x': '2014/11/30'
    }, {
      'y': 2,
      'x': '2014/12/01'
    }, {
      'y': 1,
      'x': '2014/12/02'
    }, {
      'y': 1,
      'x': '2014/12/03'
    }, {
      'y': 1,
      'x': '2014/12/04'
    }, {
      'y': 5,
      'x': '2014/12/05'
    }, {
      'y': 9,
      'x': '2014/12/06'
    }, {
      'y': 6,
      'x': '2014/12/07'
    }, {
      'y': 4,
      'x': '2014/12/08'
    }, {
      'y': 4,
      'x': '2014/12/09'
    }, {
      'y': 9,
      'x': '2014/12/10'
    }, {
      'y': 7,
      'x': '2014/12/11'
    }, {
      'y': 9,
      'x': '2014/12/12'
    }, {
      'y': 6,
      'x': '2014/12/13'
    }, {
      'y': 4,
      'x': '2014/12/14'
    }, {
      'y': 7,
      'x': '2014/12/15'
    }, {
      'y': 7,
      'x': '2014/12/16'
    }, {
      'y': 10,
      'x': '2014/12/17'
    }, {
      'y': 12,
      'x': '2014/12/18'
    }, {
      'y': 12,
      'x': '2014/12/19'
    }, {
      'y': 9,
      'x': '2014/12/20'
    }, {
      'y': 10,
      'x': '2014/12/21'
    }, {
      'y': 12,
      'x': '2014/12/22'
    }, {
      'y': 12,
      'x': '2014/12/23'
    }, {
      'y': 10,
      'x': '2014/12/24'
    }, {
      'y': 7,
      'x': '2014/12/25'
    }, {
      'y': 5,
      'x': '2014/12/26'
    }, {
      'y': 2,
      'x': '2014/12/27'
    }, {
      'y': 3,
      'x': '2014/12/28'
    }, {
      'y': 5,
      'x': '2014/12/29'
    }, {
      'y': 6,
      'x': '2014/12/30'
    }, {
      'y': 7,
      'x': '2014/12/31'
    }
  ];

  lineGraph = new InteractiveGraph(12, 4, data);

}).call(this);
