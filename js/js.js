












// ================================================================================================================================
// ================================================================================================================================
// ================================================================================================================================
// ===      												Scott Murray														===
// ===      							    			        2016															===
// ================================================================================================================================
// ================================================================================================================================
// ================================================================================================================================


















var weightings = [
	{"Awareness":[
		{"Overall":0.16}, {"First":0.25}, {"Second":0.25}, {"Third":0.25}, {"Fourth":0.25}]
	},
	{"Familiarity":[
		{"Overall":0.16}, {"First":0.25}, {"Second":0.25}, {"Third":0.25}, {"Fourth":0.25}]
	},
	{"Likeability":[
		{"Overall":0.16}, {"First":0.33}, {"Second":0.33}, {"Third":0.33}]
	},
	{"Participation":[
		{"Overall":0.16}, {"First":0.33}, {"Second":0.33}, {"Third":0.33}]
	},
	{"Endorsement":[
		{"Overall":0.16}, {"First":0.20}, {"Second":0.20}, {"Third":0.20}, {"Fourth":0.20}, {"Fifth":0.20}]
	},
	{"Advocacy":[
		{"Overall":0.16}, {"First":1}]
	}
];


// How long should a Leader led Event and Survey count for?
// The current month and x months therafter..

var numberOfMonths = 3; 	// makes 3 full months worth of data..

// Contains all the activities for the month
var theDetailData = [];
// Contains all the BUs for the dropdowns
var dropDownArr = [];
// temporary holder of the values to be added to the SP list.  Neater way than holding them in multiple vars
var activityEntry = [];

// Arrays holding the averaged values for each type of activity
var leaderActivitiesToAverage = [];
var emailActivitiesToAverage = [];
var intranetActivitiesToAverage = [];
var newsActivitiesToAverage = [];
var surveyActivitiesToAverage = [];

var compoundMeasures = [];

// A quick record of whether or not the user selected a Full email or contributed content when adding a new "Email"
var emailPopupSelected = "";
var noPriorEmails = false;

$(document).ready(function () {
	
	// Activate the features in the "Toolkit" tab
	renderVideoPlayer();
	$( "#accordion" ).accordion({
      collapsible: true,
	  heightStyle: "content",
	  active: false
    });
	
	getDropDownItems();
	initAllEventListeners();
});

// ======================================================================================
// ======================================================================================
// ===      Functions to support the main view - All the events for a given BU.       ===
// ======================================================================================
// ======================================================================================

