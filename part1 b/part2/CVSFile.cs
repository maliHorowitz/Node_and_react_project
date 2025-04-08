using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace part2
{
    internal class CVSFile : IFileHandler
    {
        private readonly string _filePath;
        public CVSFile(string filePath)
        {
            _filePath = filePath;
        }

        public DataTable Read()
        {
            try
            {
                var dataTable = new DataTable();
                dataTable.Columns.Add("timestamp", typeof(string));
                dataTable.Columns.Add("value", typeof(string));

                using (var reader = new StreamReader(_filePath))
                {
                    while (!reader.EndOfStream)
                    {
                        string line = reader.ReadLine()!;
                        var values = line.Split(',');
                        var row = dataTable.NewRow();
                        row["timestamp"] = values[0];
                        row["value"] = values.Length > 1 ? values[1] : string.Empty;
                        dataTable.Rows.Add(row);
                    }
                }
                return dataTable;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void ProcessData(DataTable data, string outputFilePath)
        {
            try
            {
                var tableWithAverage = GetAveragePerHour(data);
                Write(tableWithAverage, outputFilePath);
            }
            catch (Exception)
            {
                throw;
            }

        }

        private DataTable GetAveragePerHour(DataTable data)
        {
            DataTable resultTable = new DataTable();
            resultTable.Columns.Add("timestamp", typeof(DateTime));
            resultTable.Columns.Add("value", typeof(double));
            var averageForHour=data.AsEnumerable().GroupBy(row => new DateTime(
            row.Field<DateTime>("timestamp").Year,
            row.Field<DateTime>("timestamp").Month,
            row.Field<DateTime>("timestamp").Day,
            row.Field<DateTime>("timestamp").Hour,
            0, 0)).Select(group => new
            {
                Hour = group.Key,
                AverageValue = group.Average(row => row.Field<double>("value"))
            });
            foreach (var row in averageForHour)
            {
                DataRow newRow = resultTable.NewRow();
                newRow["timestamp"] = row.Hour;
                newRow["value"] = row.AverageValue;
                resultTable.Rows.Add(newRow);

            }
            return resultTable;
        }


        public void Write(DataTable data, string outputFilePath)
        {
            using (var writer = new StreamWriter(outputFilePath))
            {
                string header = string.Format("{0,-10} {1,30}", "Average", "Time of Beginning");
                writer.WriteLine(header);

                foreach (DataRow row in data.Rows)
                {
                    string formattedDate = row.Field<DateTime>("timestamp").ToString("MM/dd/yyyy HH:mm:ss");
                    string formattedAverage = Convert.ToDouble(row["value"]).ToString("F2");
                    writer.WriteLine(string.Format("{0,-30} {1,10}", formattedDate, formattedAverage));
                }
            }
        }   


    }
}
