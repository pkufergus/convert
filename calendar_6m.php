<?php 
include_once "./shared/ez_sql_core.php";
include_once "./mysql/ez_sql_mysql.php";
include_once "./config.inc_2.php";
function getWeek($year,$month,$day){
	$week=date("w",mktime(0,0,0,$month,$day,$year));//获得星期
	return $week;//获得星期
}

$AllPrice=array();
$SortedPrice=array();

#$filename="test.txt";
function GetAllPrice($Departure,$Arrival, $Staydays, $Stops)
{
	$AllPrice=array();
	$firstday=date("Y-m")."-01";
	$str_where = "";
	if($Stops == '1')
	{
		$str_where = 'Stops < 1';
	}
	else
	{
		$str_where = 'Stops <= 2';
	}
	$db = new ezSQL_mysql ( DB_SERVER_USERNAME, DB_SERVER_PASSWORD, DB_DATABASE, DB_SERVER );
	$db->query("set names utf8");
	$Departure = $db->escape($Departure);
	$Arrival = $db->escape($Arrival);
	$firstday = $db->escape($firstday);
	$Staydays = $db->escape($Staydays);
	$str_where = $db->escape($str_where);
	$SQL = "SELECT ID, DepartureDate, ReturnDate,DepartureCity,ArrivalCity,Price,Stops,AirlineCode,AirlineName,WebLink,Undone 
FROM aie_masterdata 
WHERE DepartureCity = '".$Departure."' 
AND ArrivalCity = '".$Arrival."' 
AND Date(DepartureDate) >= '".$firstday."' 
AND TO_DAYS(ReturnDate) - TO_DAYS(DepartureDate) = '".$Staydays."' 
AND ".$str_where." ";
	//echo $SQL."<br/>";
	$masterdata = $db->get_results ($SQL );
	if (is_array ( $masterdata ))
	{	  
		$AllPrice[$Departure.":".$Arrival]=array();
		foreach ( $masterdata as $Record ) {
			$AllPrice[$Departure.":".$Arrival][$Record->DepartureDate]=array();
			$AllPrice[$Departure.":".$Arrival][$Record->DepartureDate][0]=$Record->Price;
			$AllPrice[$Departure.":".$Arrival][$Record->DepartureDate][1]=$Record->WebLink;
			//echo $AllPrice[$Departure.":".$Arrival][$Record->DepartureDate][0]."<br/>";
			//echo $AllPrice[$Departure.":".$Arrival][$Record->DepartureDate][1]."<br/>";
		}
	}
	return $AllPrice;
}

function GetPrice($Departure,$Arrival,$DepartureDate,$ReturnDate,$Stops)
{
	global $AllPrice;
	$city_key=$Departure.":".$Arrival;
	//echo "<br/><div> city_key=".$city_key."</div><br/>";
	$res="";
	if (!array_key_exists($city_key, $AllPrice)) {
		//echo "<br/><div>res="."city null"."</div><br/>";
		return $res;
	}
	if (!array_key_exists($DepartureDate, $AllPrice[$city_key])) {
		//echo "<br/><div>res="."date null"."</div><br/>";
		return $res;
	} else {
		$tmp=$AllPrice[$city_key][$DepartureDate];
		$res='<a style="margin:0; padding:0;" target="_blank" href="'.$tmp[1].'">'.(intval($tmp[0])).'</a>';
	}
	//echo "<br/><div>res=".$res."</div><br/>";
	return $res;
}

function GetPrice_int($Departure,$Arrival,$DepartureDate,$ReturnDate,$Stops)
{
	global $AllPrice;
	$city_key=$Departure.":".$Arrival;
	//echo "<br/><div> city_key=".$city_key."</div><br/>";
	$res=0;
	if (!array_key_exists($city_key, $AllPrice)) {
		//echo "<br/><div>res="."city null"."</div><br/>";
		return $res;
	}
	if (!array_key_exists($DepartureDate, $AllPrice[$city_key])) {
		//echo "<br/><div>res="."date null"."</div><br/>";
		return $res;
	} else {
		$tmp=$AllPrice[$city_key][$DepartureDate];
		$res=intval($tmp[0]);
	}
	return $res;
}

