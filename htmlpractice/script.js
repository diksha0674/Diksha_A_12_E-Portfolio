{/* <html>
  <body>
    <script>
      let day = "monday";
switch (day) {
  case "monday":
    document.write("monday:starting of the week :");
    break;
  case "tuesday":
    document.write("tuesday:second day of the week :");
    break;
  case "wednesday":
    document.write("wednesday:middle week :");
    break;
  case "thursday":
    document.write("thursday:just a little more.. :");
    break;
  case "friday":
    document.write("friday:weekend is just round the corner  :");
    break;
  case "saturday":
    document.write("saturday:fun:");
    break;
  default:
      break;
  }
    </script>
  </body>
</html> 


 */}
 let day = prompt("enter any week day :");

 switch (day.toLowerCase()) {
   case "monday":
     document.write("Monday: Starting of the week");
     break;

   case "tuesday":
     document.write("Tuesday: Second day of the week");
     break;

   case "wednesday":
     document.write("Wednesday: Middle of the week");
     break;

   case "thursday":
     document.write("Thursday: Just a little more...");
     break;

   case "friday":
     document.write("Friday: Weekend is just around the corner");
     break;

   case "saturday":
     document.write("Saturday: Fun!");
     break;

   case "sunday":
     document.write("Sunday: Relax and recharge!");
     break;

   default:
     document.write("Invalid choice enter any other choice ");
 }
