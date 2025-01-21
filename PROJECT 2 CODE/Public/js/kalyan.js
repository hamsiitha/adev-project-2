function countToTen(){
    var count = 0;
    while (count < 10) {
    count++;
    document.getElementById("theCount").innerHTML +=   count + "<br>";
 }
}
function countTo11(){
    var rightNow = newDate();
    document.write(rightNow.toDateString());
 }