function DivideAndSort($month, $year, $Departure,$Arrival,$Staydays,$Stops)
{
        global $SortedPrice;
        $today = strtotime ("now");
        $true_firstday = strtotime ( "3 days" ,$today);
        for($i=$month; $i<$month+10; $i++) {
                if ($i>12) {
                        $m=intval($i-12);
                        $y=intval($year+1);
                } else {
                        $m=intval($i);
                        $y=intval($year);
                }
                $SortedPrice[$m]=array();
                $day = mktime(0,0,0,$m,1,$y);
                #file_put_contents("test.txt", "year=".date("Y-m-d", $day)." ".$y." ".$year." ".$m." ".$day."\n", FILE_APPEND);
                for(;intval(date("m",$day))==intval($m);$day=strtotime ( "1 day" ,$day)) {
                        if (strtotime(date("Y-m-d", $true_firstday)) > strtotime(date("Y-m-d", $day))) {
                                continue;
                        }
                        $d=intval(date("d",$day));
                        $price=GetPrice_int($Departure,$Arrival,date("Y-m-d",$day),date("Y-m-d", strtotime($staydays." day" ,$day)), $Stops);
                        #$out="day=".date("Y-m-d", $day)." year=".date("Y", $day)."price=".$price."\n";
                        #file_put_contents("test.txt", $out, FILE_APPEND);
                        $SortedPrice[$m][$d]=intval($price);
                }
				$c=count($SortedPrice[$m]);
				if ($c<1) {
					continue;
				}
                $SortedPrice[$m]=array_unique($SortedPrice[$m]);
                sort($SortedPrice[$m]);
        } 
}

function GetPos($day, $price)
{
        global $SortedPrice;
        $month=intval(date("m", $day));
        $num=count($SortedPrice[$month]);
        #file_put_contents("test.txt", "GetPos year=".date("Y-m-d", $day)."month=".$month." num=".$num." price=".intval($price)."\n", FILE_APPEND);
        if ($num < 1) {
                return 1;
        }
        if ($price <= $SortedPrice[$month][0]) {
                return 1;
        }
        if ($price > $SortedPrice[$month][$num-1]) {
                return 1;
        }
        if ($num < 5) {
                for ($i=0; $i<$num;$i++) {
                        if ($price==$SortedPrice[$month][$i]) {
                                return $i+1;
                        }
                }
        } 
        for ($i=0; $i<3;$i++) {
                if ($price==$SortedPrice[$month][$i]) {
                        return $i+1;
                }
        }
        for ($i=$num-1; $i>=($num-2);$i--) {
                if ($price==$SortedPrice[$month][$i]) {
                        return 5-($num-1-$i);
                }
        }
        return 3;
}

function Output($prices) {
        $outstr="";
        foreach ($prices as $key => $month_price) {
                $outstr.="month=".$key."\n";
                foreach($month_price as $k=>$v) {
                        $outstr.="day=".$k." "."price=".$v."\n";
                }
                $outstr.="\n";
        }
        file_put_contents("test.txt", $outstr, FILE_APPEND);
}

$month=date("m"); //默认为本月
$year=date("Y"); //默认为本年

if(isset($_GET["month"]))
{
	$month = date("m",strtotime($_GET["month"].'01'));
	$year=date("Y",strtotime($_GET["month"].'01'));
}
$title = ""; 
/*
var FROM = document.getElementById("FROM").value;
							//alert(FROM);
							var TO = document.getElementById("TO").value;
							//alert(TO);
							var MONTH = document.getElementById("MONTH").value;
							//alert(MONTH);
							var STAYDAYS = document.getElementById("STAYDAYS").value;
							//alert(STAYDAYS);
							var STOPS = document.getElementById("STOPS").value;
							document.getElementById("iframepage_calendar").src = "calendar.php?from="+FROM+"&to="+TO+"&month="+MONTH+"&staydays="+STAYDAYS+"&stops="+STOPS;
							*/
if(isset($_GET["from"]))
{
	$from = $_GET["from"];
}
if(isset($_GET["title"]))
{
	$title = $_GET["title"];
}
if(isset($_GET["to"]))
{
	$to = $_GET["to"];
}
if(isset($_GET["staydays"]))
{
	$staydays = $_GET["staydays"];
}
if(isset($_GET["stops"]))
{
	$stops = $_GET["stops"];
}
if(isset($_GET["lan"]))
{
	$lan = $_GET["lan"];
}
							
$week=getWeek($year,$month,1);
$beforedays = 0;
if($week ==0)
{
	$beforedays = 7;
}
else
{
	$beforedays = $week;
}

$firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
$today = strtotime ("now");
$true_firstday = strtotime ( "3 days" ,$today);

//if ( strtotime(date("Y-m-d", $firstday)) < strtotime(date("Y-m-d", $true_firstday)) ) {
//	$firstday = $today;
//	$month = date("m", $firstday); 
//}

$AllPrice=GetAllPrice($from,$to, $staydays, $stops);
#file_put_contents($filename, "This is something.");
DivideAndSort($month, $year, $from,$to,$staydays,$stops);
#file_put_contents($filename, "after sort.", FILE_APPEND);
#Output($SortedPrice);
?>
<?php 
include('cache.class.php'); 
$cache=new cache(); 
	ob_start(); 
	ob_implicit_flush(0); 
?> 

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="./css/style.css" />
    <link rel="stylesheet" type="text/css" href="./css/calendar.css" />
