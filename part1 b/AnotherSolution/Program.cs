using System.Globalization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AnotherSolution
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string filePath = "../../../..//time_series.csv";
            SplitFile(filePath);//Separating to smaller files
            Dictionary<DateTime, double> averagePerHour = new();
            // List<KeyValuePair<DateTime, double>> dataList = new();
            string[] files = Directory.GetFiles("../../../..//", "time_series_part_*");
            foreach (string file in files)
            {
                var newEntries=GetAveragePerHour(file);

                foreach (var entry in newEntries)
                {
                    averagePerHour[entry.Key] = entry.Value;
                }
            }
            
            WriteDataToFile(averagePerHour, "../../../..//Time_Of_Beginning_And_Average_2.txt");


        }

        public static void SplitFile(string filePath)
        {
           var dates= GetListOfDateAndNumber(filePath);
            var separatedDates = dates.OrderBy(date => date.Key.Date);
            string outputDirectory = Path.GetDirectoryName(filePath);
            int fileIndex = 0;
            foreach (var dateGroup in separatedDates.GroupBy(x => x.Key.Date))
            {
                string outputFilePath = Path.Combine(outputDirectory, $"time_series_part_{fileIndex}.csv");
                using (StreamWriter writer = new StreamWriter(outputFilePath))
                {
                    foreach (var item in dateGroup)
                    {
                        writer.WriteLine($"{item.Key}, {item.Value}");
                    }
                }
                fileIndex++;

            }         
        }


        static (DateTime?, double?) IsValidChecking(string? singleLine)
        {
            if (string.IsNullOrEmpty(singleLine))
                return (null, null);
            string[] dateAndDouble = singleLine.Split(',');
            string[] formats = { "dd/MM/yyyy HH:mm", "dd/MM/yyyy HH:mm:ss" };
            bool isDoubleValid = double.TryParse(dateAndDouble[1], out double doubleValue);
            if (isDoubleValid && double.IsNaN(doubleValue))
            {
                isDoubleValid = false;
            }
            bool isDateValid = DateTime.TryParseExact(dateAndDouble[0], formats, new CultureInfo("en-US"),
                                           DateTimeStyles.None, out DateTime parsedDateTime);
            if (isDoubleValid && isDateValid)
                return (parsedDateTime, doubleValue);
            return (null, null);

        }

        static List<KeyValuePair<DateTime, double>> GetListOfDateAndNumber(string filePath)
        {
            List<KeyValuePair<DateTime, double>> dates = new();
            (DateTime?, double?) singleFormattedLine = new();
            string? singleLine;
            using (var reader = new StreamReader(filePath))
            {
                while (!reader.EndOfStream)
                {
                    singleLine = reader.ReadLine();
                    singleFormattedLine = IsValidChecking(singleLine);
                    if (singleFormattedLine.Item1.HasValue && singleFormattedLine.Item2.HasValue)
                        dates.Add(new KeyValuePair<DateTime, double>(singleFormattedLine.Item1.Value, singleFormattedLine.Item2.Value));

                }
            }
            return dates;
        }

        static Dictionary<DateTime, double> GetAveragePerHour(string filePath)
        {
            var dates = new List<KeyValuePair<DateTime, double>>();

            foreach (var line in File.ReadLines(filePath))
            {
                var parts = line.Split(',');
                if (parts.Length == 2 &&
                    DateTime.TryParseExact(parts[0], "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date) &&
                    double.TryParse(parts[1], out double value))
                {
                    dates.Add(new KeyValuePair<DateTime, double>(date, value));
                }
            }
            var averageForHour = dates.GroupBy(date => new DateTime(date.Key.Year, date.Key.Month, date.Key.Day, date.Key.Hour, 0, 0))
                .ToDictionary(
                    group => group.Key,
                    group => group.Average(date => date.Value)
                );

            return averageForHour;
        }


        public static void WriteDataToFile(Dictionary<DateTime, double> data, string outputPath)
        {
            using (var writer = new StreamWriter(outputPath))
            {
                string header = string.Format("{0,-10} {1,30}", "Average", "Time of Beginning");
                writer.WriteLine(header);
                writer.WriteLine(new string('-', header.Length));

                foreach (var date in data)
                {
                    string formattedDate = date.Key.ToString("MM/dd/yyyy HH:mm:ss");
                    string formattedAverage = date.Value.ToString("F2");
                    writer.WriteLine(string.Format("{0,-30} {1,10}", formattedDate, formattedAverage));
                }
            }
        }

    }
}
