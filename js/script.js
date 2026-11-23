
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
