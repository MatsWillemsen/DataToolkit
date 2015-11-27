/* use this to test out your function */
window.onload = function() {
 	changeColor('pl','pink');
  changeColor('ch','#343434');
  changeColor('at','#777777');
  changeColor('lv','blue');
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
    document.querySelector('#' + id).style.fill = color;
}
