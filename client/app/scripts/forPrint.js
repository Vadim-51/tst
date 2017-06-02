function changeSize(){
    console.debug("works");
    wc = window.innerWidth || document.documentElement.clientWidth 
        || document.getElementsByTagName("body")[0].clientWidth;
    hc = window.innerHeight || document.documentElement.clientHeight 
        || document.getElementsByTagName("body")[0].clientHeight;
    console.debug("Context", wc, hc);
    var image = document.getElementById('screenshot');
    console.debug("Image", image.clientWidth, image.clientHeight);
    var ki = image.clientWidth/image.clientHeight;
    var kc = wc/hc;
    if(ki > kc){
        image.style.width = wc-10+"px";
        image.style.height = "";
    }else{
        image.style.height = hc-10+"px";
        image.style.width = "";
    }
}
window.onresize = changeSize;