function getMainViewData(month){
	
	$(".percentcomplete .icon").show();
	$(".percentcomplete .thetext").html("");
	
	var monthArray = month.split(" ");
	var monthInNumbers = "00";
	
	switch(monthArray[0]){
		case "January": 
			monthInNumbers = "01";
		break;
		case "February": 
			monthInNumbers = "02";
		break;
		case "March": 
			monthInNumbers = "03";
		break;
		case "April": 
			monthInNumbers = "04";
		break;
		case "May": 
			monthInNumbers = "05";
		break;
		case "June": 
			monthInNumbers = "06";
		break;
		case "July": 
			monthInNumbers = "07";
		break;
		case "August": 
			monthInNumbers = "08";
		break;
		case "September": 
			monthInNumbers = "09";
		break;
		case "October": 
			monthInNumbers = "10";
		break;
		case "November": 
			monthInNumbers = "11";
		break;
		case "December": 
			monthInNumbers = "12";
		break;	
		default:		
		
	}
	
	var newDate = moment(monthArray[1] + "-" + monthInNumbers + "-01");
	var newDate1 = moment(monthArray[1] + "-" + monthInNumbers + "-01");

	var Fields1 = "<ViewFields><FieldRef Name=\"ID\" /><FieldRef Name=\"Title\" /><FieldRef Name=\"BU_x0020_ID\" /><FieldRef Name=\"BU_x0020_Name\" /><FieldRef Name=\"Activity_x0020_Date\" /><FieldRef Name=\"End_x0020_Date\" /><FieldRef Name=\"Activity_x0020_type\" /><FieldRef Name=\"Notes\" /><FieldRef Name=\"Value_x0020_1\" /><FieldRef Name=\"Value_x0020_2\" /><FieldRef Name=\"Value_x0020_3\" /><FieldRef Name=\"Value_x0020_4\" /><FieldRef Name=\"Value_x0020_5\" /><FieldRef Name=\"Value_x0020_6\" /><FieldRef Name=\"Value_x0020_7\" /><FieldRef Name=\"Value_x0020_8\" /><FieldRef Name=\"Value_x0020_9\" /><FieldRef Name=\"Value_x0020_10\" /></ViewFields>";

	var query =
		"<Query>" +
			"<Where>" +
				"<And>" +
					"<Geq>" +
						 "<FieldRef Name=\"Activity_x0020_Date\" />" +
						 "<Value Type=\"DateTime\">" + newDate1.subtract(numberOfMonths, "months").startOf('month').toISOString() + "</Value>" +
					"</Geq>" +
					"<Leq>" +
						 "<FieldRef Name=\"Activity_x0020_Date\" />" +
						 "<Value Type=\"DateTime\">" + newDate.endOf('month').toISOString() + "</Value>" +
					"</Leq>" +
				"</And>" +
			"</Where>" +
			"<OrderBy>" +
				"<FieldRef Name='Activity_x0020_Date' Ascending='false' />" +
			"</OrderBy>" +
		"</Query>";	

	// Let's get the single, most recent KPI record for any given scope
	$().SPServices({
		webURL:"https://connect.gsk.com/sites/Cx",
		operation: "GetListItems",
		async: true,
		listName: "Measurement Dashboard - Inputs",
		CAMLViewFields: Fields1,
		CAMLQuery: query,
		completefunc: function (xData, Status) {
			
			theDetailData = [];

			var quantity = $(xData.responseXML).SPFilterNode("z:row").length;
			
			$(xData.responseXML).SPFilterNode("z:row").each(function(id) {

				// Only add the items that are either Survey or Leader Led.	
				var dateToCompare = moment($(this).attr("ows_Activity_x0020_Date"));
				
				if((dateToCompare.isSameOrAfter(newDate.startOf('month')) && dateToCompare.isSameOrBefore(newDate.endOf('month'))) || (($(this).attr("ows_Activity_x0020_type") == "Leader event") || ($(this).attr("ows_Activity_x0020_type") == "Survey data"))){
					theMessage = '{'
					
					// Check what type it is and adjust the labels for the JSON object...
					
					theMessage += '"id":' + JSON.stringify($(this).attr("ows_ID")) + ',';
					theMessage += '"title":' + JSON.stringify($(this).attr("ows_Title")) + ',';
					theMessage += '"buID":' + JSON.stringify(parseInt($(this).attr("ows_BU_x0020_ID"))) + ',';
					theMessage += '"buName":' + JSON.stringify($(this).attr("ows_BU_x0020_Name")) + ',';
					theMessage += '"date":' + JSON.stringify($(this).attr("ows_Activity_x0020_Date")) + ',';
					theMessage += '"type":' + JSON.stringify(addBlankString($(this).attr("ows_Activity_x0020_type"))) + ',';
					theMessage += '"notes":' + JSON.stringify(addBlankString($(this).attr("ows_Notes"))) + ',';
					theMessage += '"value1":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_1"))) + ',';
					theMessage += '"value2":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_2"))) + ',';
					theMessage += '"value3":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_3"))) + ',';
					theMessage += '"value4":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_4"))) + ',';
					theMessage += '"value5":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_5"))) + ',';
					theMessage += '"value6":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_6"))) + ',';
					theMessage += '"value7":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_7"))) + ',';
					theMessage += '"value8":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_8"))) + ',';
					theMessage += '"value9":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_9"))) + ',';
					theMessage += '"value10":' + JSON.stringify(addBlankNumber($(this).attr("ows_Value_x0020_10")));			
					
					theMessage += "}";
					
					var obj = jQuery.parseJSON(theMessage);
					
					theDetailData.push(obj);				
				}
			});	

			// Now we have all the entries for a month - filter out the ones for the selected BU and show only those...
			updateMainView();
		}
	});	
	

}
function updateMainView(){

	

	$(".activitylist > ul").empty();

	var dropDownSelectedID = $(".control-holder select").last().find("option:selected").val().split("-");

	var theHTML = "";
	// Reset the average data (we need to recalculate - something has changed...)
	leaderActivitiesToAverage = [];
	emailActivitiesToAverage = [];
	intranetActivitiesToAverage = [];
	newsActivitiesToAverage = [];
	surveyActivitiesToAverage = [];

	
	
	for (i = 0 ; i < theDetailData.length; i++){
		
		if(dropDownSelectedID[1] == "1"){
			// Just show all the records as it's a complete roll up..
			renderActivityEntry(i);
		}
		else{
			eachRecursive1(i, dropDownSelectedID[1]);
		}
	}
	
	
	$(".percentcomplete .thetext").html(theDetailData.length + " entries for");
	$(".percentcomplete .icon").hide();
	// Calculate averages for the items in view
	calculateAverages();

	// Update dropdownlist that lists out ll the email activities..
	updateEmailDropdown();
	
	// Add in the ADD buttons
	addNewItemButtons();
	
	$(".activitylist .rating").off();
	// Event listeners to see more information on an event
	$(".activitylist .rating").on({
		mouseenter: function () {
			//stuff to do on mouse enter
			$(this).parent().find(".hiddenCard").fadeIn(400);
		},
		mouseleave: function () {
			//stuff to do on mouse leave
			$(this).parent().find(".hiddenCard").fadeOut(400);
		}
	});	
	
}
function eachRecursive1(activityID, id){
	
	if (theDetailData[activityID].buID == id) {  
		// We have an immediate match
		renderActivityEntry(activityID);
		return;		
	}

	// Check to see if the children of ID has an item to display
	for (var x in dropDownArr) {  
		if(dropDownArr[x].parentid == id){
			eachRecursive1(activityID, dropDownArr[x].id);
		}
	}
}
function renderActivityEntry(i){

	var newDate = moment(theDetailData[i].date);
	var newDate1 = moment(theDetailData[i].date).add(numberOfMonths, "months").endOf('month');
	
	switch(theDetailData[i].type){
		case "Leader event":
			var attendaceRate = Math.round((theDetailData[i].value2 / theDetailData[i].value1) * 100);
			
			var questionRate = 0;
			if(parseInt(theDetailData[i].value3) <= 2){
				questionRate = 40;
			}else if((parseInt(theDetailData[i].value3) < 6) && (parseInt(theDetailData[i].value3) > 2)){
				questionRate = 70;
			}else if(parseInt(theDetailData[i].value3) >=6){
				questionRate = 85;
			}
			
			var averageScore = Math.round((attendaceRate + parseInt(theDetailData[i].value4) + parseInt(theDetailData[i].value5) + parseInt(theDetailData[i].value6) + parseInt(theDetailData[i].value7)) / 5);
			
			var hiddenCard = "<div class=\"hiddenCard\">";
			hiddenCard += "<div class=\"measureright\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/measure.png\" /></div>";
			hiddenCard += "<ul class=\"underlyingdata\">";
			hiddenCard += "	<li><span class=\"smallcircle\" style=\"background-color:" + whatColour(attendaceRate.toString()) + ";\"></span><span class=\"score\">" + attendaceRate + "%</span> attendance rate (" + theDetailData[i].value2 + ")</li>";
			hiddenCard += "	<li><span class=\"smallcircle\" style=\"background-color:" + whatColour(theDetailData[i].value4) + ";\"></span><span class=\"score\">" + theDetailData[i].value4 + "%</span> retention score</li>";
			hiddenCard += "	<li><span class=\"smallcircle\" style=\"background-color:" + whatColour(theDetailData[i].value5) + ";\"></span><span class=\"score\">" + theDetailData[i].value5 + "%</span> relevance score</li>";
			hiddenCard += "	<li><span class=\"smallcircle\" style=\"background-color:" + whatColour(theDetailData[i].value6) + ";\"></span><span class=\"score\">" + theDetailData[i].value6 + "%</span> Pulse check</li>";
			hiddenCard += "	<li><span class=\"smallcircle\" style=\"background-color:" + whatColour(theDetailData[i].value7) + ";\"></span><span class=\"score\">" + theDetailData[i].value7 + "%</span> motivated score</li>";
			hiddenCard += "</ul></div>";
			
			var theHTML = "<li><div class=\"datewrapper\"><div class=\"date\"><div class=\"number\">" + newDate.format('D') + "</div><div class=\"month\">" + newDate.format('MMM') + "</div></div><div class=\"datesto\">to</div><div class=\"date1\"><div class=\"number\">" + newDate1.format('D') + "</div><div class=\"month\">" + newDate1.format('MMM') + "</div></div></div>" + hiddenCard + "<div class=\"rating\" style=\"background-color:" + whatColour(averageScore.toString()) + ";\"><span class=\"ratingfigure\">" + averageScore + "%</span></div><div class=\"theimage\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/1.png\"></div><div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + "</div></li>";
			$(".leaderled > ul").append(theHTML);
			leaderActivitiesToAverage.push(theDetailData[i]);
		break;
		case "Email":
			var theHTML = "";
			if (theDetailData[i].value10 == "standalone"){
				theHTML += "<li>";
				theHTML += "		<div class=\"emaildate\"><div class=\"number\">" + newDate.format('D') + "</div><div class=\"month\">" + newDate.format('MMM') + "</div></div>";
				theHTML += "		<div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + " - " + theDetailData[i].value1 + " employees</div>";
				theHTML += "		<div class=\"metric one\">" + theDetailData[i].value1 + "<div class=\"helpertext\">Delivered emails</div></div>";
				theHTML += "		<div class=\"metric two\">" + theDetailData[i].value2 + "%<div class=\"helpertext\">Open Rate</div></div>";
				theHTML += "		<div class=\"metric three\">" + theDetailData[i].value3 + "%<div class=\"helpertext\">Click Through Rate (CTR)</div></div>";
				theHTML += "		<div class=\"metric four\">" + Number((theDetailData[i].value5 / theDetailData[i].value4) * 100).toFixed(2) + "%<div class=\"helpertext\">Core content</div></div>";			
				theHTML += "		<div class=\"metric five\">" + theDetailData[i].value6 + "%<div class=\"helpertext\">Relevancy</div></div>";
				theHTML += "	</li>";				
			}else{
				theHTML += "<li class=\"content\">";
				theHTML += "		<div class=\"emaildate\"><div class=\"number\">" + newDate.format('D') + "</div><div class=\"month\">" + newDate.format('MMM') + "</div></div>";
				theHTML += "		<div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + " - " + theDetailData[i].value1 + " employees</div>";
				theHTML += "		<div class=\"metric two\">" + theDetailData[i].value2 + "%<div class=\"helpertext\">Open Rate</div></div>";
				theHTML += "		<div class=\"metric three\">" + theDetailData[i].value3 + "%<div class=\"helpertext\">Click Through Rate (CTR)</div></div>";
				theHTML += "		<div class=\"metric four\">" + Number((theDetailData[i].value5 / theDetailData[i].value4) * 100).toFixed(2) + "%<div class=\"helpertext\">Core content</div></div>";
				theHTML += "		<div class=\"metric five\">" + theDetailData[i].value6 + "%<div class=\"helpertext\">Relevancy</div></div>";
				theHTML += "	</li>";								
			}

			$(".email > ul").append(theHTML);
			emailActivitiesToAverage.push(theDetailData[i]);
		break;
		case "Intranet":
			var theHTML = "	<li>";
			theHTML += "		<div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + " - " + theDetailData[i].value1 + " employees with " + theDetailData[i].value2 + " pages of core content.</div>";
			theHTML += "		<div class=\"metric one\">" + theDetailData[i].value4 + "<div class=\"helpertext\">Unique users</div></div>";
			theHTML += "		<div class=\"metric two\">" + theDetailData[i].value3 + "<div class=\"helpertext\">Page views</div></div>";
			theHTML += "		<div class=\"metric three\">" + toMMSS(theDetailData[i].value5) + "<div class=\"helpertext\">Average time on page</div></div>";
			theHTML += "		<div class=\"metric four\">" + Number((theDetailData[i].value4 / theDetailData[i].value1) * 100).toFixed(2) + "%<div class=\"helpertext\">Intranet content reach</div></div>";
			theHTML += "	</li>";
			$(".intranet > ul").append(theHTML);
			intranetActivitiesToAverage.push(theDetailData[i]);
		break;
		case "News article":
			var theHTML = "	<li>";
			theHTML += "		<div class=\"emaildate\"><div class=\"number\">" + newDate.format('D') + "</div><div class=\"month\">" + newDate.format('MMM') + "</div></div>";
			theHTML += "		<div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + " - " + theDetailData[i].value1 + " employees</div>";
			theHTML += "		<div class=\"metric one\">" + theDetailData[i].value3 + "<div class=\"helpertext\">Unique users</div></div>";
			theHTML += "		<div class=\"metric two\">" + theDetailData[i].value2 + "<div class=\"helpertext\">Article views</div></div>";
			theHTML += "		<div class=\"metric three\">" + toMMSS(theDetailData[i].value4) + "<div class=\"helpertext\">Average time on article</div></div>";
			theHTML += "		<div class=\"metric four\">" + Number((theDetailData[i].value3 / theDetailData[i].value1) * 100).toFixed(2) + "%<div class=\"helpertext\">Article reach</div></div>";
			theHTML += "	</li>";
			$(".news > ul").append(theHTML);			
			newsActivitiesToAverage.push(theDetailData[i]);
		break;
		case "Survey data":

			var theHTML = "	<li class=\"entry\">";
			theHTML += "		<div class=\"entryheader\">";
			theHTML += "			<div class=\"datewrapper\"><div class=\"date\"><div class=\"number\">" + newDate.format('D') + "</div><div class=\"month\">" + newDate.format('MMM') + "</div></div><div class=\"datesto\">to</div><div class=\"date1\"><div class=\"number\">" + newDate1.format('D') + "</div><div class=\"month\">" + newDate1.format('MMM') + "</div></div></div>";
			theHTML += "			<div class=\"name\">" + theDetailData[i].title + "</div><div class=\"path\">" + theDetailData[i].buName + "</div>";
			theHTML += "		</div>";
			theHTML += "		<ul class=\"surveyqs\">";
			theHTML += "			<li>";
			theHTML += "				<h2>1. My manager regularly holds development and career conversations with me</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value1 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";
			theHTML += "			<li>";
			theHTML += "				<h2>2. I have the confidence that GSK has what it takes to beat the competition in the medium to long term</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value2 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";				
			theHTML += "			<li>";
			theHTML += "				<h2>3. I feel my business is ambitious</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value3 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";		
			theHTML += "			<li>";
			theHTML += "				<h2>4. I enjoy my work</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value4 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";	
			theHTML += "			<li>";
			theHTML += "				<h2>5. We celebrate success regularly</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value5 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";	
			theHTML += "			<li>";
			theHTML += "				<h2>6. Considering everything I am satisfied with GSK at present</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value6 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";	
			theHTML += "			<li>";
			theHTML += "				<h2>7. I am proud to work for GSK</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value7 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";	
			theHTML += "			<li>";
			theHTML += "				<h2>8. I rarely think about looking for a new job with a another company</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value8 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";	
			theHTML += "			<li>";
			theHTML += "				<h2>9. I would recommend GSK as a great place to work</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value9 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";			
			theHTML += "			<li>";
			theHTML += "				<h2>10. Leaders in GSK communicate a vision of the future that motivates me</h2>";
			theHTML += "				<div class=\"barchart\" value=\"" + theDetailData[i].value10 + "\">";
			theHTML += "					<div class=\"filled\"></div>";
			theHTML += "					<div class=\"empty\"></div>";
			theHTML += "				</div>";
			theHTML += "			</li>";				
			theHTML += "		</ul>";

			theHTML += "	</li>";
			
			$(".survey > ul").append(theHTML);
			
			$(".survey > ul > li").last().find("ul li").each(function(index) {
			  var $this = $(this);
			  var thevalue = $this.find(".barchart").attr("value");
			  
			  $this.find(".barchart .filled").addClass(phaseColour(parseInt(thevalue)));
			  
			  $(this).find(".barchart .filled").prepend("<div class=\"percentoverlay\">" + thevalue + "%</div>");
			  
			  setTimeout(function() {
				 $this.find(".filled").animate({
					width: thevalue + "%",
				 }, 1000, "swing", function() {});
				 $this.find(".empty").animate({
					width: (100 - parseInt(thevalue)) + "%",
				 }, 1000, "swing", function() {});
			  }, index * 75);
			});			
			
			surveyActivitiesToAverage.push(theDetailData[i]);
		break;		
		default:
		
	}	
	
}
function calculateAverages(){

	// Change the tab names to include the nuber of items..
	
	$("ul.tabs li:nth-child(2)").html("Leader led (" + leaderActivitiesToAverage.length + ")");
	$("ul.tabs li:nth-child(3)").html("Email (" + emailActivitiesToAverage.length + ")");
	$("ul.tabs li:nth-child(4)").html("Intranet (" + intranetActivitiesToAverage.length + ")");
	$("ul.tabs li:nth-child(5)").html("News (" + newsActivitiesToAverage.length + ")");
	$("ul.tabs li:nth-child(6)").html("Survey (" + surveyActivitiesToAverage.length + ")");

	var avergeValues1 = [0, 0, 0, 0, 0, 0, 0, 0];
	
	// ===========================================================================
	// ===========================================================================	
	// 							Leader led activities...
	// ===========================================================================
	// ===========================================================================
	
	var theHTML = "";
	
	var temp1 = 0;  // Attendsnce rate
	var temp2 = 0;  // Total attendance
	var temp3 = 0; 	// Total questions
	var temp4 = 0; 	// Retention
	var temp5 = 0; 	// Relevance
	var temp6 = 0; 	// Pulse check
	var temp7 = 0; 	// Motivated

	for (var i in leaderActivitiesToAverage){
		temp1 = temp1 + (leaderActivitiesToAverage[i].value2 / leaderActivitiesToAverage[i].value1) * 100;
		temp2 = temp2 + parseInt(leaderActivitiesToAverage[i].value2);
		temp3 = temp3 + parseInt(leaderActivitiesToAverage[i].value3);
		temp4 = temp4 + parseInt(leaderActivitiesToAverage[i].value4);
		temp5 = temp5 + parseInt(leaderActivitiesToAverage[i].value5);
		temp6 = temp6 + parseInt(leaderActivitiesToAverage[i].value6);
		temp7 = temp7 + parseInt(leaderActivitiesToAverage[i].value7);
	}
	
	if(leaderActivitiesToAverage.length > 0){
		avergeValues1[0] = leaderActivitiesToAverage.length;							// Number of leader-led activities
		avergeValues1[1] = Math.round(temp1 / leaderActivitiesToAverage.length);		// Average Attendance rate
		avergeValues1[2] = temp2;														// Total numner of attendees
		avergeValues1[3] = temp3;														// Nuber of Qs - IGNORE
		avergeValues1[4] = Math.round(temp4 / leaderActivitiesToAverage.length);		// Average Retention
		avergeValues1[5] = Math.round(temp5 / leaderActivitiesToAverage.length);		// Average Relevance
		avergeValues1[6] = Math.round(temp6 / leaderActivitiesToAverage.length);		// Average Pulse check
		avergeValues1[7] = Math.round(temp7 / leaderActivitiesToAverage.length);		// Average Motivated score

		theHTML = "<div class=\"summaryChart\">";
		theHTML += "<div class=\"bigentry first\"><div class=\"number\">" + avergeValues1[0] + "</div><div class=\"text\">Activities</div></div>";
		theHTML += "<div class=\"bigentry second\"><div class=\"number\">" + avergeValues1[2] + "</div><div class=\"text\">Bums in seats</div></div>";		
		theHTML += "</div>";

		$(".leaderled .summaryzone").html(theHTML + '<div class="detailcharts"><canvas id="myChart3" width="540" height="210"></canvas></div>').show();
		
		var ctx3 = document.getElementById("myChart3");	
		
		var myBarChart1 = new Chart(ctx3, {
			type: 'horizontalBar',
			data: {
				labels: ["Attendance rate", "Retention score", "Relevance score", "Pulse check", "Motivation score"],
				datasets: [{
						labels: ["Attendance rate", "Retention score", "Relevance score", "Pulse check", "Motivation score"],
						backgroundColor: [whatColour(avergeValues1[1].toString()),whatColour(avergeValues1[4].toString()),whatColour(avergeValues1[5].toString()),whatColour(avergeValues1[6].toString()),whatColour(avergeValues1[7].toString())],
						data: [avergeValues1[1], avergeValues1[4], avergeValues1[5], avergeValues1[6], avergeValues1[7]],			
					}]
			},
			options: {
				legend: {
					display: false
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}],
					xAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]					
				},
				title: {
					display: false
				}					
			}
		});		
		
	}else{

		$(".leaderled .summaryzone").html("").hide();
	}
	
	
	// ===========================================================================
	// ===========================================================================	
	// 								Email activities...
	// ===========================================================================
	// ===========================================================================	

	var avergeValues2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	temp1 = 0;  	// emails delivered
	temp2 = 0; 		// Number of email opens
	temp3 = 0; 		// Number of clicks
	temp4 = 0; 		// Number of items of content
	temp5 = 0;		// Number of core items of content
	temp6 = 0; 		//  Relevancy score
	temp7 = 0; 		//  Full email (vs just a content submission) - used to calculate the number of bundling opportunities used
	temp8 = 0;		// Full stand alone email count
	
	
	for (var i in emailActivitiesToAverage){

		// Make sure we only average up the complete email data.. ignore the content submissions
		
		if(emailActivitiesToAverage[i].value10 == "standalone"){
		
			temp1 = temp1 + parseInt(emailActivitiesToAverage[i].value1);	// emails delivered
			
			//number of people who opened = 
			var numberOpened = parseInt(emailActivitiesToAverage[i].value1) * (parseInt(emailActivitiesToAverage[i].value2) / 100);
			var numberClicked = numberOpened * (parseInt(emailActivitiesToAverage[i].value3) / 100);
			
			temp2 = temp2 + numberOpened;	// open count
			temp3 = temp3 + numberClicked;	// click count

			temp4 = temp4 + parseInt(emailActivitiesToAverage[i].value4);	// Number of items of content
			temp5 = temp5 + parseInt(emailActivitiesToAverage[i].value5);	// Number of items of CORE content					
			temp6 = temp6 + parseInt(emailActivitiesToAverage[i].value6);	// Relenvancy percentage
			temp8++;
		}
		
	}
	
	if(emailActivitiesToAverage.length > 0){
	
		avergeValues2[0] = temp8;													// 0 Number of email sends
		avergeValues2[1] = temp1;													// 1 recipient count
		avergeValues2[2] = temp2;													// 2 open count
		avergeValues2[3] = ((temp2 / temp1) * 100).toFixed(2);						// 3 Open rate
		avergeValues2[4] = temp3;													// 4 click count
		avergeValues2[5] = ((temp3 / temp2) * 100).toFixed(2);						// 5 click rate
		avergeValues2[6] = temp4;													// 6 content count
		avergeValues2[7] = temp5;													// 7 CORE content count
		avergeValues2[8] = ((temp5 / temp4) * 100).toFixed(2);						// 8 CORE content %
		avergeValues2[9] = (temp6 / temp8).toFixed(2);								// 9 Relevancy %
		avergeValues2[10] = temp8;													// Number of full emails
		avergeValues2[11] = emailActivitiesToAverage.length;							// Number entries in system

		// Some HTML for the summary header section

		theHTML = "<div class=\"summaryChart\">";
		theHTML += "	<div class=\"bigentry first\"><div class=\"number\">" + avergeValues2[1] + "</div><div class=\"text\">Emails generated</div></div>";
		theHTML += "		<div class=\"helpertext1\">from</div>";
		theHTML += "	<div class=\"bigentry second\"><div class=\"number\">" + avergeValues2[0] + "</div><div class=\"text\">Sends</div></div>";		
		theHTML += "		<div class=\"helpertext2\">which contained</div>";		
		theHTML += "	<div class=\"bigentry third\"><div class=\"number\">" + avergeValues2[8] + "%</div><div class=\"text\">Core content</div></div>";	
		theHTML += "	<div style=\"clear:both;    border-bottom: 1px solid #f0efed;width: 97%;\"></div>";
		theHTML += "</div>";

		// left hand colum in the top zone
		theHTML += "<div class=\"summaryChart2\">";
		theHTML += "	<div class=\"smallchart\"><div class=\"overlay\"><div class=\"big\">" + avergeValues2[3] + "<span class=\"smallpercent\">%</span></div></div><canvas id=\"myChart10\" width=\"170\" height=\"170\"></canvas>Open rate</div>";
		theHTML += "	<div class=\"smallchart\"><div class=\"overlay\"><div class=\"big\">" + avergeValues2[5] + "<span class=\"smallpercent\">%</span></div></div><canvas id=\"myChart11\" width=\"170\" height=\"170\"></canvas>Click rate</div>";		
		theHTML += "	<div class=\"smallchart\"><div class=\"overlay\"><div class=\"big\">" + avergeValues2[9] + "<span class=\"smallpercent\">%</span></div></div><canvas id=\"myChart13\" width=\"170\" height=\"170\"></canvas>Relevancy score</div>";
		theHTML += "	<div style=\"clear:both;\"></div>";		
		theHTML += "</div>";

		$(".email .summaryzone").html(theHTML).show();
		
		
		var pieChartData10 = {
			labels: [
				"Opened",
				"Not Opened"
			],
			datasets: [
				{
					data: [avergeValues2[3], 100 - avergeValues2[3]],
					backgroundColor: [
						whatColour(avergeValues2[3]),
						"#d5d1ce"
					]
				}]
		};	
			
		var ctx10 = document.getElementById("myChart10");
		
		var myChart10 = new Chart(ctx10, {
			type: 'doughnut',
			data: pieChartData10,
			options: {
				cutoutPercentage:92,
				legend: {
					display: false,
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips:{
					enabled: false
				}
			}
		});
		
		var pieChartData11 = {
			labels: [
				"Clicked",
				"Not Clicked"
			],
			datasets: [
				{
					data: [avergeValues2[5], 100 - avergeValues2[5]],
					backgroundColor: [
						whatColourClickRate(avergeValues2[5]),
						"#d5d1ce"
					]
				}]
		};	
			
		var ctx11 = document.getElementById("myChart11");
		
		var myChart11 = new Chart(ctx11, {
			type: 'doughnut',
			data: pieChartData11,
			options: {
				cutoutPercentage:92,
				legend: {
					display: false,
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips:{
					enabled: false
				}
			}
		});	

		var pieChartData13 = {
			labels: [
				"Relvant",
				"Not Relvant"
			],
			datasets: [
				{
					data: [avergeValues2[9], 100 - avergeValues2[9]],
					backgroundColor: [
						whatColour(avergeValues2[3]),
						"#d5d1ce"
					]
				}]
		};	
			
		var ctx13 = document.getElementById("myChart13");
		
		var myChart13 = new Chart(ctx13, {
			type: 'doughnut',
			data: pieChartData13,
			options: {
				cutoutPercentage:92,
				legend: {
					display: false,
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips:{
					enabled: false
				}
			}
		});			
		
	}else{
		$(".email .summaryzone").html("").hide();
	}
	
	// ===========================================================================
	// ===========================================================================	
	// 								Intranet articles
	// ===========================================================================
	// ===========================================================================
	var avergeValues3 = [0, 0, 0, 0, 0, 0, 0];
	
	temp1 = 0;  	// Total read time (seconds)
	temp2 = 0; 		// Total Unique visitor
	temp3 = 0; 		// Reach: Uniques / Audience size
	temp4 = 0; 		// Teams wherer the reach > 75%
	temp5 = 0;		// Number of intranet pages
	temp6 = 0; 		//  Average article read time

	for (var i in intranetActivitiesToAverage){
		temp1 = temp1 + parseInt(intranetActivitiesToAverage[i].value5) * parseInt(intranetActivitiesToAverage[i].value3);	// Total read time
		temp2 = temp2 + parseInt(intranetActivitiesToAverage[i].value4);	// Unique visitors
		temp3 = temp3 + Number((intranetActivitiesToAverage[i].value4 / intranetActivitiesToAverage[i].value1) * 100);	// Reach
		if (Number((intranetActivitiesToAverage[i].value4 / intranetActivitiesToAverage[i].value1) * 100) > 74){
			temp4++;
		}
		temp5 = temp5 + parseInt(intranetActivitiesToAverage[i].value2);	// Total count of intranet pages
		temp6 = temp6 + parseInt(intranetActivitiesToAverage[i].value5);	// 
	}
	
	if(intranetActivitiesToAverage.length > 0){	
		avergeValues3[0] = intranetActivitiesToAverage.length;						// Number of items in array
		avergeValues3[1] = temp1;												// total time	
		avergeValues3[2] = Math.round(temp6 / intranetActivitiesToAverage.length); 	// Average time
		avergeValues3[3] = temp2;												// Unique visitors
		avergeValues3[4] = (temp3 / intranetActivitiesToAverage.length).toFixed(2);	// Average Reach
		avergeValues3[5] = temp4; 												// Number of stories with reach 85%+
		avergeValues3[6] = temp5; 												// Number of intranet pages

		// left hand colum in the top zone
		theHTML = "<div class=\"summaryChart\">";

		theHTML += "<div class=\"bigentry first\"><div class=\"number\">" + avergeValues3[6] + "</div><div class=\"text\">Core pages</div></div>";
		theHTML += "<div class=\"bigentry second\"><div class=\"number\">" + avergeValues3[3] + "</div><div class=\"text\">Employees</div></div>";		
		theHTML += "</div>";

		// Middle colum in the top zone
		theHTML += "<div class=\"summaryChart1\">";
		theHTML += "	<div class=\"timerimg\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/timer.jpg\"/></div>";
		theHTML += "	<div class=\"timerleft\"><div class=\"big\">" + toHHMMSS(avergeValues3[1]) + "</div><div class=\"small\">Total reading time</div></div>";
		theHTML += "	<div class=\"timerleft\"><div class=\"big\">" + toMMSS(avergeValues3[2]) + "</div><div class=\"small\">Average page reading time</div></div>";		
		theHTML += "</div>";

		// left hand colum in the top zone
		theHTML += "<div class=\"summaryChart2\">";
		theHTML += "<div class=\"reachchart\"><div class=\"overlay\"><div class=\"big\">" + avergeValues3[4] + "%</div></div><canvas id=\"myChart5\" width=\"170\" height=\"170\"></canvas>Reach</div>";
		theHTML += "<div class=\"bottomzone\"><span class=\"big\">" + avergeValues3[5] + "</span><div class=\"small\">> 75% of audience</div></div>";
		theHTML += "</div>";

		$(".intranet .summaryzone").html(theHTML).show();
		
		var pieChartData5 = {
			labels: [
				"Reached",
				"Not reached"
			],
			datasets: [
				{
					data: [avergeValues3[4], 100 - avergeValues3[4]],
					backgroundColor: [
						whatColour(avergeValues3[4]),
						"#d5d1ce"
					]
				}]
		};	
			
		var ctx5 = document.getElementById("myChart5");
		
		var myChart5 = new Chart(ctx5, {
			type: 'doughnut',
			data: pieChartData5,
			options: {
				cutoutPercentage:90,
				legend: {
					display: false,
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips:{
					enabled: false
				}
			}
		});

	}else{
		$(".intranet .summaryzone").html("").hide();
	}	
	
	// ===========================================================================
	// ===========================================================================	
	// 								News articles
	// ===========================================================================
	// ===========================================================================
	var avergeValues4 = [0, 0, 0, 0, 0, 0];
	
	temp1 = 0;  	// Total read time (seconds)
	temp2 = 0; 		// Total Unique visitor
	temp3 = 0; 		// Reach: Uniques / Audience size
	temp4 = 0; 		// Number of artiles with reach > 84%
	temp5 = 0; 		// Avg read time

	for (var i in newsActivitiesToAverage){
		temp1 = temp1 + parseInt(newsActivitiesToAverage[i].value4) * parseInt(newsActivitiesToAverage[i].value2);	// Total read time
		temp2 = temp2 + parseInt(newsActivitiesToAverage[i].value3);	// Unique visitors
		temp3 = temp3 + (Number(newsActivitiesToAverage[i].value3) / Number(newsActivitiesToAverage[i].value1)) * 100;	// Reach

		if (((Number(newsActivitiesToAverage[i].value3) / Number(newsActivitiesToAverage[i].value1)) * 100) > 74){
			//alert("Reach is > 85 : " + temp3);
			temp4++;
		}
		temp5 = temp5 + parseInt(newsActivitiesToAverage[i].value4); 
	
	}
	
	if(newsActivitiesToAverage.length > 0){	
		avergeValues4[0] = newsActivitiesToAverage.length;						// Number of news stories
		avergeValues4[1] = temp1;												// total time	
		avergeValues4[2] = Math.round(temp5 / newsActivitiesToAverage.length); 	// Average time
		avergeValues4[3] = temp2;												// Unique visitors
		avergeValues4[4] = (temp3 / newsActivitiesToAverage.length).toFixed(2);	// Average Reach
		avergeValues4[5] = temp4; 												// Number of stories with reach 85%+
		
		// left hand colum in the top zone
		theHTML = "<div class=\"summaryChart\">";

		theHTML += "<div class=\"bigentry first\"><div class=\"number\">" + avergeValues4[0] + "</div><div class=\"text\">Articles</div></div>";
		theHTML += "<div class=\"bigentry second\"><div class=\"number\">" + avergeValues4[3] + "</div><div class=\"text\">Readers</div></div>";		
		theHTML += "</div>";
		
		// Middle colum in the top zone
		theHTML += "<div class=\"summaryChart1\">";
		theHTML += "	<div class=\"timerimg\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/timer.jpg\"/></div>";
		theHTML += "	<div class=\"timerleft\"><div class=\"big\">" + toHHMMSS(avergeValues4[1]) + "</div><div class=\"small\">Total reading time</div></div>";
		theHTML += "	<div class=\"timerleft\"><div class=\"big\">" + toMMSS(avergeValues4[2]) + "</div><div class=\"small\">Average article reading time</div></div>";		
		theHTML += "</div>";
		
		// left hand colum in the top zone
		theHTML += "<div class=\"summaryChart2\">";
		theHTML += "<div class=\"reachchart\"><div class=\"overlay\"><div class=\"big\">" + avergeValues4[4] + "%</div></div><canvas id=\"myChart4\" width=\"170\" height=\"170\"></canvas>Reach</div>";
		theHTML += "<div class=\"bottomzone\"><span class=\"big\">" + avergeValues4[5] + "</span><div class=\"small\">> 75% of audience</div></div>";
		theHTML += "</div>";
		
		$(".news .summaryzone").html(theHTML).show();		
		
		var pieChartData4 = {
	
		labels: [
				"Reached",
				"Not reached"
			],
			datasets: [
				{
					data: [avergeValues4[4], 100 - avergeValues4[4]],
					backgroundColor: [
						whatColour(avergeValues4[4]),
						"#d5d1ce"
					]
				}]
		};	
			
		var ctx4 = document.getElementById("myChart4");
		
		var myChart4 = new Chart(ctx4, {
			type: 'doughnut',
			data: pieChartData4,
			options: {
				cutoutPercentage:90,
				legend: {
					display: false,
					labels: {
						fontColor: 'rgb(255, 99, 132)'
					}
				},
				tooltips:{
					enabled: false
				}
			}
		});

	}else{
		$(".news .summaryzone").html("").hide();
	}
	
	
	// ===========================================================================
	// ===========================================================================	
	// 								Survey entries
	// ===========================================================================
	// ===========================================================================
	var avergeValues5 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];	
	
	temp1 = 0;  	
	temp2 = 0; 		
	temp3 = 0; 		
	temp4 = 0; 		
	temp5 = 0; 		
	temp6 = 0;  	
	temp7 = 0; 		
	temp8 = 0; 		
	var temp9 = 0; 		
	var temp10 = 0;	
	
	// Do some stuff for the top section of the Survey tab...
	
	for (var i in surveyActivitiesToAverage){
			temp1 = temp1 + parseInt(surveyActivitiesToAverage[i].value1);
			temp2 = temp2 + parseInt(surveyActivitiesToAverage[i].value2);
			temp3 = temp3 + parseInt(surveyActivitiesToAverage[i].value3);
			temp4 = temp4 + parseInt(surveyActivitiesToAverage[i].value4);
			temp5 = temp5 + parseInt(surveyActivitiesToAverage[i].value5);
			temp6 = temp6 + parseInt(surveyActivitiesToAverage[i].value6);
			temp7 = temp7 + parseInt(surveyActivitiesToAverage[i].value7);
			temp8 = temp8 + parseInt(surveyActivitiesToAverage[i].value8);
			temp9 = temp9 + parseInt(surveyActivitiesToAverage[i].value9);
			temp10 = temp10 + parseInt(surveyActivitiesToAverage[i].value10);
	}
	
	if(surveyActivitiesToAverage.length > 0){	
	
	avergeValues5[0] = parseInt((temp1 / surveyActivitiesToAverage.length));
	avergeValues5[1] = parseInt((temp2 / surveyActivitiesToAverage.length));
	avergeValues5[2] = parseInt((temp3 / surveyActivitiesToAverage.length));
	avergeValues5[3] = parseInt((temp4 / surveyActivitiesToAverage.length));
	avergeValues5[4] = parseInt((temp5 / surveyActivitiesToAverage.length));
	avergeValues5[5] = parseInt((temp6 / surveyActivitiesToAverage.length));
	avergeValues5[6] = parseInt((temp7 / surveyActivitiesToAverage.length));
	avergeValues5[7] = parseInt((temp8 / surveyActivitiesToAverage.length));
	avergeValues5[8] = parseInt((temp9 / surveyActivitiesToAverage.length));
	avergeValues5[9] = parseInt((temp10 / surveyActivitiesToAverage.length));

	// left hand colum in the top zone
	theHTML = "<ul>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart0\" width=\"30\" height=\"30\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">1. My manager regularly holds development and career conversations with me</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[0] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart1\" width=\"50\" height=\"50\"></canvas></span>";	
	theHTML += "		<span class=\"thequestion\">2. I have the confidence that GSK has what it takes to beat the competition in the medium to long term</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[1] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart2\" width=\"50\" height=\"50\"></canvas></span>";	
	theHTML += "		<span class=\"thequestion\">3. I feel my business is ambitious</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[2] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart3\" width=\"50\" height=\"50\"></canvas></span>";	
	theHTML += "		<span class=\"thequestion\">4. I enjoy my work</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[3] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart4\" width=\"50\" height=\"50\"></canvas></span>";	
	theHTML += "		<span class=\"thequestion\">5. We celebrate success regularly</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[4] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart5\" width=\"50\" height=\"50\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">6. Considering everything I am satisfied with GSK at present</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[5] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart6\" width=\"50\" height=\"50\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">7. I am proud to work for GSK</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[6] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart7\" width=\"50\" height=\"50\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">8. I rarely think about looking for a new job with a another company</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[7] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart8\" width=\"50\" height=\"50\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">9. I would recommend GSK as a great place to work</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[8] + "%</span>";
	theHTML += "	</li>";
	theHTML += "	<li>";
	theHTML += "		<span class=\"thechart\"><canvas id=\"mySmallChart9\" width=\"50\" height=\"50\"></canvas></span>";
	theHTML += "		<span class=\"thequestion\">10. Leaders in GSK communicate a vision of the future that motivates me</span>";
	theHTML += "		<span class=\"thescore\">" + avergeValues5[9] + "%</span>";
	theHTML += "	</li>";
	
	theHTML += "</ul>";
	
	$(".survey .summaryzone").html(theHTML).show();

	var chart0 = document.getElementById("mySmallChart0");
	var smallPieChartData0 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[0], 100 - avergeValues5[0]], backgroundColor: [whatColour(avergeValues5[0]),"#d5d1ce"]}]};	
	var mySmallChart0 = new Chart(chart0, {type: 'doughnut',data: smallPieChartData0,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});
	
	var chart1 = document.getElementById("mySmallChart1");
	var smallPieChartData1 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[1], 100 - avergeValues5[1]], backgroundColor: [whatColour(avergeValues5[1]),"#d5d1ce"]}]};	
	var mySmallChart1 = new Chart(chart1, {type: 'doughnut',data: smallPieChartData1,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart2 = document.getElementById("mySmallChart2");
	var smallPieChartData2 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[2], 100 - avergeValues5[2]], backgroundColor: [whatColour(avergeValues5[2]),"#d5d1ce"]}]};	
	var mySmallChart2 = new Chart(chart2, {type: 'doughnut',data: smallPieChartData2,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart3 = document.getElementById("mySmallChart3");
	var smallPieChartData3 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[3], 100 - avergeValues5[3]], backgroundColor: [whatColour(avergeValues5[3]),"#d5d1ce"]}]};	
	var mySmallChart3 = new Chart(chart3, {type: 'doughnut',data: smallPieChartData3,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart4 = document.getElementById("mySmallChart4");
	var smallPieChartData4 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[4], 100 - avergeValues5[4]], backgroundColor: [whatColour(avergeValues5[4]),"#d5d1ce"]}]};	
	var mySmallChart4 = new Chart(chart4, {type: 'doughnut',data: smallPieChartData4,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart5 = document.getElementById("mySmallChart5");
	var smallPieChartData5 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[5], 100 - avergeValues5[5]], backgroundColor: [whatColour(avergeValues5[5]),"#d5d1ce"]}]};	
	var mySmallChart5 = new Chart(chart5, {type: 'doughnut',data: smallPieChartData5,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart6 = document.getElementById("mySmallChart6");
	var smallPieChartData6 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[6], 100 - avergeValues5[6]], backgroundColor: [whatColour(avergeValues5[6]),"#d5d1ce"]}]};	
	var mySmallChart1 = new Chart(chart6, {type: 'doughnut',data: smallPieChartData6,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart7 = document.getElementById("mySmallChart7");
	var smallPieChartData7 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[7], 100 - avergeValues5[7]], backgroundColor: [whatColour(avergeValues5[7]),"#d5d1ce"]}]};	
	var mySmallChart7 = new Chart(chart7, {type: 'doughnut',data: smallPieChartData7,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart8 = document.getElementById("mySmallChart8");
	var smallPieChartData8 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[8], 100 - avergeValues5[8]], backgroundColor: [whatColour(avergeValues5[8]),"#d5d1ce"]}]};	
	var mySmallChart8 = new Chart(chart8, {type: 'doughnut',data: smallPieChartData8,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	var chart9 = document.getElementById("mySmallChart9");
	var smallPieChartData9 = {labels: ["X","Y"],datasets: [{data: [avergeValues5[9], 100 - avergeValues5[9]], backgroundColor: [whatColour(avergeValues5[9]),"#d5d1ce"]}]};	
	var mySmallChart1 = new Chart(chart9, {type: 'doughnut',data: smallPieChartData9,options: {cutoutPercentage:60,legend: {display: false,labels: {fontColor: 'rgb(255, 99, 132)'}},tooltips:{enabled: false}}});

	}else{
		$(".survey .summaryzone").html("").hide();
	}
	
	// ============================================================================
	// ============================================================================
	// ===========================  Update summary table ===========================
	// ============================================================================
	// ============================================================================
	
	// Check for blank values
	
	for(var i in avergeValues1){
		avergeValues1[i] = avergeValues1[i] || 0;
	} 	
	for(var i in avergeValues2){
		avergeValues2[i] = avergeValues2[i] || 0;
	} 	
	for(var i in avergeValues3){
		avergeValues3[i] = avergeValues3[i] || 0;
	} 	
	for(var i in avergeValues4){
		avergeValues4[i] = avergeValues4[i] || 0;
	} 	
	for(var i in avergeValues5){
		avergeValues5[i] = avergeValues5[i] || 0;
	} 		
	
	var summaryValues = [];
	
	summaryValues.push(Number(avergeValues1[1]));			// 0 	Event Attendance rate
	summaryValues.push(Number(avergeValues2[1]));			// 1 	Email recipient count
	summaryValues.push(Number(avergeValues2[3]));			// 2 	Email open rate
	summaryValues.push(Number(avergeValues4[5]));			// 3 	News stories with reach 75%+
	summaryValues.push(Number(avergeValues4[0]));			// 4 	Total number of news stories
	summaryValues.push(Number(avergeValues3[4]));			// 5 	Reach of Intranet content
	summaryValues.push(Number(avergeValues4[4]));			// 6 	Reach of news articles content
	summaryValues.push(Number(avergeValues3[3]));			// 7	Uniques on Intranet content
	summaryValues.push(Number(avergeValues4[3]));			// 8	Uniques on news articles
	summaryValues.push(0);
	
	compoundMeasures = [];
	compoundMeasures.push(parseInt((summaryValues[3] / summaryValues[4]) * 100));
	compoundMeasures.push(parseInt((summaryValues[5] + summaryValues[6]) / 2));
	for(var i in compoundMeasures){
		if(isNaN(compoundMeasures[i])){
			compoundMeasures[i] = 0;
		}
	} 
	
	summaryValues.push(parseInt((summaryValues[0] * weightings[0].Awareness[1].First) + (summaryValues[2] * weightings[0].Awareness[2].Second) + (compoundMeasures[0] * weightings[0].Awareness[3].Third) + (compoundMeasures[1] * weightings[0].Awareness[4].Fourth)));	
	
	summaryValues.push(Number(avergeValues2[8]));			// 11 	Intranet Core content %
	summaryValues.push(Number(avergeValues2[11]));			// 12 	Total number of email activities (including content)
	summaryValues.push(Number(avergeValues2[10]));			// 13 	Total number of FULL email activities (excluding content)
	summaryValues.push(Number(avergeValues3[1]));			// 14 	Total time (secs) on Intranet core content
	summaryValues.push(Number(avergeValues4[1]));			// 15 	Total time (secs) on news articles
	summaryValues.push(Number(avergeValues1[4]));			// 16 	Average retention score
	summaryValues.push(Number(avergeValues5[0]));			// 17 	Survey score Question 1
	summaryValues.push(0);
	summaryValues.push(0);
	
	compoundMeasures = [];
	compoundMeasures.push(((summaryValues[12] - summaryValues[13])/summaryValues[12])*100);
	for(var i in compoundMeasures){
		if(isNaN(compoundMeasures[i])){
			compoundMeasures[i] = 0;
		}
	} 	
		
	summaryValues.push(parseInt((summaryValues[11] * weightings[1].Familiarity[1].First) + (compoundMeasures[0] * weightings[1].Familiarity[2].Second) + (summaryValues[16] * weightings[1].Familiarity[3].Third) + (summaryValues[17] * weightings[1].Familiarity[4].Fourth)));
	
	summaryValues.push(Number(avergeValues1[5]));			// 21 	Event Average Relevance
	summaryValues.push(Number(avergeValues5[2]));			// 22	Survey Question 
	summaryValues.push(Number(avergeValues5[3]));			// 23
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	
	summaryValues.push(parseInt((avergeValues1[5] * weightings[2].Likeability[1].First) + (avergeValues5[2] * weightings[2].Likeability[2].Second) + (avergeValues5[3] * weightings[2].Likeability[3].Third)));			// 16	
	
	summaryValues.push(Number(avergeValues1[0]));			// 31	Number of leader led engagements
	summaryValues.push(Number(avergeValues1[6]));			// 32	Average Pulse check
	summaryValues.push(Number(avergeValues5[1]));			// 33
	summaryValues.push(Number(avergeValues5[4]));			// 34
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);	
	summaryValues.push(0);	
	summaryValues.push(parseInt((avergeValues1[6] * weightings[3].Participation[1].First) + (avergeValues5[1] * weightings[3].Participation[2].Second) + (avergeValues5[4] * weightings[3].Participation[3].Third)));			// 40	
	
	summaryValues.push(Number(avergeValues1[7]));			// 41	Average Motivated score
	summaryValues.push(Number(avergeValues5[5]));			// 42
	summaryValues.push(Number(avergeValues5[6]));			// 43
	summaryValues.push(Number(avergeValues5[7]));			// 44
	summaryValues.push(Number(avergeValues5[9]));			// 45
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);	
	summaryValues.push(parseInt((avergeValues1[7] * weightings[4].Endorsement[1].First) + (avergeValues5[5] * weightings[4].Endorsement[2].Second) + (avergeValues5[6] * weightings[4].Endorsement[3].Third) + (avergeValues5[7] * weightings[4].Endorsement[4].Fourth) + (avergeValues5[9] * weightings[4].Endorsement[5].Fifth)));			// 50
	
	summaryValues.push(Number(avergeValues5[8]));			// 51	Average Motivated score
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);
	summaryValues.push(0);	
	summaryValues.push(parseInt((avergeValues5[8] * weightings[5].Advocacy[1].First)));			// 60
	
	for(var i in summaryValues){
		summaryValues[i] = summaryValues[i] || 0;
	} 
	
	$(".KPIs div ul").hide();
	
	// ===============================   Awareness  ===============================
	
	$(".KPIs > div:nth-child(1)").find("ul li:nth-child(1) .detail").html(summaryValues[0] + "% event attendance rate");
	$(".KPIs > div:nth-child(1)").find("ul li:nth-child(2) .detail").html(summaryValues[1] + " emails sent");
	$(".KPIs > div:nth-child(1)").find("ul li:nth-child(3) .detail").html(summaryValues[2] + "% email open rate");
	$(".KPIs > div:nth-child(1)").find("ul li:nth-child(4) .detail").html(summaryValues[3] + " news articles opened by > 75%");
	$(".KPIs > div:nth-child(1)").find("ul li:nth-child(5) .detail").html((summaryValues[7] + summaryValues[8]) + " unique users on core content");
	
	var awarenessScore = summaryValues[10];
	help(summaryValues[10]);
	help(weightings[0].Awareness[0].Overall);
	
	// Calculate a total score for Awareness based on these values
	$("div.specialrow > div:nth-child(1)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(awarenessScore));
	
	// ===============================   Familiarity  ===============================
	
	$(".KPIs > div:nth-child(2)").find("ul li:nth-child(1) .detail").html(summaryValues[11] + "% contains key content");
	$(".KPIs > div:nth-child(2)").find("ul li:nth-child(2) .detail").html((summaryValues[12] - summaryValues[13]) + " bundling opportunites used");
	$(".KPIs > div:nth-child(2)").find("ul li:nth-child(3) .detail").html(toHHMMSS(summaryValues[14] + summaryValues[15]) + " time on content");
	$(".KPIs > div:nth-child(2)").find("ul li:nth-child(4) .detail").html(summaryValues[16] + "% retention score");
	$(".KPIs > div:nth-child(2)").find("ul li:nth-child(5) .detail").html(summaryValues[17] + "% of employees have career conversations with managers");
	
	var familiarityScore = summaryValues[20];	
	
	// Calculate a total score for Familiarity based on these values
	$("div.specialrow > div:nth-child(2)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(familiarityScore));	
	
	// ===============================   Likeability  ===============================
	
	$(".KPIs > div:nth-child(3)").find("ul li:nth-child(1) .detail").html(summaryValues[21] + "% relevance score");
	$(".KPIs > div:nth-child(3)").find("ul li:nth-child(2) .detail").html(summaryValues[22] + "% feel their business is ambitious");
	$(".KPIs > div:nth-child(3)").find("ul li:nth-child(3) .detail").html(summaryValues[23] + "% enjoy their work");

	var likeabilityScore = summaryValues[30];
	
	// Calculate a total score for Familiarity based on these values
	$("div.specialrow > div:nth-child(3)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(likeabilityScore));	
	
	// ===============================   Participation  ===============================
	
	$(".KPIs > div:nth-child(4)").find("ul li:nth-child(1) .detail").html(summaryValues[31] + " leader led engagements");
	$(".KPIs > div:nth-child(4)").find("ul li:nth-child(2) .detail").html(summaryValues[32] + "% pulse score");
	$(".KPIs > div:nth-child(4)").find("ul li:nth-child(3) .detail").html(summaryValues[33] + "% confident we can beat competiton");
	$(".KPIs > div:nth-child(4)").find("ul li:nth-child(4) .detail").html(summaryValues[34] + "% celebrate success regularly");
	
	var participationScore = summaryValues[40];
	
	// Calculate a total score for Familiarity based on these values
	$("div.specialrow > div:nth-child(4)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(participationScore));

	// ===============================   Endorsement  ===============================
	
	$(".KPIs > div:nth-child(5)").find("ul li:nth-child(1) .detail").html(summaryValues[41] + "% motivation score");
	$(".KPIs > div:nth-child(5)").find("ul li:nth-child(2) .detail").html(summaryValues[42] + "% satisfied with GSK");
	$(".KPIs > div:nth-child(5)").find("ul li:nth-child(3) .detail").html(summaryValues[43] + "% proud to work at GSK");
	$(".KPIs > div:nth-child(5)").find("ul li:nth-child(4) .detail").html(summaryValues[44] + "% rarely look for jobs elsewhere");
	$(".KPIs > div:nth-child(5)").find("ul li:nth-child(5) .detail").html(summaryValues[45] + "% leaders vision motivates me");
	
	var endorsementScore = summaryValues[50];

	// Calculate a total score for Familiarity based on these values
	$("div.specialrow > div:nth-child(5)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(endorsementScore));
	
	// ===============================   Advocacy  ===============================
	
	$(".KPIs > div:nth-child(6)").find("ul li:nth-child(1) .detail").html(summaryValues[51] + "% would recommend GSK to others");

	var advocacyScore = summaryValues[60];

	// Calculate a total score for Familiarity based on these values
	$("div.specialrow > div:nth-child(6)").removeClass("red").removeClass("orange").removeClass("green").addClass(phaseColour(advocacyScore));	
	
	// Update charts on the left..
	
	$(".KPIs > div ul li").hover(function(){
		$(this).addClass("green");
		$(this).find(".detail").hide();
		$(this).find(".description").show();
	}, function(){
		$(this).removeClass("green");
		$(this).find(".detail").show();
		$(this).find(".description").hide();		
	});

	
	$(".KPIs div ul").fadeIn(1500);
	populateLeftColumn(awarenessScore, familiarityScore, likeabilityScore, participationScore, endorsementScore, advocacyScore);
	
}

// ==============================================================================
// ==============================================================================
//              Functions for adding activities to SP List
// ==============================================================================
// ==============================================================================

function addActivity(type){

	var newDate = moment(activityEntry[1]).format("YYYY-MM-DD");

	// Force it to a GMT time zone stamp
	var newPubDate = moment(newDate + "T00:00Z").format();
	
	var newDate1 = moment(activityEntry[16]).format("YYYY-MM-DD");

	// Force it to a GMT time zone stamp
	var newPubDate1 = moment(newDate1 + "T00:00Z").format();	
	
	$().SPServices({
		webURL:"https://connect.gsk.com/sites/Cx",
		operation: "UpdateListItems",
		async: false,
		batchCmd: "New",
		listName: "Measurement Dashboard - Inputs",
		valuepairs: [["ID", 1], ["Title", activityEntry[0]], ["BU_x0020_ID", activityEntry[5]], ["BU_x0020_Name", activityEntry[4]], ["Activity_x0020_Date", newPubDate], ["Activity_x0020_type", type], ["Notes", activityEntry[3]], ["Value_x0020_1", activityEntry[6]], ["Value_x0020_2", activityEntry[7]], ["Value_x0020_3", activityEntry[8]], ["Value_x0020_4", activityEntry[9]], ["Value_x0020_5", activityEntry[10]], ["Value_x0020_6", activityEntry[11]], ["Value_x0020_7", activityEntry[12]], ["Value_x0020_8", activityEntry[13]], ["Value_x0020_9", activityEntry[14]], ["Value_x0020_10", activityEntry[15]]],
		completefunc: function (xData, Status) {
			// refresh the view in the background...
			getMainViewData($( ".controls-month option:selected" ).val());
			activityEntry = [];
			
			// Rest the form - all of them..
			$(".remodal-leader .buselectorplaceholder select option:first").attr('selected','selected');
			$(".remodal-leader input[name='activity']").val("");
			$(".remodal-leader input[name='date']").val("");
			$(".remodal-leader textarea[name='topics']").val("");
			$(".remodal-leader textarea[name='notes']").val("");
			$(".remodal-leader input[name='invited']").val("");
			$(".remodal-leader input[name='attended']").val("");
			$(".remodal-leader input[name='retention']").val("");
			$(".remodal-leader input[name='relevance']").val("");
			$(".remodal-leader input[name='Pulsecheck']").val("");
			$(".remodal-leader input[name='motivation']").val("");
			
			$(".remodal-email .buselectorplaceholder select option:first").attr('selected','selected');
			$(".remodal-email .optional select option:first").attr('selected','selected');
			$(".remodal-email div.innerbutton").removeClass("clicked");
			$(".remodal-email input[name='activity']").val("");
			$(".remodal-email input[name='date']").val("");
			$(".remodal-email textarea[name='topics']").val("");
			$(".remodal-email textarea[name='notes']").val("");
			$(".remodal-email input[name='delivered']").val("");
			$(".remodal-email input[name='openrate']").val("");
			$(".remodal-email input[name='ctr']").val("");
			$(".remodal-email input[name='numberofitems']").val("");
			$(".remodal-email input[name='numberofcoreitems']").val("");
			$(".remodal-email input[name='relevancy']").val("");
			
			$(".remodal-news .buselectorplaceholder select option:first").attr('selected','selected');
			$(".remodal-news input[name='article']").val("");
			$(".remodal-news input[name='date']").val("");
			$(".remodal-news textarea[name='topics']").val("");
			$(".remodal-news textarea[name='notes']").val("");
			$(".remodal-news input[name='maxaudience']").val("");
			$(".remodal-news input[name='pageviews']").val("");
			$(".remodal-news input[name='uniquevisitors']").val("");
			$(".remodal-news input[name='averagetime']").val("");
			
			$(".remodal-intranet .buselectorplaceholder select option:first").attr('selected','selected');
			$(".remodal-intranet input[name='date']").val("");
			$(".remodal-intranet textarea[name='notes']").val("");
			$(".remodal-intranet input[name='corecontentnumber']").val("");
			$(".remodal-intranet input[name='pageviews']").val("");
			$(".remodal-intranet input[name='uniquevisitors']").val("");
			$(".remodal-intranet input[name='averagetime']").val("");		

			$(".remodal-survey .buselectorplaceholder select option:first").attr('selected','selected');
			$(".remodal-survey input[name='date']").val("");
			$(".remodal-survey textarea[name='notes']").val("");
			$(".remodal-survey input[name='survey1']").val("");			
			$(".remodal-survey input[name='survey2']").val("");
			$(".remodal-survey input[name='survey3']").val("");
			$(".remodal-survey input[name='survey4']").val("");
			$(".remodal-survey input[name='survey5']").val("");
			$(".remodal-survey input[name='survey6']").val("");
			$(".remodal-survey input[name='survey7']").val("");
			$(".remodal-survey input[name='survey8']").val("");
			$(".remodal-survey input[name='survey9']").val("");
			$(".remodal-survey input[name='survey10']").val("");
			
		}
	});

}
function moveToNextPanel(currentPanelID, activityType){

	// Validate the panel
	var errors = validatePanel(activityType, currentPanelID)
	if(errors != ""){
		alert("Oops - something's wrong:\n\n" + errors);
	}else{		
		$(".remodal-" + activityType + " .innercontent .panel" + currentPanelID).hide();
		currentPanelID = parseInt(currentPanelID);
		currentPanelID++;
		$(".remodal-" + activityType + " .innercontent .panel" + currentPanelID).show();
	}
}
function moveToPreviousPanel(currentPanelID, activityType){
		
		$(".remodal-" + activityType + " .innercontent .panel" + currentPanelID).hide();
		currentPanelID = parseInt(currentPanelID);
		currentPanelID--;
		$(".remodal-" + activityType + " .innercontent .panel" + currentPanelID).show();	
}
function validatePanel(type, panel){
	var theHTML = "";
	switch (type){
		
		// ============================================================================================
		// ============================================================================================
		// ============================  Validating leader led input  =================================
		// ============================================================================================
		// ============================================================================================
		
		case "leader":
			if(panel == "1"){
				if($(".remodal-leader input[name='activity']").val() == ""){
					theHTML += "Please add an activity name\n";
				}
				if($(".remodal-leader input[name='date']").val() == ""){
					theHTML += "Please add an activity date\n";
				}
			}
			if(panel == "2"){
				
				var value1 = Number($(".remodal-leader input[name='invited']").val());
				var value2 = Number($(".remodal-leader input[name='attended']").val());
				
				if(isNaN(value1) || ($(".remodal-leader input[name='invited']").val().length == 0)){
					theHTML += "Please add the number of people who were invited\n";
				}
				if(isNaN(value2) || ($(".remodal-leader input[name='attended']").val().length == 0)){
					theHTML += "Please add the number of people who attended\n";
				}

			}

			if(panel == "3"){
				
				var value4 = Number($(".remodal-leader input[name='retention']").val());
				var value5 = Number($(".remodal-leader input[name='relevance']").val());
				var value6 = Number($(".remodal-leader input[name='Pulsecheck']").val());
				var value7 = Number($(".remodal-leader input[name='motivation']").val());
				
				if(isNaN(value4) || ($(".remodal-leader input[name='retention']").val().length == 0)){
					theHTML += "Please add a rentention score\n";
				}
				if(isNaN(value5) || ($(".remodal-leader input[name='relevance']").val().length == 0)){
					theHTML += "Please add a relevance score\n";
				}
				if(isNaN(value6) || ($(".remodal-leader input[name='Pulsecheck']").val().length == 0)){
					theHTML += "Please add a Pulse check\n";
				}
				if(isNaN(value7) || ($(".remodal-leader input[name='motivation']").val().length == 0)){
					theHTML += "Please add a motivation score\n";
				}
				if(value4 > 100){
					theHTML += "The retention score is a percentage - the max value is 100\n";
				}
				if(value5 > 100){
					theHTML += "The relevance score is a percentage - the max value is 100\n";
				}
				if(value6 > 100){
					theHTML += "The pulse score is a percentage - the max value is 100\n";
				}
				if(value7 > 100){
					theHTML += "The motivation score is a percentage - the max value is 100\n";
				}				
				
			}
			
		break;
		
		// ============================================================================================
		// ============================================================================================
		// =================================  Validating email input  =================================
		// ============================================================================================
		// ============================================================================================		
		
		case "email":
		
			if(panel == "1"){
				if(emailPopupSelected == ""){
					theHTML += "Please select one of the two options\n";
				}
				if(noPriorEmails == true && emailPopupSelected == "content"){
					theHTML += "There are no existing emails\n";
				}
			}
			
			if(panel == "2"){
				if(emailPopupSelected == "email"){
					if($(".remodal-email input[name='activity']").val() == ""){
						theHTML += "Please add an activity name\n";
					}
					if($(".remodal-email input[name='date']").val() == ""){
						theHTML += "Please add an activity date\n";
					}
				}
			}

			if(panel == "3"){
				
				var value4 = Number($(".remodal-email input[name='delivered']").val());
				var value5 = Number($(".remodal-email input[name='openrate']").val());
				var value6 = Number($(".remodal-email input[name='ctr']").val());				
				var value7 = Number($(".remodal-email input[name='numberofitems']").val());
				var value8 = Number($(".remodal-email input[name='numberofcoreitems']").val());
				var value9 = Number($(".remodal-email input[name='relevancy']").val());				
				
				if(isNaN(value4) || ($(".remodal-email input[name='delivered']").val().length == 0)){
					theHTML += "Please add the number of emails delivered\n";
				}
				if(isNaN(value5) || ($(".remodal-email input[name='openrate']").val().length == 0)){
					theHTML += "Please add the open rate for your population\n";
				}
				if(isNaN(value6) || ($(".remodal-email input[name='ctr']").val().length == 0)){
					theHTML += "Please add the Click Through Rate (CTR)\n";
				}
				if(isNaN(value7) || ($(".remodal-email input[name='numberofitems']").val().length == 0)){
					theHTML += "Please add the number of content items present\n";
				}
				if(isNaN(value8) || ($(".remodal-email input[name='numberofcoreitems']").val().length == 0)){
					theHTML += "Please add the number of CORE content items present\n";
				}
				if(isNaN(value9) || ($(".remodal-email input[name='relevancy']").val().length == 0)){
					theHTML += "Please add the relevancy score from the email survey/feedback\n";
				}			

				if(value5 > 100){
					theHTML += "The open rate is a percentage - the max value is 100\n";
				}
				if(value6 > 100){
					theHTML += "The click through rate is a percentage - the max value is 100\n";
				}
				if(value9 > 100){
					theHTML += "The relevance score is a percentage - the max value is 100\n";
				}					
				
			}		
		
		break;
		
		// ============================================================================================
		// ============================================================================================
		// ==============================  Validating Intranet input  =================================
		// ============================================================================================
		// ============================================================================================		
		
		case "intranet":

			if(panel == "1"){

				if($(".remodal-intranet input[name='date']").val() == ""){
					theHTML += "Please add an activity date\n";
				}
			}
			
			if(panel == "2"){
				var value0 = Number($(".remodal-intranet input[name='maxaudience']").val());
				var value1 = Number($(".remodal-intranet input[name='corecontentnumber']").val());
				var value2 = Number($(".remodal-intranet input[name='pageviews']").val());
				var value3 = Number($(".remodal-intranet input[name='uniquevisitors']").val());
				var value4 = Number($(".remodal-intranet input[name='averagetime']").val());

				if(isNaN(value0) || ($(".remodal-intranet input[name='maxaudience']").val().length == 0)){
					theHTML += "Please enter your audience size\n";
				}				
				if(isNaN(value1) || ($(".remodal-intranet input[name='corecontentnumber']").val().length == 0)){
					theHTML += "Please add the number of pages with core content\n";
				}
				if(isNaN(value2) || ($(".remodal-intranet input[name='pageviews']").val().length == 0)){
					theHTML += "Please add the number of page views on your core content\n";
				}
				if(isNaN(value3) || ($(".remodal-intranet input[name='uniquevisitors']").val().length == 0)){
					theHTML += "Please add the number of unique visitors on your core content\n";
				}
				if(isNaN(value4) || ($(".remodal-intranet input[name='averagetime']").val().length == 0)){
					theHTML += "Please add the average number of seconds on your core content\n";
				}				
			}			
		
		break;
		
		// ============================================================================================
		// ============================================================================================
		// ===========================  Validating News article input  ================================
		// ============================================================================================
		// ============================================================================================			
		
		case "news":
			if(panel == "1"){
				if($(".remodal-news input[name='article']").val() == ""){
					theHTML += "Please add an activity name\n";
				}
				if($(".remodal-news input[name='date']").val() == ""){
					theHTML += "Please add an activity date\n";
				}
			}
			
			if(panel == "2"){

				var value1 = Number($(".remodal-news input[name='maxaudience']").val());
				var value2 = Number($(".remodal-news input[name='pageviews']").val());
				var value3 = Number($(".remodal-news input[name='uniquevisitors']").val());
				var value4 = Number($(".remodal-news input[name='averagetime']").val());

				if(isNaN(value1) || ($(".remodal-news input[name='maxaudience']").val().length == 0)){
					theHTML += "Please add the number of people who you were targetting - i.e. all Consumer Healthcare would be ~16000 people\n";
				}
				if(isNaN(value2) || ($(".remodal-news input[name='pageviews']").val().length == 0)){
					theHTML += "Please add the number of page views your article got\n";
				}
				if(isNaN(value3) || ($(".remodal-news input[name='uniquevisitors']").val().length == 0)){
					theHTML += "Please add the number of unique visitors to your article\n";
				}
				if(isNaN(value4) || ($(".remodal-news input[name='averagetime']").val().length == 0)){
					theHTML += "Please add the average number of seconds people spent reading your article\n";
				}				
			}		

		break;

		// ============================================================================================
		// ============================================================================================
		// ===========================  	Validating Survey input    ================================
		// ============================================================================================
		// ============================================================================================	
		
		case "survey":
		
			if(panel == "1"){
				if($(".remodal-survey input[name='date']").val() == ""){
					theHTML += "Please add an activity date\n";
				}
			}

			if(panel == "2"){
				
				var values = [];

				for (i = 0; i < 5; i++){
					var temp = i;
					temp++;
					values.push(Number($(".remodal-survey input[name='survey" + temp + "']").val()));	
				}
				for (i = 0; i < 5; i++){
					var temp = i;
					temp++;
					if(isNaN(values[i]) || ($(".remodal-survey input[name='survey" + temp + "']").val().length == 0)){
						theHTML += "Question " + temp + " needs a number\n";
					}	
					if(values[i] > 100){
						theHTML += "Question " + temp + " is a percentage - the max value is 100\n";
					}	
				}
			}	

			if(panel == "3"){
				
				var values = [];

				for (i = 0; i < 5; i++){
					var temp = i + 5;
					temp++;
					values.push(Number($(".remodal-survey input[name='survey" + temp + "']").val()));	
				}
				for (i = 0; i < 5; i++){
					var temp = i + 5;
					temp++;
					if(isNaN(values[i]) || ($(".remodal-survey input[name='survey" + temp + "']").val().length == 0)){
						theHTML += "Question " + temp + " needs a number\n";
					}	
					if(values[i] > 100){
						theHTML += "Question " + temp + " is a percentage - the max value is 100\n";
					}	
				}
			}				
		
		break;		

		default:

	}
	return theHTML;
}
function updateEmailDropdown(){
	$(".allemails").empty();
	var theHTML = "";

	for (var i in theDetailData){
		if(theDetailData[i].type == "Email" && theDetailData[i].value10 == "standalone"){
			theHTML += "<option id=\"" + theDetailData[i].id + "\" value=\"" + theDetailData[i].buID + "\">" + theDetailData[i].title + " (" + theDetailData[i].buName + ")</option>";
		}
	}
	
	if(theHTML == ""){
		$(".optional").html("There are no existing emails to associate your content with.");
		noPriorEmails = true;
	}else{
		noPriorEmails = false;
		$(".optional").html("<div class=\"question\">Which email did you contribute to?</div><select class=\"allemails\"></select><div class=\"helper\"></div>");
		$(".allemails").html(theHTML);
	}

}
function populateLeftColumn(var1, var2, var3, var4, var5, var6){

	// Pops the charts on the left hand column

	$(".canvasholder").html("").html('<canvas id="myChart" width="250" height="250"></canvas>');
	$(".canvasholder1").html("").html('<canvas id="myChart1" width="450" height="300"></canvas>');
	$(".leftcolumn .overlay").fadeOut(200);

	// ========================================================================
	// Pie Chart ==============================================================
	// ========================================================================
	
	var overallengagement = parseInt((var1 * weightings[0].Awareness[0].Overall) + (var2 * weightings[1].Familiarity[0].Overall) + (var3 * weightings[2].Likeability[0].Overall) + (var4 * weightings[3].Participation[0].Overall) + (var5 * weightings[4].Endorsement[0].Overall) + (var6 * weightings[5].Advocacy[0].Overall));
	var rounded = Math.round( (overallengagement) ) / 10;
	
	$(".leftcolumn .overlay").fadeOut(200, function(){
		$(".leftcolumn .overlay .thenumber").html(rounded);
		$(".leftcolumn .overlay").fadeIn(2000);
	});	
	
	var pieChartData = {
		labels: [
			"Engaged",
			"Not engaged"
		],
		datasets: [
			{
				data: [rounded, 10 - rounded],
				backgroundColor: [
					whatColour(rounded),
					"#d5d1ce"
				]
			}]
	};	
		
	var ctx = document.getElementById("myChart");
	
	var myChart = new Chart(ctx, {
		type: 'doughnut',
		data: pieChartData,
		options: {
			cutoutPercentage:95,
			legend: {
				display: false,
				labels: {
					fontColor: 'rgb(255, 99, 132)'
				}
			},
			tooltips:{
				enabled: false
			}
		}
	});

	// ========================================================================
	// Bar Chart ==============================================================
	// ========================================================================
	
	var ctx1 = document.getElementById("myChart1");	

	var barData = [];
	barData.push(var1);
	barData.push(var2);
	barData.push(var3);
	barData.push(var4);
	barData.push(var5);
	barData.push(var6);
	
	setTimeout(function() {
	
		var myBarChart = new Chart(ctx1, {
			type: 'bar',
			data: {
				labels: ["Awareness", "Familiarity", "Likeability", "Participation", "Endorsement", "Advocacy"],
				datasets: [{
						labels: ["Awareness", "Familiarity", "Likeability", "Participation", "Endorsement", "Advocacy"],
						backgroundColor: [whatColour(var1),whatColour(var2),whatColour(var3),whatColour(var4),whatColour(var5), whatColour(var6)],
						data: [barData[0], barData[1], barData[2], barData[3], barData[4], barData[5]],			
					}]
			},
			options: {
				legend: {
					display: false
				},
				scales: {
					yAxes: [{
						display: false,
						ticks: {
							beginAtZero:true
						}
					}],
					xAxes: [{
						//display: false
					}]					
				},			
				title: {
					display: false
				}					
			}
		});
	

	}, 700);		
	

}

// ==============================================================================
// ==============================================================================
//                      functions to drive the BU dropdowns
// ==============================================================================
// ==============================================================================

function getDropDownItems(){

	// Populate the months dropdown based on the current date
	renderDateDropDown();

	var Fields = "<ViewFields><FieldRef Name=\"ID\" /><FieldRef Name=\"Title\" /><FieldRef Name=\"Parent_x0020_ID\" /></ViewFields>";
	var CAML = "<Query><OrderBy><FieldRef Name='Sort_x0020_Order' Ascending='True' /></OrderBy></Query>";

	$().SPServices({
		webURL:"https://connect.gsk.com/sites/Cx",
		operation: "GetListItems",
		async: true,
		listName: "Measurement Dashboard - BUs",
		CAMLViewFields: Fields,	
		CAMLQuery: CAML,	
		completefunc: function (xData, Status) {

			var quantity = $(xData.responseXML).SPFilterNode("z:row").length;
			
			$(xData.responseXML).SPFilterNode("z:row").each(function(id) {
				
				var thehtml = "";
				
				theMessage = '{'

				theMessage += '"id":' + JSON.stringify($(this).attr("ows_ID")) + ',';
				theMessage += '"title":' + JSON.stringify($(this).attr("ows_Title")) + ',';
				theMessage += '"parentid":' + JSON.stringify(parseInt($(this).attr("ows_Parent_x0020_ID")), 10);

				theMessage += "}";
				
				var obj = jQuery.parseJSON(theMessage);
				
				dropDownArr.push(obj);

			});

			// Add top level dropdown
			showNextDropDown(0, "GSK", 0);
			
			// Get the data for the main view for the selected month
			getMainViewData($( ".controls-month option:selected" ).val());
			
			// Pre-populate the dropdowns in the input forms with the BUs
			getDropDownItemsForInputForms();
				
		}
	});	
}
function getDropDownItemsForInputForms(){
	var theHTML = "<select>";
	theHTML += eachRecursiveInputForm(0, 0);
	theHTML += "</select>";
	$(".buselectorplaceholder").html(theHTML);
}
function eachRecursiveInputForm(id, level){
	theHTML = "";
	// Check to see if the children of ID has an item to display
	for (var x in dropDownArr) {
		if(dropDownArr[x].parentid == id){
			theHTML += "<option value=\"" + dropDownArr[x].title + "-" + dropDownArr[x].id + "\">" + createIndent(level) + dropDownArr[x].title + "</option>"
			theHTML += eachRecursiveInputForm(dropDownArr[x].id, level + 1);
		}
	}
	return theHTML;
}
function showNextDropDown(currentParent, selectedText, indexSelected){
	
	// Render the navigtion from a flat linked list (using recursive function)
	
	var displaydropdown = false;
	
	for (x = 0 ; x < dropDownArr.length; x++){
		if (parseInt(dropDownArr[x].parentid) == currentParent){
			
			displaydropdown = true;
		}
	}
	
	if(indexSelected != 0 || currentParent== 0){
	
		if(displaydropdown){
			var theHTML = "<select class='controls-bu'>";
			if(currentParent!= 0){
				theHTML += "<option id='" + currentParent + "' value='" + selectedText + "-" + currentParent + "'>All " + selectedText + "</option>";		
			}
			for(i = 0; i < dropDownArr.length; i++){
				if (parseInt(dropDownArr[i].parentid) ==  currentParent){

				theHTML += "<option id='" + dropDownArr[i].id + "' value='" + dropDownArr[i].title + "-" + dropDownArr[i].id + "'>" + dropDownArr[i].title + "</option>";
				}
			}
			theHTML += "</select>";
			
			$(".control-holder").append(theHTML);
			
			dropDownActionListeners();
		}
		
	}
}
function dropDownActionListeners(){
	
	$('.controls-bu').off('change');
	
	$('.controls-bu').on('change', function() {
		$(this).nextAll().remove();
		showNextDropDown($(this).find("option:selected").attr("id"), $(this).find("option:selected").text(), $(this).find("option:selected").index());
		updateMainView();
		
	});
	
	$('.controls-month').off('change');	
	
	$('.controls-month').on('change', function() {
		
		// Get the data for the main view for the selected month
		getMainViewData($(this).val());
	});		
	
}

// =======================================
// =======================================
//    Set the thresholds for the colours
// =======================================
// =======================================

function whatColour(theValue){
	
	var theValueInt = parseInt(theValue);
	var toReturn = "";
	
	if(theValueInt > 74){
		// Green
		toReturn = "#54a41c";
	}else if(theValueInt > 50 && theValueInt < 75){
		// Orange
		toReturn = "#f36633";		
	}else{
		// Red
		toReturn = "#e82a10";
	}
	return toReturn;
}
function whatColourClickRate(theValue){
	
	var theValueInt = parseInt(theValue);
	var toReturn = "";
	
	if(theValueInt > 5){
		// Green
		toReturn = "#54a41c";
	}else if(theValueInt > 2 && theValueInt < 6){
		// Orange
		toReturn = "#f36633";		
	}else{
		// Red
		toReturn = "#e82a10";
	}
	return toReturn;
}
function phaseColour(score){
	
	var toReturn = "";
	
	if(score > 74){
		// Green
		toReturn = "green";
	}else if(score > 50 && score < 75){
		// Orange
		toReturn = "orange";		
	}else{
		// Red
		toReturn = "red";
	}
	return toReturn;	
}

// =======================================
// =======================================
//            Helper functions
// =======================================
// =======================================

function toHHMMSS(seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
function toMMSS(seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}
function addBlankNumber(x){
	if (typeof x == 'undefined'){
		return 0;
	}
	return x;	
}
function addBlankString(x){
	if (typeof x == 'undefined'){
		return " ";
	}
	return x;
}
function fillblanks(){
	
	var theHTML = "";
	for(var i in activityEntry){
		switch (i){
			case 0:
				if(activityEntry[i].length < 1 ){
					theHTML += "Please add an event title";
				}
			break;
			
			default:
		}
		help(activityEntry[i]);
	}
	return theHTML;
}
function addNewItemButtons(){
	$(".leaderled > ul").prepend("<li class=\"addactivity\" type=\"leader\"><a href=\"#leader\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/add.png\"></a></li>");	
	$(".email > ul").prepend("<li class=\"addactivity\" type=\"email\"><a href=\"#email\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/add.png\"></a></li>");	
	$(".intranet > ul").prepend("<li class=\"addactivity\" type=\"intranet\"><a href=\"#intranet\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/add.png\"></a></li>");	
	$(".news > ul").prepend("<li class=\"addactivity\" type=\"news\"><a href=\"#news\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/add.png\"></a></li>");
	$(".survey > ul").prepend("<li class=\"addactivity\" type=\"news\"><a href=\"#survey\"><img src=\"https://connect.gsk.com/sites/Cx/Documents/DigitalComms/Measurement%20Framework/img/add.png\"></a></li>");
}
function createIndent(maxNumber){

	var theText = "";
	for(i = 0; i < maxNumber; i++){
		theText += "       - ";
	}
	theText += " ";

	return theText;
}
function initAllEventListeners(){
// JS code for the tabs...
	
	$('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	})

// ==============================================================================

	// enable the date picker on the input forms..
	$( "#datepicker1" ).datepicker();
	$( "#datepicker2" ).datepicker();
	$( "#datepicker3" ).datepicker();
	$( "#datepicker4" ).datepicker();
	$( "#datepicker5" ).datepicker();
	
	// Event listeners for the save buttons..
	
	$("#save-leader").on("click", function(){
		var errors = validatePanel("leader", "3")
		if(errors != ""){
			alert("Oops - something's wrong:\n\n" + errors);
		}else{
		
			activityEntry.push($(".remodal-leader input[name='activity']").val());
			activityEntry.push($(".remodal-leader input[name='date']").val());
			activityEntry.push($(".remodal-leader textarea[name='topics']").val());
			activityEntry.push($(".remodal-leader textarea[name='notes']").val());
			
			var selectedBU = $(".remodal-leader .buselectorplaceholder select").find("option:selected").val().split("-");
			activityEntry.push(selectedBU[0]);
			activityEntry.push(selectedBU[1]);			
			
			activityEntry.push($(".remodal-leader input[name='invited']").val());
			activityEntry.push($(".remodal-leader input[name='attended']").val());
			activityEntry.push("0");  // used to be the number of questions...
			activityEntry.push($(".remodal-leader input[name='retention']").val());
			activityEntry.push($(".remodal-leader input[name='relevance']").val());
			activityEntry.push($(".remodal-leader input[name='Pulsecheck']").val());
			activityEntry.push($(".remodal-leader input[name='motivation']").val());
			
			// Not using the last 3 slots in the table..
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			
			moveToNextPanel("3", "leader");		
			addActivity("Leader event");
			
		}
	});
	
	$("#save-email").on("click", function(){
		var errors = validatePanel("email", "3")
		if(errors != ""){
			alert("Oops - something's wrong:\n\n" + errors);
		}else{
			
			// If it's a new email... create a new record
			if(emailPopupSelected == "email"){
		
				activityEntry.push($(".remodal-email .thiswasanemail input[name='activity']").val());
				activityEntry.push($(".remodal-email .thiswasanemail input[name='date']").val());
				activityEntry.push($(".remodal-email .thiswasanemail textarea[name='topics']").val());
				activityEntry.push($(".remodal-email .thiswasanemail textarea[name='notes']").val());
				
				var selectedBU = $(".remodal-email .thiswasanemail .buselectorplaceholder select").find("option:selected").val().split("-");
				activityEntry.push(selectedBU[0]);
				activityEntry.push(selectedBU[1]);
				
				activityEntry.push($(".remodal-email input[name='delivered']").val());
				activityEntry.push($(".remodal-email input[name='openrate']").val());
				activityEntry.push($(".remodal-email input[name='ctr']").val());
				activityEntry.push($(".remodal-email input[name='numberofitems']").val());
				activityEntry.push($(".remodal-email input[name='numberofcoreitems']").val());
				activityEntry.push($(".remodal-email input[name='relevancy']").val());

				// Not using the last 4 slots in the table..
				activityEntry.push("-");
				activityEntry.push("-");
				activityEntry.push("-");
				activityEntry.push("standalone");
				
				moveToNextPanel("3", "email");
				addActivity("Email");
			
			}else if (emailPopupSelected == "content"){
				// OR - update the existing record...	
				
				// Lookup the values for the email this content should align to
				
				var emailID = parseInt($(".optional select.allemails option:selected").attr("id"));
				
				for (var i in theDetailData){
					if (emailID == parseInt(theDetailData[i].id)){
						activityEntry.push("Content for - " + theDetailData[i].title);
						activityEntry.push(theDetailData[i].date);						
					}
					
				}
				
				activityEntry.push($(".remodal-email .thiswascontent textarea[name='topics']").val());
				activityEntry.push($(".remodal-email .thiswascontent textarea[name='notes']").val());
				
				var selectedBU = $(".remodal-email .thiswascontent .buselectorplaceholder select").find("option:selected").val().split("-");
				activityEntry.push(selectedBU[0]);
				activityEntry.push(selectedBU[1]);					

				
				activityEntry.push($(".remodal-email input[name='delivered']").val());
				activityEntry.push($(".remodal-email input[name='openrate']").val());
				activityEntry.push($(".remodal-email input[name='ctr']").val());
				activityEntry.push($(".remodal-email input[name='numberofitems']").val());
				activityEntry.push($(".remodal-email input[name='numberofcoreitems']").val());
				activityEntry.push($(".remodal-email input[name='relevancy']").val());

				// Not using the last 4 slots in the table..
				activityEntry.push("-");
				activityEntry.push("-");
				activityEntry.push("-");
				activityEntry.push("content");			
				
				moveToNextPanel("3", "email");
				addActivity("Email");				
				
			}
		}
	});	
	
	$("#save-intranet").on("click", function(){
		var errors = validatePanel("intranet", "2")
		if(errors != ""){
			alert("Oops - something's wrong:\n\n" + errors);
		}else{
		
			var selectedBU = $(".remodal-intranet .buselectorplaceholder select").find("option:selected").val().split("-");
		
			activityEntry.push(selectedBU[0] + " intranet data");
			activityEntry.push($(".remodal-intranet input[name='date']").val());
			activityEntry.push("-"); // No topics for this activity type...
			activityEntry.push($(".remodal-intranet textarea[name='notes']").val());
			activityEntry.push(selectedBU[0]);
			activityEntry.push(selectedBU[1]);
			
			activityEntry.push($(".remodal-intranet input[name='maxaudience']").val());
			activityEntry.push($(".remodal-intranet input[name='corecontentnumber']").val());
			activityEntry.push($(".remodal-intranet input[name='pageviews']").val());
			activityEntry.push($(".remodal-intranet input[name='uniquevisitors']").val());
			activityEntry.push($(".remodal-intranet input[name='averagetime']").val());
			
			// Not using the last 6 slots in the table..
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			
			moveToNextPanel("2", "intranet");		
			addActivity("Intranet");
			
		}
	});		
	
	$("#save-news").on("click", function(){
		var errors = validatePanel("news", "2")
		if(errors != ""){
			alert("Oops - something's wrong:\n\n" + errors);
		}else{			
		
			activityEntry.push($(".remodal-news input[name='article']").val());
			activityEntry.push($(".remodal-news input[name='date']").val());
			activityEntry.push($(".remodal-news textarea[name='topics']").val());
			activityEntry.push($(".remodal-news textarea[name='notes']").val());
			
			var selectedBU = $(".remodal-news .buselectorplaceholder select").find("option:selected").val().split("-");
			activityEntry.push(selectedBU[0]);
			activityEntry.push(selectedBU[1]);			
			
			activityEntry.push($(".remodal-news input[name='maxaudience']").val());
			activityEntry.push($(".remodal-news input[name='pageviews']").val());
			activityEntry.push($(".remodal-news input[name='uniquevisitors']").val());
			activityEntry.push($(".remodal-news input[name='averagetime']").val());
			
			// Not using the last 6 slots in the table..
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			activityEntry.push("-");
			
			moveToNextPanel("2", "news");		
			addActivity("News article");
			
		}
	});	
	
	$("#save-survey").on("click", function(){
		var errors = validatePanel("survey", "3")
		if(errors != ""){
			alert("Oops - something's wrong:\n\n" + errors);
		}else{
				
			var selectedBU = $(".remodal-survey .buselectorplaceholder select").find("option:selected").val().split("-");
		
			activityEntry.push(selectedBU[0] + " survey data");
			activityEntry.push($(".remodal-survey input[name='date']").val());
			activityEntry.push("-"); // No topics for this activity type...
			activityEntry.push($(".remodal-survey textarea[name='notes']").val());
			activityEntry.push(selectedBU[0]);
			activityEntry.push(selectedBU[1]);				
			
			activityEntry.push($(".remodal-survey input[name='survey1']").val());
			activityEntry.push($(".remodal-survey input[name='survey2']").val());
			activityEntry.push($(".remodal-survey input[name='survey3']").val());
			activityEntry.push($(".remodal-survey input[name='survey4']").val());
			activityEntry.push($(".remodal-survey input[name='survey5']").val());
			activityEntry.push($(".remodal-survey input[name='survey6']").val());
			activityEntry.push($(".remodal-survey input[name='survey7']").val());
			activityEntry.push($(".remodal-survey input[name='survey8']").val());
			activityEntry.push($(".remodal-survey input[name='survey9']").val());
			activityEntry.push($(".remodal-survey input[name='survey10']").val());
			
			moveToNextPanel("3", "survey");		
			addActivity("Survey data");
		}
	});		
	
	$(document).on('closed', '.remodal-leader', function (e) {
		if (e.reason == "confirmation"){
			// reset the first panel to be the visible one..
			$(".remodal-leader .innercontent > div").hide();
			$(".remodal-leader .innercontent div.panel1").show();
			$(".innercontent div.activitytypeicon").show();					
		}
	});
	$(document).on('closed', '.remodal-email', function (e) {
		if (e.reason == "confirmation"){
			// reset the first panel to be the visible one..
			$(".remodal-email .innercontent > div").hide();
			$(".remodal-email .innercontent div.panel1").show();	
			$(".innercontent div.activitytypeicon").show();				
		}
	});	
	$(document).on('closed', '.remodal-intranet', function (e) {
		if (e.reason == "confirmation"){
			// reset the first panel to be the visible one..
			$(".remodal-intranet .innercontent > div").hide();
			$(".remodal-intranet .innercontent div.panel1").show();		
			$(".innercontent div.activitytypeicon").show();		
		}
	});
	$(document).on('closed', '.remodal-news', function (e) {
		if (e.reason == "confirmation"){
			// reset the first panel to be the visible one..
			$(".remodal-news .innercontent > div").hide();
			$(".remodal-news .innercontent div.panel1").show();		
			$(".innercontent div.activitytypeicon").show();		
		}
	});		
	$(document).on('closed', '.remodal-survey', function (e) {
		if (e.reason == "confirmation"){
			// reset the first panel to be the visible one..
			$(".remodal-survey .innercontent > div").hide();
			$(".remodal-survey .innercontent div.panel1").show();		
			$(".innercontent div.activitytypeicon").show();		
		}
	});		
	

	
	// Build in the functionality to go and forward within the modal popup
	$("button.next").on("click", function(){
		
		// Custom bit of logic for the Email entry - whether or not it's a full email entry or the conetnt of an email
		if(emailPopupSelected == "email"){
			$(".thiswasanemail").show();
			$(".thiswascontent").hide();
		}else if(emailPopupSelected == "content"){
			$(".thiswasanemail").hide();
			$(".thiswascontent").show();			
		}
		// End of custom work for email
		
		moveToNextPanel($(this).parent().parent().attr("id"), $(this).parent().parent().parent().parent().parent().attr("data-remodal-id"));
	});

	$("button.back").on("click", function(){
		moveToPreviousPanel($(this).parent().parent().attr("id"), $(this).parent().parent().parent().parent().parent().attr("data-remodal-id"))
	});	
	
	// Event listeners fro within modal popup to know if the email entry is rolled up into another entriy
	
	$('.innerbutton').on('click', function() {
		
		$('.innerbutton').removeClass("clicked");
		$(this).addClass("clicked");

		if($(this).hasClass("isemail")){
			
			emailPopupSelected = "email";
			$(this).parent().parent().parent().find(".optional").hide();
		}else{
			
			emailPopupSelected = "content";
			$(this).parent().parent().parent().find(".optional").show();
		}
		
	});	
}
function renderDateDropDown(){
	theHtml = "";	
	for (i = 0; i < 3; i++){
		var newDate = moment().subtract(i, 'month').format('MMMM YYYY');
		theHtml += "<option value=\"" + newDate + "\">" + newDate + "</option>";		
	}
	
	$(".controls-month").html(theHtml);
	
}
function renderVideoPlayer(){
		// Add the details for the videos herein this array.
		
		var videoObjects = [{"title":"Introduction to the framework","description":"Understand the theory","gsktubevideoid":"mrdjjk"}, 
		{"title":"Tool overview","description":"Learn about this tool and what it does","gsktubevideoid":"go7bkd"},
		{"title":"What is it telling me","description":"Learn to read the framework","gsktubevideoid":"c8v0dm"},
		{"title":"Leader led activity","description":"Overview and how to add your leader led activities","gsktubevideoid":"xwdso3"},	
		{"title":"Email activity","description":"Overview and how to add your email data","gsktubevideoid":"xwdso3"},	
		{"title":"Intranet activity","description":"Overview and how to add your intranet data","gsktubevideoid":"xwdso3"},
		{"title":"News articles","description":"Overview and how to add your news article data","gsktubevideoid":"xwdso3"},
		{"title":"Survey data","description":"Overview and how to add your survey data","gsktubevideoid":"xwdso3"}];
		
		var theHTML = "";
		for(var i in videoObjects){
			theHTML += "<img alt=\"" + videoObjects[i].title + "\" src=\"https://gsktube.gsk.com/Video/Media?Id=" + videoObjects[i].gsktubevideoid + "&Type=png\" data-type=\"html5video\" data-image=\"https://gsktube.gsk.com/Video/Media?Id=" + videoObjects[i].gsktubevideoid + "&Type=jpg\" data-videoogv=\"https://gsktube.gsk.com/Video/Media?Id=" + videoObjects[i].gsktubevideoid + "&Type=ogv\" data-videowebm=\"https://gsktube.gsk.com/Video/Media?Id=" + videoObjects[i].gsktubevideoid + "&Type=webm\" data-videomp4=\"https://gsktube.gsk.com/Video/Media?Id=" + videoObjects[i].gsktubevideoid + "&Type=mp4\" data-description=\"" + videoObjects[i].description + "\">";				
		}
	
		$("#gallery").html(theHTML).unitegallery({
			gallery_theme: "video"/*,
			theme_skin:"bottom-text"*/
		});	
}
