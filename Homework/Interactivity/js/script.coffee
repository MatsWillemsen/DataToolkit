class InteractiveGraph
  # De klasse om een interactieve grafiek te kunnen maken (die zich aanpast aan de context)


  # Allereerst de create-transform functie namaken
  createTransform: (domain, range) ->
    alpha = (range[1] - range[0]) / (domain[1] - domain[0])
    beta = range[0] - (alpha * domain[0])
    return (x) ->
      alpha * x + beta

  #Begin-instellingen, om de contexten en canvassen te kunnen pakken, aantal tikken op x-as, en y-as kunnen worden meegegeven
  constructor: (@xticks, @yticks, @data) ->
    @canvas = document.querySelector '#canvas'
    @overlay = document.querySelector '#overlay'
    @tooltip = document.querySelector '#tooltip'
    @overlayctx = @overlay.getContext '2d'
    @context = @canvas.getContext '2d'
    @context.font = "11px Arial"
    @xmin = Number.POSITIVE_INFINITY
    @ymin = Number.POSITIVE_INFINITY
    @xmax = Number.NEGATIVE_INFINITY
    @ymax = Number.NEGATIVE_INFINITY
    @ysize = Number.NEGATIVE_INFINITY
    # Eerst kijken wat de min/max waardes zijn van de data die is gegeven (op basis hiervan alles berekenen)
    @calculateDimensions()
    # Dan kijken hoe breed de tekst van de temperatuur op de Y-as is, op basis daarvan de x-as beginnen (hierdoor zijn temperaturen van 1000 graden mogelijk)
    @calculateYWidth()
    # Daadwerkelijk de grafiek initialiseren
    @initGraph()
    # X-as maken, inclusief naam van de as
    @drawX()
    # Y-as maken
    @drawY()
    # grafiek kleuren
    @drawData()

  calculateYWidth: ->
    for tick in [0..@yticks]
      yvalue = @ymax - (tick * @ticknum)
      # maximale breedte berekenen. Als deze hoger is, neem dan die breedte
      width = @context.measureText(yvalue).width
      if width > @ysize
        @ysize = width

  #loop door de gehele data heen, en kijk de maximale waardes
  calculateDimensions: ->
    for i, dp of @data
      i = parseInt i
      if i < @xmin
        @xmin = i
      if i > @xmax
        @xmax = i
      if dp.y < @ymin
        @ymin = dp.y
      if dp.y > @ymax
        @ymax = dp.y


  drawX: ->
    @context.save()
    @context.beginPath()
    # De horizontale lijn van de X-as maken
    @context.moveTo @x, @y + @drawheight
    @context.lineTo @x + @drawwidth, @y + @drawheight
    @context.strokeStyle = 'black'
    @context.stroke()
    @context.restore()
    # De kleine 'tick'-lijntjes van de x-as maken
    for tick in [0..@xticks]
      @context.beginPath()
      xpos = @x + ((tick + 1) * (@drawwidth / @xticks))
      @context.moveTo xpos, @y + @drawheight
      @context.lineTo xpos, @y + (@drawheight - @tickheight)
      @context.stroke()

    # Daadwerkelijk de data van de x-as erneer zetten
    @context.fillStyle = 'black'
    @context.textAlign = 'right'
    @context.textBaseline = 'middle'

    for tick in [0..@xticks - 1]
      @context.save()
      position = Math.round((tick + 1) * (@xmax / @xticks))
      labelText = @data[position].x
      @context.translate((tick + 1) * (@drawwidth / @xticks) + @x, @y + @drawheight + @padding)
      @context.fillText(labelText, 0,0)
      @context.restore()

    @context.save()
    @context.textAlign = 'center'
    @context.textBaseline = 'middle'

    # Titel van de as neerzetten (en deze in de grafiek laten passen)
    @context.translate(@canvas.width / 2, @y + @drawheight + @fontsize + (@padding * 2))
    @context.font = '20px Arial'
    @context.fillText('Datum van temperatuuropname',0,0)
    @context.restore()


  drawY: ->
    @context.save()
    @context.beginPath()

    # Vertikal Y-as lijn maken
    @context.moveTo @x, @y
    @context.lineTo @x, @y + @drawheight
    @context.strokeStyle = 'black'
    @context.stroke()
    @context.restore()

    # Kleine 'ticks' van Y-as maken
    for tick in [0..@yticks - 1]
      @context.beginPath()
      ypos = @y + (tick * (@drawheight / @yticks))
      @context.moveTo @x, ypos
      @context.lineTo @x + @ticknum, ypos
      @context.stroke()

    @context.fillStyle = 'black'
    @context.textAlign = 'right'
    @context.textBaseline = 'middle'

    # Ervoor gekozen om de temperatuur naar het minimum te laten gaan (en niet naar 0), vandaar deze berekeningen
    for tick in [0..@yticks]
      @context.save()
      labelText = Math.round(@ymax - (tick * ((@ymax - @ymin) / @yticks)))
      @context.translate(@x - @padding, tick * (@drawheight / @yticks) + @y)
      @context.fillText(labelText, 0,0)
      @context.restore()

    @context.save()
    @context.translate(@padding, @canvas.height / 2)
    # Tekst 90 graden naar links draaien
    @context.rotate(-Math.PI/2)
    @context.textAlign = 'center'
    @context.textBaseline = 'top'
    @context.font = '20px Arial'
    @context.fillText('Temperatuur (in °C)',0,0)
    @context.restore()


  # Daadwerkelijk de data neerzetten
  drawData: ->
    @context.save()
    @context.translate(@x, @y + @drawheight)
    @context.scale(1, -1)
    @context.beginPath()
    # de transform-functies maken het hier makkelijk om de grafiek te tekenen
    @context.moveTo(@xtransform(@data[0].x), @ytransform(@data[0].y))
    for i, dp of @data
      i = parseInt i
      @context.lineTo @xtransform(i), @ytransform(dp.y)

    @context.stroke()
    @context.closePath()
    @context.restore()

  drawTooltip: (x, y, value) ->
    distance = 5
    @tooltip.style.left = x + distance + 'px'
    @tooltip.style.top = y + distance + 'px'
    # &#x2103 is het graden celcius tekentje
    @tooltip.innerHTML = value + ' &#x2103;'
    @tooltip.style.visibility = 'visible'

  handleMouseEvent: (event) ->
    # als de muis is bewogen, haal de huidige timeout weg (voorkomt overlap)
    clearTimeout @timeout
    @tooltip.style.visibility = 'hidden'
    clientRect = @overlay.getBoundingClientRect()
    relativepos = event.clientX - clientRect.left
    # zorg dat de muis niet Out Of Bounds kan gaan
    if relativepos < @x or relativepos > @x + @drawwidth
      return

    #andersom-berekening van de createTransform
    xscale = @drawwidth / (@xmax - @xmin)
    datapos = Math.round(((relativepos - @x) / xscale))
    ypos = @ytransform data[datapos].y
    xpos = @xtransform datapos

    @overlayctx.save()
    # eerdere grid-lijnen verwijderen
    @overlayctx.clearRect(0,0, @canvas.width, @canvas.height)

    @overlayctx.translate(@x, @y + @drawheight)
    @overlayctx.scale(1, -1)
    @overlayctx.beginPath()
    # de horizontale grid-lijn maken
    @overlayctx.moveTo 0, ypos
    @overlayctx.lineTo (@xtransform @xmax), ypos
    # vertikale gridlijn
    @overlayctx.moveTo xpos, @ytransform @ymax
    @overlayctx.lineTo xpos, @ytransform @ymin
    @overlayctx.stroke()
    @overlayctx.closePath()
    @overlayctx.restore()
    # na 1 seconde de tooltip laten zien
    @timeout = setTimeout =>
      @drawTooltip event.clientX, event.clientY, data[datapos].y
    , 1000

  #Wat constanten initialiseren
  initGraph: () ->
    @ticknum = 10
    @fontsize = 11
    @titlesize = 20
    @padding = 5
    @tickheight = 10
    @xrange = @xmax - @xmin
    @yrange = @ymax - @ymin
    @y = @padding * 2
    @x = @ysize + @titlesize +  (@padding * 2)
    @drawwidth = @canvas.width - @x - (@padding * 2)
    @drawheight = @canvas.height - @y - (@padding * 2) - (@fontsize + @titlesize)
    @xtransform = @createTransform([@xmin, @xmax], [0, @drawwidth])
    @ytransform = @createTransform([@ymin, @ymax], [0, @drawheight])
    @overlay.addEventListener "mousemove", (e)  => @handleMouseEvent e

xlabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
data = [{'y': 9, 'x': '2014/01/01'}, {'y': 10, 'x': '2014/01/02'}, {'y': 12, 'x': '2014/01/03'}, {'y': 9, 'x': '2014/01/04'}, {'y': 8, 'x': '2014/01/05'}, {'y': 14, 'x': '2014/01/06'}, {'y': 12, 'x': '2014/01/07'}, {'y': 10, 'x': '2014/01/08'}, {'y': 12, 'x': '2014/01/09'}, {'y': 8, 'x': '2014/01/10'}, {'y': 7, 'x': '2014/01/11'}, {'y': 6, 'x': '2014/01/12'}, {'y': 9, 'x': '2014/01/13'}, {'y': 7, 'x': '2014/01/14'}, {'y': 6, 'x': '2014/01/15'}, {'y': 8, 'x': '2014/01/16'}, {'y': 9, 'x': '2014/01/17'}, {'y': 8, 'x': '2014/01/18'}, {'y': 7, 'x': '2014/01/19'}, {'y': 6, 'x': '2014/01/20'}, {'y': 5, 'x': '2014/01/21'}, {'y': 4, 'x': '2014/01/22'}, {'y': 5, 'x': '2014/01/23'}, {'y': 6, 'x': '2014/01/24'}, {'y': 6, 'x': '2014/01/25'}, {'y': 6, 'x': '2014/01/26'}, {'y': 6, 'x': '2014/01/27'}, {'y': 6, 'x': '2014/01/28'}, {'y': 2, 'x': '2014/01/29'}, {'y': 5, 'x': '2014/01/30'}, {'y': 7, 'x': '2014/01/31'}, {'y': 8, 'x': '2014/02/01'}, {'y': 8, 'x': '2014/02/02'}, {'y': 8, 'x': '2014/02/03'}, {'y': 9, 'x': '2014/02/04'}, {'y': 10, 'x': '2014/02/05'}, {'y': 9, 'x': '2014/02/06'}, {'y': 10, 'x': '2014/02/07'}, {'y': 9, 'x': '2014/02/08'}, {'y': 7, 'x': '2014/02/09'}, {'y': 9, 'x': '2014/02/10'}, {'y': 8, 'x': '2014/02/11'}, {'y': 9, 'x': '2014/02/12'}, {'y': 6, 'x': '2014/02/13'}, {'y': 8, 'x': '2014/02/14'}, {'y': 13, 'x': '2014/02/15'}, {'y': 9, 'x': '2014/02/16'}, {'y': 10, 'x': '2014/02/17'}, {'y': 8, 'x': '2014/02/18'}, {'y': 11, 'x': '2014/02/19'}, {'y': 10, 'x': '2014/02/20'}, {'y': 10, 'x': '2014/02/21'}, {'y': 10, 'x': '2014/02/22'}, {'y': 11, 'x': '2014/02/23'}, {'y': 12, 'x': '2014/02/24'}, {'y': 12, 'x': '2014/02/25'}, {'y': 11, 'x': '2014/02/26'}, {'y': 7, 'x': '2014/02/27'}, {'y': 8, 'x': '2014/02/28'}, {'y': 8, 'x': '2014/03/01'}, {'y': 9, 'x': '2014/03/02'}, {'y': 9, 'x': '2014/03/03'}, {'y': 10, 'x': '2014/03/04'}, {'y': 12, 'x': '2014/03/05'}, {'y': 13, 'x': '2014/03/06'}, {'y': 12, 'x': '2014/03/07'}, {'y': 16, 'x': '2014/03/08'}, {'y': 19, 'x': '2014/03/09'}, {'y': 18, 'x': '2014/03/10'}, {'y': 14, 'x': '2014/03/11'}, {'y': 16, 'x': '2014/03/12'}, {'y': 16, 'x': '2014/03/13'}, {'y': 12, 'x': '2014/03/14'}, {'y': 11, 'x': '2014/03/15'}, {'y': 12, 'x': '2014/03/16'}, {'y': 12, 'x': '2014/03/17'}, {'y': 10, 'x': '2014/03/18'}, {'y': 15, 'x': '2014/03/19'}, {'y': 21, 'x': '2014/03/20'}, {'y': 11, 'x': '2014/03/21'}, {'y': 10, 'x': '2014/03/22'}, {'y': 9, 'x': '2014/03/23'}, {'y': 10, 'x': '2014/03/24'}, {'y': 10, 'x': '2014/03/25'}, {'y': 9, 'x': '2014/03/26'}, {'y': 13, 'x': '2014/03/27'}, {'y': 17, 'x': '2014/03/28'}, {'y': 19, 'x': '2014/03/29'}, {'y': 20, 'x': '2014/03/30'}, {'y': 20, 'x': '2014/03/31'}, {'y': 20, 'x': '2014/04/01'}, {'y': 21, 'x': '2014/04/02'}, {'y': 22, 'x': '2014/04/03'}, {'y': 15, 'x': '2014/04/04'}, {'y': 17, 'x': '2014/04/05'}, {'y': 17, 'x': '2014/04/06'}, {'y': 21, 'x': '2014/04/07'}, {'y': 13, 'x': '2014/04/08'}, {'y': 14, 'x': '2014/04/09'}, {'y': 15, 'x': '2014/04/10'}, {'y': 15, 'x': '2014/04/11'}, {'y': 15, 'x': '2014/04/12'}, {'y': 13, 'x': '2014/04/13'}, {'y': 11, 'x': '2014/04/14'}, {'y': 10, 'x': '2014/04/15'}, {'y': 14, 'x': '2014/04/16'}, {'y': 17, 'x': '2014/04/17'}, {'y': 12, 'x': '2014/04/18'}, {'y': 16, 'x': '2014/04/19'}, {'y': 20, 'x': '2014/04/20'}, {'y': 15, 'x': '2014/04/21'}, {'y': 19, 'x': '2014/04/22'}, {'y': 21, 'x': '2014/04/23'}, {'y': 20, 'x': '2014/04/24'}, {'y': 23, 'x': '2014/04/25'}, {'y': 17, 'x': '2014/04/26'}, {'y': 15, 'x': '2014/04/27'}, {'y': 16, 'x': '2014/04/28'}, {'y': 17, 'x': '2014/04/29'}, {'y': 17, 'x': '2014/04/30'}, {'y': 18, 'x': '2014/05/01'}, {'y': 12, 'x': '2014/05/02'}, {'y': 13, 'x': '2014/05/03'}, {'y': 13, 'x': '2014/05/04'}, {'y': 18, 'x': '2014/05/05'}, {'y': 17, 'x': '2014/05/06'}, {'y': 16, 'x': '2014/05/07'}, {'y': 13, 'x': '2014/05/08'}, {'y': 16, 'x': '2014/05/09'}, {'y': 15, 'x': '2014/05/10'}, {'y': 11, 'x': '2014/05/11'}, {'y': 14, 'x': '2014/05/12'}, {'y': 15, 'x': '2014/05/13'}, {'y': 13, 'x': '2014/05/14'}, {'y': 15, 'x': '2014/05/15'}, {'y': 18, 'x': '2014/05/16'}, {'y': 20, 'x': '2014/05/17'}, {'y': 23, 'x': '2014/05/18'}, {'y': 24, 'x': '2014/05/19'}, {'y': 27, 'x': '2014/05/20'}, {'y': 21, 'x': '2014/05/21'}, {'y': 23, 'x': '2014/05/22'}, {'y': 20, 'x': '2014/05/23'}, {'y': 19, 'x': '2014/05/24'}, {'y': 21, 'x': '2014/05/25'}, {'y': 22, 'x': '2014/05/26'}, {'y': 17, 'x': '2014/05/27'}, {'y': 14, 'x': '2014/05/28'}, {'y': 11, 'x': '2014/05/29'}, {'y': 16, 'x': '2014/05/30'}, {'y': 19, 'x': '2014/05/31'}, {'y': 18, 'x': '2014/06/01'}, {'y': 20, 'x': '2014/06/02'}, {'y': 21, 'x': '2014/06/03'}, {'y': 17, 'x': '2014/06/04'}, {'y': 17, 'x': '2014/06/05'}, {'y': 22, 'x': '2014/06/06'}, {'y': 27, 'x': '2014/06/07'}, {'y': 24, 'x': '2014/06/08'}, {'y': 27, 'x': '2014/06/09'}, {'y': 25, 'x': '2014/06/10'}, {'y': 21, 'x': '2014/06/11'}, {'y': 22, 'x': '2014/06/12'}, {'y': 22, 'x': '2014/06/13'}, {'y': 18, 'x': '2014/06/14'}, {'y': 20, 'x': '2014/06/15'}, {'y': 17, 'x': '2014/06/16'}, {'y': 19, 'x': '2014/06/17'}, {'y': 20, 'x': '2014/06/18'}, {'y': 16, 'x': '2014/06/19'}, {'y': 18, 'x': '2014/06/20'}, {'y': 20, 'x': '2014/06/21'}, {'y': 20, 'x': '2014/06/22'}, {'y': 21, 'x': '2014/06/23'}, {'y': 21, 'x': '2014/06/24'}, {'y': 19, 'x': '2014/06/25'}, {'y': 22, 'x': '2014/06/26'}, {'y': 21, 'x': '2014/06/27'}, {'y': 21, 'x': '2014/06/28'}, {'y': 19, 'x': '2014/06/29'}, {'y': 18, 'x': '2014/06/30'}, {'y': 19, 'x': '2014/07/01'}, {'y': 20, 'x': '2014/07/02'}, {'y': 26, 'x': '2014/07/03'}, {'y': 28, 'x': '2014/07/04'}, {'y': 22, 'x': '2014/07/05'}, {'y': 24, 'x': '2014/07/06'}, {'y': 23, 'x': '2014/07/07'}, {'y': 17, 'x': '2014/07/08'}, {'y': 17, 'x': '2014/07/09'}, {'y': 27, 'x': '2014/07/10'}, {'y': 23, 'x': '2014/07/11'}, {'y': 24, 'x': '2014/07/12'}, {'y': 23, 'x': '2014/07/13'}, {'y': 22, 'x': '2014/07/14'}, {'y': 22, 'x': '2014/07/15'}, {'y': 25, 'x': '2014/07/16'}, {'y': 28, 'x': '2014/07/17'}, {'y': 31, 'x': '2014/07/18'}, {'y': 32, 'x': '2014/07/19'}, {'y': 27, 'x': '2014/07/20'}, {'y': 21, 'x': '2014/07/21'}, {'y': 27, 'x': '2014/07/22'}, {'y': 28, 'x': '2014/07/23'}, {'y': 26, 'x': '2014/07/24'}, {'y': 22, 'x': '2014/07/25'}, {'y': 25, 'x': '2014/07/26'}, {'y': 26, 'x': '2014/07/27'}, {'y': 23, 'x': '2014/07/28'}, {'y': 25, 'x': '2014/07/29'}, {'y': 23, 'x': '2014/07/30'}, {'y': 24, 'x': '2014/07/31'}, {'y': 25, 'x': '2014/08/01'}, {'y': 27, 'x': '2014/08/02'}, {'y': 25, 'x': '2014/08/03'}, {'y': 23, 'x': '2014/08/04'}, {'y': 24, 'x': '2014/08/05'}, {'y': 21, 'x': '2014/08/06'}, {'y': 23, 'x': '2014/08/07'}, {'y': 22, 'x': '2014/08/08'}, {'y': 23, 'x': '2014/08/09'}, {'y': 22, 'x': '2014/08/10'}, {'y': 20, 'x': '2014/08/11'}, {'y': 20, 'x': '2014/08/12'}, {'y': 21, 'x': '2014/08/13'}, {'y': 20, 'x': '2014/08/14'}, {'y': 19, 'x': '2014/08/15'}, {'y': 18, 'x': '2014/08/16'}, {'y': 16, 'x': '2014/08/17'}, {'y': 17, 'x': '2014/08/18'}, {'y': 15, 'x': '2014/08/19'}, {'y': 17, 'x': '2014/08/20'}, {'y': 18, 'x': '2014/08/21'}, {'y': 17, 'x': '2014/08/22'}, {'y': 17, 'x': '2014/08/23'}, {'y': 17, 'x': '2014/08/24'}, {'y': 16, 'x': '2014/08/25'}, {'y': 16, 'x': '2014/08/26'}, {'y': 20, 'x': '2014/08/27'}, {'y': 21, 'x': '2014/08/28'}, {'y': 21, 'x': '2014/08/29'}, {'y': 18, 'x': '2014/08/30'}, {'y': 19, 'x': '2014/08/31'}, {'y': 21, 'x': '2014/09/01'}, {'y': 21, 'x': '2014/09/02'}, {'y': 21, 'x': '2014/09/03'}, {'y': 23, 'x': '2014/09/04'}, {'y': 22, 'x': '2014/09/05'}, {'y': 20, 'x': '2014/09/06'}, {'y': 21, 'x': '2014/09/07'}, {'y': 20, 'x': '2014/09/08'}, {'y': 17, 'x': '2014/09/09'}, {'y': 18, 'x': '2014/09/10'}, {'y': 20, 'x': '2014/09/11'}, {'y': 21, 'x': '2014/09/12'}, {'y': 21, 'x': '2014/09/13'}, {'y': 20, 'x': '2014/09/14'}, {'y': 22, 'x': '2014/09/15'}, {'y': 24, 'x': '2014/09/16'}, {'y': 25, 'x': '2014/09/17'}, {'y': 25, 'x': '2014/09/18'}, {'y': 24, 'x': '2014/09/19'}, {'y': 24, 'x': '2014/09/20'}, {'y': 19, 'x': '2014/09/21'}, {'y': 17, 'x': '2014/09/22'}, {'y': 17, 'x': '2014/09/23'}, {'y': 16, 'x': '2014/09/24'}, {'y': 17, 'x': '2014/09/25'}, {'y': 19, 'x': '2014/09/26'}, {'y': 20, 'x': '2014/09/27'}, {'y': 22, 'x': '2014/09/28'}, {'y': 19, 'x': '2014/09/29'}, {'y': 20, 'x': '2014/09/30'}, {'y': 20, 'x': '2014/10/01'}, {'y': 19, 'x': '2014/10/02'}, {'y': 22, 'x': '2014/10/03'}, {'y': 21, 'x': '2014/10/04'}, {'y': 15, 'x': '2014/10/05'}, {'y': 16, 'x': '2014/10/06'}, {'y': 15, 'x': '2014/10/07'}, {'y': 16, 'x': '2014/10/08'}, {'y': 18, 'x': '2014/10/09'}, {'y': 17, 'x': '2014/10/10'}, {'y': 15, 'x': '2014/10/11'}, {'y': 16, 'x': '2014/10/12'}, {'y': 18, 'x': '2014/10/13'}, {'y': 13, 'x': '2014/10/14'}, {'y': 18, 'x': '2014/10/15'}, {'y': 18, 'x': '2014/10/16'}, {'y': 18, 'x': '2014/10/17'}, {'y': 23, 'x': '2014/10/18'}, {'y': 21, 'x': '2014/10/19'}, {'y': 17, 'x': '2014/10/20'}, {'y': 14, 'x': '2014/10/21'}, {'y': 13, 'x': '2014/10/22'}, {'y': 15, 'x': '2014/10/23'}, {'y': 12, 'x': '2014/10/24'}, {'y': 15, 'x': '2014/10/25'}, {'y': 15, 'x': '2014/10/26'}, {'y': 17, 'x': '2014/10/27'}, {'y': 14, 'x': '2014/10/28'}, {'y': 12, 'x': '2014/10/29'}, {'y': 15, 'x': '2014/10/30'}, {'y': 16, 'x': '2014/10/31'}, {'y': 18, 'x': '2014/11/01'}, {'y': 17, 'x': '2014/11/02'}, {'y': 15, 'x': '2014/11/03'}, {'y': 10, 'x': '2014/11/04'}, {'y': 9, 'x': '2014/11/05'}, {'y': 8, 'x': '2014/11/06'}, {'y': 9, 'x': '2014/11/07'}, {'y': 12, 'x': '2014/11/08'}, {'y': 12, 'x': '2014/11/09'}, {'y': 12, 'x': '2014/11/10'}, {'y': 12, 'x': '2014/11/11'}, {'y': 12, 'x': '2014/11/12'}, {'y': 13, 'x': '2014/11/13'}, {'y': 12, 'x': '2014/11/14'}, {'y': 11, 'x': '2014/11/15'}, {'y': 9, 'x': '2014/11/16'}, {'y': 12, 'x': '2014/11/17'}, {'y': 8, 'x': '2014/11/18'}, {'y': 9, 'x': '2014/11/19'}, {'y': 8, 'x': '2014/11/20'}, {'y': 9, 'x': '2014/11/21'}, {'y': 11, 'x': '2014/11/22'}, {'y': 13, 'x': '2014/11/23'}, {'y': 11, 'x': '2014/11/24'}, {'y': 9, 'x': '2014/11/25'}, {'y': 6, 'x': '2014/11/26'}, {'y': 8, 'x': '2014/11/27'}, {'y': 9, 'x': '2014/11/28'}, {'y': 4, 'x': '2014/11/29'}, {'y': 3, 'x': '2014/11/30'}, {'y': 2, 'x': '2014/12/01'}, {'y': 1, 'x': '2014/12/02'}, {'y': 1, 'x': '2014/12/03'}, {'y': 1, 'x': '2014/12/04'}, {'y': 5, 'x': '2014/12/05'}, {'y': 9, 'x': '2014/12/06'}, {'y': 6, 'x': '2014/12/07'}, {'y': 4, 'x': '2014/12/08'}, {'y': 4, 'x': '2014/12/09'}, {'y': 9, 'x': '2014/12/10'}, {'y': 7, 'x': '2014/12/11'}, {'y': 9, 'x': '2014/12/12'}, {'y': 6, 'x': '2014/12/13'}, {'y': 4, 'x': '2014/12/14'}, {'y': 7, 'x': '2014/12/15'}, {'y': 7, 'x': '2014/12/16'}, {'y': 10, 'x': '2014/12/17'}, {'y': 12, 'x': '2014/12/18'}, {'y': 12, 'x': '2014/12/19'}, {'y': 9, 'x': '2014/12/20'}, {'y': 10, 'x': '2014/12/21'}, {'y': 12, 'x': '2014/12/22'}, {'y': 12, 'x': '2014/12/23'}, {'y': 10, 'x': '2014/12/24'}, {'y': 7, 'x': '2014/12/25'}, {'y': 5, 'x': '2014/12/26'}, {'y': 2, 'x': '2014/12/27'}, {'y': 3, 'x': '2014/12/28'}, {'y': 5, 'x': '2014/12/29'}, {'y': 6, 'x': '2014/12/30'}, {'y': 7, 'x': '2014/12/31'}]
lineGraph = new InteractiveGraph 12, 4, data
