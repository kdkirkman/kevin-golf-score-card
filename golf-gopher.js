// var numberOfHoles = 18;
var myLocation = {latitude: 40.4426135, longitude: -111.8631116, radius: 100};
var closeCourses;
var selectedCourse;
var totalPar = [];
var tPar = [];
var coursePar;


$(document).ready(function () {
    $.post("https://golf-courses-api.herokuapp.com/courses", myLocation, function (data, status) {
        closeCourses = JSON.parse(data);
        console.log(closeCourses);
        for (var p in closeCourses.courses) {
            $("#courseSelect").append("<option value='" + closeCourses.courses[p].id + "'>" + closeCourses.courses[p].name + "</option>");
        }
    });
});

function loadCourse(theid) {

    $.get("https://golf-courses-api.herokuapp.com/courses/" + theid, function (data, status) {
        selectedCourse = JSON.parse(data).course;
        $("#courseTitle").html(selectedCourse.name);
        $("#courseAddress").html(selectedCourse.addr_1);
        $("#courseCity").html(selectedCourse.city + ', ' + selectedCourse.state_or_province);
        $("#teeType").empty();
        for (var i = 0; i < (selectedCourse.tee_types.length); i++) {
            $("#teeType").append("<option value='" + selectedCourse.tee_types[i].tee_type + "'>" + selectedCourse.tee_types[i].tee_type + "</option>");
        }
        weather(selectedCourse.zip_code);
    });
}

function sumCard(hole) {
    var holeInfo = hole.id.split("_");
    var playerId = holeInfo [0];
    var inTotal = 0;
    var outTotal = 0;

    for (var i = 0; i < selectedCourse.holes.length; i++) {
        if (i===0) {
            totalPar[playerId - 1] = 0;
        }
        console.log($("#" + playerId + '_' + (i + 1)).val());
        var holeValue = parseInt($("#" + playerId + '_' + (i + 1)).val());
        totalPar[playerId-1] += (isNaN(holeValue) ? 0 : holeValue - tPar[i]);
        console.log(totalPar[playerId-1]);
        if (i < 9) {

            inTotal += (isNaN(holeValue) ? 0 : holeValue);

        } else {
            outTotal += (isNaN(holeValue) ? 0 : holeValue);
        }
    }

    var grandTotal = inTotal + outTotal;

    $("#in_" + playerId).val(inTotal);
    $("#out_" + playerId).val(outTotal);
    $("#total_" + playerId).val(grandTotal);
}

function addStuff(hole) {
    var holeInfo = hole.id.split("_");
    var playerId = holeInfo [0];
    var good = "Par : " + coursePar + " " + "<br> Under Par by : " + totalPar[playerId-1] + "<br> Congratulations";
    var horrid = "Par : " + coursePar + " " + "<br> Over Par by : " + totalPar[playerId-1] + "<br> Sorry";

    if (totalPar[playerId-1] > 0){
        console.log("you are over")
        toastr.error(horrid);
    } else {
        toastr.success(good);
    }

}


function begincard() {
    $("#golfBanner").fadeIn();
    $("#playerName").fadeIn();
    var players = $("#playercount").val();
    var teetype = $("#teeType").val();

    for (var j = 0; j < selectedCourse.tee_types.length; j++) {
        console.log("1st" + teetype);
        console.log("2nd" + selectedCourse.tee_types[j].tee_type);


        if (teetype === selectedCourse.tee_types[j].tee_type) {
            coursePar = parseInt(selectedCourse.tee_types[j].par);
            console.log(coursePar);
            console.log("course par found");
            break;

        }
    }


    console.log(selectedCourse);


    for (var i = 0; i < selectedCourse.holes.length; i++) {
        var hole = selectedCourse.holes[i];
        var tees;
        for (var j = 0; j < hole.tee_boxes.length; j++) {
            var teebox = hole.tee_boxes[j];

            if (teebox.tee_type === teetype) {
                console.log("TEETYPE! : " + teebox.tee_type);
                tees = teebox;
                break;
            }
        }
        tPar[i] = parseInt(tees.par);
        $("#tableHeader").append('<th>' + hole.hole_num + '<br> Par: ' + tees.par + '<br> Yards: ' + tees.yards + '<br> HCP: ' + tees.hcp + '</tr>');
        if (hole.hole_num === 9) {
            $("#tableHeader").append('<th>' + 'Total In' + '<br>' + '</tr>')
        }
    }

    if (selectedCourse.holes.length > 9) {
        $("#tableHeader").append('<th>' + 'Total Out' + '</tr>');
    }
    $("#tableHeader").append('<th>' + 'Grand Total' + '</tr>');


    for (var i = 0; i < players; i++) {
        totalPar[i] = 0;
        var playerData = '<tr id="playerlabel' + (i + 1) + '"><td><input size="6" class="number" placeholder="Name" style="text-align: center;" id="id="' + (i + 1) + '"> <span class="glyphicon ' +
            ' glyphicon glyphicon-remove" onclick="removeplayer(' + (i + 1) + ')"></span></td>';

        for (var j = 0; j < selectedCourse.holes.length; j++) {
            playerData += '<td><input style="width: 50px; text-align: center;"' + ((j === 17 || (j === 8 && selectedCourse.holes.length < 10)) ? ' onblur="addStuff(this)"' : '') + ' type="number" min="0" onkeypress="return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57" oninput="sumCard(this)" id="' + (i + 1) + '_' + (j + 1) + '"></td>';
            if (j === 8) {
                playerData += '<td><input style="width: 50px; text-align: center;" type="number" placeholder="IN" readonly id="in_' + (i + 1) + '"></td>';
            } else if (j === 17) {
                playerData += '<td><input style="width: 50px; text-align: center;" type="number" placeholder="OUT" readonly id="out_' + (i + 1) + '"></td>';
            }
        }

        playerData += '<td><input style="width: 75px; text-align: center;" type="number" placeholder="Total" readonly id="total_' + (i + 1) + '"></td>';

        playerData += '</tr>'
        $(".table-striped").append(playerData);
    }


    $(".numeral").blur(function (event) {
        var numeral = $('.numeral');
        var anotherList = [];

        for (var i = 0; i < numeral.length; i++) {
            if (anotherList.includes(numeral[i].value.toUpperCase())) {
                toastr.error('No');
                numeral[i].focus();
                break;
            }
            else if (numeral[i].value) {

                anotherList.push(numeral[i].value.toUpperCase());
            }
        }
    });


    $(".modalbackground").fadeOut();
}

function weather(zip_code) {
    $.simpleWeather({
        location: zip_code,
        woeid: '',
        unit: 'f',
        success: function (weather) {
            html = '<h2><i class="icon-' + weather.code + '"></i> ' + weather.temp + '&deg;' + weather.units.temp + '</h2>';
            html += '<li class="currently">' + weather.currently + '</li>';
            html += '<li>' + weather.wind.direction + ' ' + weather.wind.speed + ' ' + weather.units.speed + '</li></ul>';

            $("#weather").html(html);
        },
        error: function (error) {
            $("#weather").html('<p>' + error + '</p>');
        }
    });
};


function removeplayer(theid) {
    $("#playerlabel" + theid).remove();
}
