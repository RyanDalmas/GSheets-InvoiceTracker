const settingsSheet_Name = "Settings";

const recurringSheet_Name = "Recurring Template";
const sideVendorSheet_Name = "Side Vendor Template";

const recordRange = "A4:G";
const copyRecordToRange = "";

const PhoneSetting = "B2";
const PhoneProviderSetting = "B3";

const DueColumn = 3;

const notificationCheck = () => {

  let RecurringSheet;
  let SideVendorSheet;
  let SettingsSheet;

  try {
    RecurringSheet = SpreadsheetApp.getActive().getSheetByName(recurringSheet_Name);

    SideVendorSheet = SpreadsheetApp.getActive().getSheetByName(sideVendorSheet_Name);

    SettingsSheet = SpreadsheetApp.getActive().getSheetByName(settingsSheet_Name);
  } catch (e) { throw new Error(e); }

  if (!RecurringSheet) Logger.log(`Could not access sheet object with name '${recurringSheet_Name}'`);

  if (!SideVendorSheet) Logger.log(`Could not access sheet object with name '${sideVendorSheet_Name}'`);

  const DateOfToday = new Date();
  DateOfToday.setHours(0, 0, 0, 0);


  const checkLateInvoice = (value) => {
    // Check for late invoices (column D: dueDate)
    let localDate = new Date(value[DueColumn]);
    localDate.setHours(0, 0, 0, 0);
    return (localDate.getTime() < DateOfToday.getTime());
  };

  const checkTodayInvoice = (value) => {
    // Check for due tomorrow (column D: dueDate)
    let localDate = new Date(value[DueColumn]);
    localDate.setHours(0, 0, 0, 0);
    return (localDate.getTime() === DateOfToday.getTime());
  };

  const checkTomorrowInvoice = (value) => {
    // Check for due tomorrow (column D: dueDate)
    let localDate = new Date(value[DueColumn]);
    localDate.setHours(0, 0, 0, 0);
    localDate.setDate(localDate.getDate() - 1);
    return (localDate.getTime() === DateOfToday.getTime());
  };

  // CHECK RECURRING SHEET RECORDS
  let Recurring_Values = RecurringSheet.getRange(recordRange).getValues().filter((value) => {
    // Check that Vendor column (B) is not blank!
    return value[1] !== "" && value[0] === false;
  });

  //Logger.log(Recurring_Values.length);

  let Late_Invoices_R = Recurring_Values.filter(checkLateInvoice);
  let Due_Today_R = Recurring_Values.filter(checkTodayInvoice);
  let Due_Tomorrow_R = Recurring_Values.filter(checkTomorrowInvoice);

  // CHECK SIDE VENDOR SHEET RECORDS
  let SideVendor_Values = SideVendorSheet.getRange(recordRange).getValues().filter((value) => {
    // Check that Vendor column (B) is not blank!
    return value[1] !== "" && value[0] === false;
  });

  //Logger.log(SideVendor_Values.length);

  let Late_Invoices_S = SideVendor_Values.filter(checkLateInvoice);
  let Due_Today_S = SideVendor_Values.filter(checkTodayInvoice);
  let Due_Tomorrow_S = SideVendor_Values.filter(checkTomorrowInvoice);

  let Invoices = {
    Late: Late_Invoices_R.concat(Late_Invoices_S),
    Today: Due_Today_R.concat(Due_Today_S),
    Tomorrow: Due_Tomorrow_R.concat(Due_Tomorrow_S)
  };

  //Logger.log(Invoices);

  const FormattedDate = Utilities.formatDate(DateOfToday, Session.getScriptTimeZone(), "MM/dd/yyyy");

  let TextMessage = `Good Morning, it's ${FormattedDate}. Invoices Due:\n`;

  if (Invoices.Late) TextMessage += `Late: ${Invoices.Late.length}\n`
  if (Invoices.Today) TextMessage += `Today: ${Invoices.Today.length}\n`
  if (Invoices.Tomorrow) TextMessage += `Tomorrow: ${Invoices.Tomorrow.length}\n`

  Logger.log(TextMessage);

  const TargetAddress = SettingsSheet.getRange(PhoneSetting).getValue() + SettingsSheet.getRange(PhoneProviderSetting).getValue();

  MailApp.sendEmail(TargetAddress, null, TextMessage);
}
