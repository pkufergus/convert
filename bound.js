

function yzkgetElementsByClass(classN) {
    var elements = [];
    var listElm = document.getElementsByTagName('input')
    for (var i = 0; i < listElm.length; i++) {
        // alert(listElm.className);
        console.log(listElm[i].className);

        if (listElm[i].className === 'undefined') {
          continue;
        }
        if (hasClass(listElm[i].className, classN)) 
          elements.push(listElm[i]);
    }
    return elements;
}
function hasClass(a, sub) {
    if (a.indexOf(sub)>=0) {
      return true;
    }
    return false;
}
