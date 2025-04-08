
using part2;
using System.Data;
using System.Globalization;

class Program
{
    static void Main()
    {
        try
        {
            // Define file paths
            string filePathCVS = "../../../..//time_series.csv";
            string filePathPARQUET = "../../../..//time_series.parquet";
            string outPutFilePath = "../../../..//Date_and_average.txt";

            // Create file handler
            IFileHandler fileHandler = null;
            Console.WriteLine("Please enter the format of file you want to use (cvs or parquet)");
            string answer = Console.ReadLine()!;

            // Choose file format
            switch (answer)
            {
                case "cvs":
                    fileHandler = new CVSFile(filePathCVS);
                    break;
                case "parquet":
                    fileHandler = new PARQUETFile(filePathPARQUET);
                    break;
                default:
                    throw new Exception("you entered an invalid input");
            }

            // Read data
            DataTable dataTable = fileHandler.Read();

            // Create new table for processed data
            DataTable parsedTable = new DataTable();
            parsedTable.Columns.Add("timestamp", typeof(DateTime));
            parsedTable.Columns.Add("value", typeof(double));
            (DateTime?, double?) singleParsedLine = new();

            // Process each row
            foreach (DataRow row in dataTable.Rows)
            {
                singleParsedLine = IsValidChecking(row);
                if (singleParsedLine.Item1.HasValue && singleParsedLine.Item2.HasValue)
                {
                    DataRow newRow = parsedTable.NewRow();
                    newRow["timestamp"] = singleParsedLine.Item1.Value;
                    newRow["value"] = singleParsedLine.Item2.Value;
                    parsedTable.Rows.Add(newRow);
                }
            }

            // Process and save data
            fileHandler.ProcessData(parsedTable, outPutFilePath);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
        Console.WriteLine("press any key to finish running...");
        Console.ReadKey();
    }

    /// <summary>
    /// Validates and parses a data row
    /// </summary>
    /// <param name="row">The data row to validate</param>
    /// <returns>
    /// A tuple containing:
    /// - Item1: Parsed DateTime or null if invalid
    /// - Item2: Parsed double value or null if invalid
    /// </returns>
    static (DateTime?, double?) IsValidChecking(DataRow? row)
    {

        if (row is null)
            return (null, null);
        // Get row items
        Array listOfItems = row.ItemArray;

        if (listOfItems.Length < 2)
        {
            return (null, null);
        }
        // Define date formats
        string[] formats = { "dd/MM/yyyy HH:mm", "dd/MM/yyyy HH:mm:ss" };
        // Check if second item is a valid number
        bool isDoubleValid = double.TryParse(listOfItems.GetValue(1)!.ToString(), out double doubleValue);
        if (isDoubleValid && double.IsNaN(doubleValue))
        {
            isDoubleValid = false;
        }
        // Check if first item is a valid date
        bool isDateValid = DateTime.TryParseExact(listOfItems.GetValue(0)!.ToString(), formats, new CultureInfo("en-US"),
                                       DateTimeStyles.None, out DateTime parsedDateTime);

        // Return parsed values if both are valid
        if (isDoubleValid && isDateValid)
            return (parsedDateTime, doubleValue);
        // Return null if invalid
        return (null, null);

    }





    //תשובה לשאלה 3:
    //ניתן להוסיף מחלקה אשר תממש קריאה מזרימה ותממש גם היא את הממשק לקריאת קבצים
    //ובכלל באופן כללי לפי המימוש שלי תמיד מתבצעת קריאה שורה אחר שורה,
    //מה שמאפשר גם קריאה בזמן אמת ולא רק קריאה של קבצים סטטיים



    //תיעוד לשאלה 4:
//ישנם כמה יתרונות לשימוש בקבצים אלו:
//קבצים אלו מהירים יותר לקריאה, אפשר לקרוא מתוכם רק את העמודות שצריך ואין צורך דווקא לקרוא את כל הקובץ.
//גם מבחינת זיכרון הם טובים יותר כי אין צורך לטעון את כל הקובץ
//הקובץ מסודר בצורה  יותר מאורגנת ויעילה: ניתן בקלות לקבל את הנתונים הרצויים, ואין צורך עוד לעבוד על הקובץ

   
    
    
    //static void Main()// part A
    //{
    //    string filePath = "../../../..//time_series.csv";

    //    List<KeyValuePair<DateTime, double>> dates = GetListOfDateAndNumber(filePath);

    //    Dictionary<DateTime, double> averagePerHour=GetAveragePerHour(dates);
    //    WriteDataToFile(averagePerHour, "../../../..//Time_Of_Beginning_And_Average.txt");

    //}

    //static (DateTime?, double?) IsValidChecking(string? singleLine)
    //{
    //    if(string.IsNullOrEmpty(singleLine))
    //        return (null, null);
    //    string[] dateAndDouble = singleLine.Split(',');
    //    string[] formats = { "dd/MM/yyyy HH:mm", "dd/MM/yyyy HH:mm:ss" };
    //    bool isDoubleValid = double.TryParse(dateAndDouble[1], out double doubleValue);
    //    if (isDoubleValid && double.IsNaN(doubleValue))
    //    {
    //        isDoubleValid = false;
    //    }
    //    bool isDateValid = DateTime.TryParseExact(dateAndDouble[0], formats, new CultureInfo("en-US"),
    //                                   DateTimeStyles.None, out DateTime parsedDateTime);
    //    if (isDoubleValid && isDateValid)
    //        return (parsedDateTime, doubleValue);
    //    return (null, null);

    //}

    //static List<KeyValuePair<DateTime, double>> GetListOfDateAndNumber(string filePath)
    //{
    //    List<KeyValuePair<DateTime, double>> dates = new();
    //    (DateTime?, double?) singleFormattedLine = new();
    //    string? singleLine;
    //    using (var reader = new StreamReader(filePath))
    //    {
    //        while (!reader.EndOfStream)
    //        {
    //            singleLine = reader.ReadLine();
    //            singleFormattedLine = IsValidChecking(singleLine);
    //            if (singleFormattedLine.Item1.HasValue && singleFormattedLine.Item2.HasValue)
    //                dates.Add(new KeyValuePair<DateTime, double>(singleFormattedLine.Item1.Value, singleFormattedLine.Item2.Value));

    //        }
    //    }
    //    return dates;
    //}

    //static Dictionary<DateTime, double> GetAveragePerHour(List<KeyValuePair<DateTime, double>> dates)
    //{
    //    var averageForHour = dates.GroupBy(date => new DateTime(date.Key.Year, date.Key.Month, date.Key.Day, date.Key.Hour, 0, 0))
    //        .ToDictionary(
    //            group => group.Key,
    //            group => group.Average(date => date.Value)
    //        );

    //    return averageForHour;
    //}


    //public static void WriteDataToFile(Dictionary<DateTime, double> data, string outputPath)
    //{
    //    using (var writer = new StreamWriter(outputPath))
    //    {
    //        string header = string.Format("{0,-10} {1,30}", "Average", "Time of Beginning");
    //        writer.WriteLine(header);
    //        writer.WriteLine(new string('-', header.Length));

    //        foreach (var date in data)
    //        {
    //            string formattedDate = date.Key.ToString("MM/dd/yyyy HH:mm:ss");
    //            string formattedAverage = date.Value.ToString("F2");
    //            writer.WriteLine(string.Format("{0,-30} {1,10}", formattedDate, formattedAverage));
    //        }
    //    }
    //}
}