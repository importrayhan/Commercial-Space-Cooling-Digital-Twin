var newOrder = 0;
function WorkingHourCheck(officeStart,startAMPM,officeEnd,endAMPM){
      n = new Date;
      n= Utilities.formatDate(n, "BST", "hh:mm:a");
      //Logger.log(n)
      var regExp = /(\d{1,2})\:(\d{1,2})/;
      
      if(startAMPM==endAMPM){

        if((parseInt(n.replace(regExp, "$1$2")) > parseInt(officeStart.replace(regExp, "$1$2")))
                && (parseInt(n.replace(regExp, "$1$2")) < parseInt(officeEnd.replace(regExp, "$1$2")))){
          return "Yes";
        }
      }
      
      if((startAMPM=="AM") && (endAMPM=="PM")){
        if(n.includes("AM") && (parseInt(n.replace(regExp, "$1$2")) > parseInt(officeStart.replace(regExp, "$1$2")))){
          return "Yes";
        }
      }
      if((startAMPM=="AM") && (endAMPM=="PM")){
        if(n.includes("PM") && (parseInt(n.replace(regExp, "$1$2")) < parseInt(officeEnd.replace(regExp, "$1$2")))){
          return "Yes";
        }
      }
      return "No";
  
}
function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}
function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();
 
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return median;
}
function doGet(e){
 
 var tem = "",
     humid = "",
     room = "",
     mssg="";
 
  try {
 
    // this helps during debuggin
    if (e == null){e={}; e.parameters = {tem:"25",humid:"50",room:"1"};}
 
    tem = e.parameters.tem;
    humid = e.parameters.humid;
    room = e.parameters.room;
    // save the data to spreadsheet

    save_data(tem, humid,room);
    Logger.log(newOrder);
    
    if (newOrder==1){
        newOrder = 0;
        mssg = "on";
    }  
    else mssg = "Wrote:\n  tem: " + tem + "\n  humid: " + humid + "\n room:" + room;
    
    return ContentService.createTextOutput(mssg);
  } catch(error) { 
    Logger.log(error);  
    
    return ContentService.createTextOutput("oops...." + error.message 
                                            + "\n" + new Date() 
                                            + "\ntem: " + tem +
                                            + "\nhumid: " + humid);
  }  
}
 
// Method to save given data to a sheet
function save_data(tem, humid, room){
 
 
  try {
    const key = "add_your_own_link"
    // Paste the URL of the Google Sheets starting from https thru /edit
    // For e.g.: https://docs.google.com/..../edit 
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/<your_own_link>/edit");
    var dataLoggerSheet = ss.getSheetByName("Room"+room);
    var SavingSheet = ss.getSheetByName("saving"+room);
    var wsLocation = ss.getSheetByName("Location")
    var lat  = wsLocation.getRange("B"+room).getValue()
    var lon = wsLocation.getRange("C"+room).getValue()
    metric = "metric"

    var savingpercent = 0;
    var savingunit = 0.0;
    
    var what2do = dataLoggerSheet.getRange("L1").getValue();

    var officeStart = SavingSheet.getRange("N2").getValue();
    var startAMPM = SavingSheet.getRange("O2").getValue()

    var officeEnd = SavingSheet.getRange("P2").getValue();
    var endAMPM = SavingSheet.getRange("Q2").getValue();

    // Satelite Data
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=${metric}`
    const resText = UrlFetchApp.fetch(apiURL).getContentText()
    //console.log(resText)
    const resJSON = JSON.parse(resText)
    //console.log(resText)
    const tempoutside = resJSON["main"]["feels_like"]
    const humidoutside = resJSON["main"]["humidity"]
    
    // Get last edited row from DataLogger sheet
    var row = dataLoggerSheet.getLastRow() + 1;
    //var offset = Number(tempoutside)-Number(tem);
    
    // Calculating elapsed time
    var hour=1000*60*60;
    var t1= dataLoggerSheet.getRange("B"+(row-1)).getValue();
    var t2= new Date;
    var d=t2-t1;
    var elapsed = d/hour;

        
    // Start Populating the data
    //dataLoggerSheet.getRange("A" + row).setValue(row -1); // ID
    dataLoggerSheet.getRange("B" + row).setValue(new Date); // dateTime
    dataLoggerSheet.getRange("C" + row).setValue(tem); // tem
    dataLoggerSheet.getRange("D" + row).setValue(humid); // value
    dataLoggerSheet.getRange("E" + row).setValue(tempoutside); // value
    dataLoggerSheet.getRange("F" + row).setValue(humidoutside); // value
    var tempoffset = (Number(tempoutside))-(Number(tem));
    dataLoggerSheet.getRange("G" + row).setValue(tempoffset); // value
    var active_hour = WorkingHourCheck(officeStart,startAMPM,officeEnd,endAMPM);
    dataLoggerSheet.getRange("H" + row).setValue(active_hour);
    var ACstate = "Off";
    if(Number(tem)<29.5 && Number(humid)<55 ){
      ACstate = "On";
    }
    dataLoggerSheet.getRange("I" + row).setValue(ACstate);
    var humidoffset = (Number(humidoutside))-(Number(humid));
    dataLoggerSheet.getRange("J" + row).setValue(humidoffset);

    var cumelapsed= SavingSheet.getRange("I2").getValue();
    cumelapsed = cumelapsed+elapsed;
    if(cumelapsed>1.0 && cumelapsed<2.0){
        cumelapsed = 0;
        Logger.log("call a func");
            }
    if((cumelapsed)> 2.0){
        cumelapsed = 0.2;
    }
    if(cumelapsed==0){
      SavingSheet.getRange("K2").setValue(row);
      var rowsaving = SavingSheet.getLastRow() + 1;
      SavingSheet.getRange("A" + rowsaving).setValue(new Date);
      var fromwhen = SavingSheet.getRange("K2").getValue();
      //var humidrange = dataLoggerSheet.getRange("D"+fromwhen+":D"+(row-1)).getValues();
      var temprange = dataLoggerSheet.getRange("C"+fromwhen+":C"+(row-1)).getValues();
      //Logger.log(humidrange);
      
      //var lasthourhumid = [].concat.apply([], humidrange);
      var lasthourtemp = [].concat.apply([], temprange);
      var middletemp = median(lasthourtemp);
      //var middlehumid = median(lasthourhumid);
      savingpercent = (middletemp-24)*0.1;
      savingunit = savingpercent*4.42;
      SavingSheet.getRange("B" + rowsaving).setValue(savingpercent);
      SavingSheet.getRange("C" + rowsaving).setValue(savingunit);
      SavingSheet.getRange("D" + rowsaving).setValue(savingunit*5.73);//unit price=5.73

    }        
    SavingSheet.getRange("I2").setValue(cumelapsed);
    if(what2do == "On"){
        newOrder = 1;
        dataLoggerSheet.getRange("L1").setValue("Do Nothing");
    }
    
    //summarySheet.getRange("B1").setValue(dateTime); // Last modified date
    // summarySheet.getRange("B2").setValue(row - 1); // Count 
    
    // Update summary sheet
        
    //Logger.log(middlehumid);    
  }
 
  catch(error) {
    Logger.log(JSON.stringify(error));
  }
 
  Logger.log("--- save_data end---"); 
}