</head>
<body>
<table border='0' cellspacing='0' cellpadding='0'>
<tr>
	<td>
	
    <table border='0' cellspacing='0' cellpadding='0'>
   		 <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(strtotime(date("Y-m-d", $firstday)) >= strtotime(date("Y-m-d", $true_firstday)))
								{
									//echo '<br/>'.date("w",$firstday);
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
                                                                        //echo "<br>price=".$price."</br>";
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
    <td style="width:1px;">
    	
    </td>
    <td>
    
    <?php 
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
    
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">                
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){//打印星期标头
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){//打印星期标头
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(strtotime(date("Y-m-d", $firstday)) >= strtotime(date("Y-m-d", $true_firstday)))
								{
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
	</tr>
    
    
    <tr>
    <?php 
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
	<td>
	
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									//echo '<br/>'.date("w",$firstday);
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
    <td style="width:1px;">
    	
    </td>
    <td>
    
    <?php 
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
    
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){//打印星期标头
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){//打印星期标头
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
	</tr>
    
     
    <tr>
    <?php 
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
	<td>
	
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									//echo '<br/>'.date("w",$firstday);
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
    <td style="width:1px;">
    	
    </td>
    <td>
    
    <?php 
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
    
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){//打印星期标头
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){//打印星期标头
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
	</td>
	</tr>

	<tr>
    <?php 
	// 6th
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
	<td>
	
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									//echo '<br/>'.date("w",$firstday);
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
    <td style="width:1px;">
    	
    </td>
	<td>
    <?php 
	// 7th
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
    
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){//打印星期标头
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){//打印星期标头
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>

    </td>
	</tr>

	<tr>
    <?php 
	// 8th
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
	<td>
	
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									//echo '<br/>'.date("w",$firstday);
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>
    </td>
    <td style="width:1px;">
    	
    </td>
	<td>
    <?php 
	// 9th
    $month = date("m",$firstday);
    $year = date("y",$firstday);
    
    $week=getWeek($year,$month,1);
    $beforedays = 0;
    if($week ==0)
    {
    	$beforedays = 7;
    }
    else
    {
    	$beforedays = $week;
    }
    
    $firstday = strtotime ( "-".$beforedays." day" ,mktime(0,0,0,$month,1,$year));
    
    ?>
    
    <table border='0' cellspacing='0' cellpadding='0'>
    <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <span style="font-size: 12px; font-weight: bold;"><?php echo $title;?></span>
            </td>
        </tr>
        <tr>
            <td style="height: 25px; padding: 0px 0 0 30px;">
                <?php echo intval($month);?>月
            </td>
        </tr>
        <tr>
            <td>
                <table cellspacing="3" cellpadding="3" class="calendar">
                    <tr class="header">
                        <td colspan="7">&nbsp;
                            
                        </td>
                    </tr>
                    <?php 
                    for($Tmpa=0;$Tmpa<6;$Tmpa++){//打印星期标头
                    	echo '<tr class="row">';
                    	for($Tmpb=0;$Tmpb<7;$Tmpb++){//打印星期标头
                    		if (intval(date("m",$firstday))== intval($month))
                    		{
	                    		echo '<td class="currentmonth">';
	                            echo intval(date("d",$firstday));
								if(date("w",$firstday)>=0 && date("w",$firstday)<7)
								{
									$price_temp = str_replace('LANGUAGE=US', 'LANGUAGE='.$lan,GetPrice($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime ( $staydays." day" ,$firstday)),$stops) ) ;
                                                                        $price_int=GetPrice_int($from,$to,date("Y-m-d",$firstday),date("Y-m-d",strtotime( $staydays." day" ,$firstday)),$stops);
									
									if(!empty($price_temp))
									{
                                                                                $pos=GetPos($firstday, $price_int);
										echo '<br/><div class= "price'.$pos.'">';
										echo $price_temp;
										echo  '</div>';
									}
									else
									{
										echo '<br/><div class= "price">';
										echo "&nbsp;";
										echo  '</div>';
									}
								}
								
	                        	echo '</td>';
                    		}
                    		else
                    		{
                    			echo '<td>';
                    			echo intval(date("d",$firstday));
								echo '<br/><div class= "price">&nbsp;';
									
									echo  '</div>';
                    			echo '</td>';
                    		}
                    		
                    		$firstday = strtotime ( "1 day" ,$firstday);
                    		 
                    	}
                    	echo '</tr>';
                    }                    
                    ?>                    
                </table>
            </td>
        </tr>
    </table>

    </td>
	</tr>
</table>
</body>
</html>
<?php 
//	$template = ob_get_contents(); 
//	$cache->clearCache("calendar");
//	$cache->writeCache($_SERVER["REQUEST_URI"],$template);
?> 

