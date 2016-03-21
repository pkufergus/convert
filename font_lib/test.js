
function test_test() {
for(i in TAG)
  Println("tag i="+i+" tag="+TAG[i]+" "+TAG[i].toString(16));

var x=122;
Println("x="+x.toString(16));
Println("x1="+x.toString(16)[1]);

var y = 0xFFFF;
Println("y="+ y);
y1 = uint16toSignedInt(y);
Println("y1="+ y1);
}

