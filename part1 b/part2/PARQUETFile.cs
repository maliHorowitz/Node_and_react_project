using CsvHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Parquet;
using Parquet.Data;
using Parquet.Schema;

namespace part2
{
    internal class PARQUETFile : IFileHandler
    {
        private readonly string _filePath;

        public PARQUETFile(string filePath)
        {
            _filePath = filePath;
        }



        public DataTable Read()
        {
            return Task.Run(async () => await ReadParquetFileAsync()).Result;
        }

        private async Task<DataTable> ReadParquetFileAsync()
        {
            try
            {
                var dataTable = new DataTable();
                dataTable.Columns.Add("timestamp", typeof(string));
                dataTable.Columns.Add("mean_value", typeof(string));

                using (Stream fileStream = File.OpenRead(_filePath))
                {
                    ParquetReader parquetReader = await ParquetReader.CreateAsync(fileStream);

                    DataField[] dataFields = parquetReader.Schema.GetDataFields();
                    Array? timestamps = null;
                    Array? meanValues = null;

                    for (int i = 0; i < parquetReader.RowGroupCount; i++)
                    {
                        Parquet.Data.DataColumn[] columns = await parquetReader.ReadEntireRowGroupAsync(i);

                        foreach (Parquet.Data.DataColumn column in columns)
                        {
                            if (column.Field.Name == "timestamp")
                            {
                                timestamps = column.Data;
                            }
                            else if (column.Field.Name == "mean_value")
                            {
                                meanValues = column.Data;
                            }
                        }

                        if (timestamps != null && meanValues != null)
                        {
                            for (int j = 0; j < timestamps.Length; j++)
                            {
                                var row = dataTable.NewRow();
                                row["timestamp"] = timestamps.GetValue(j)?.ToString();
                                row["mean_value"] = meanValues.GetValue(j)?.ToString();
                                dataTable.Rows.Add(row);
                            }
                        }
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
            Write(data, outputFilePath);
        }

        public void Write(DataTable data, string outputFilePath)
        {
            try
            {
                using (StreamWriter writer = new StreamWriter(outputFilePath))
                {
                    writer.WriteLine("time of beginning\t average(mean value)");

                    foreach (DataRow row in data.Rows)
                    {
                        string timestamp = row.Field<DateTime>("timestamp").ToString("MM/dd/yyyy HH:mm:ss");
                        string meanValue = Convert.ToDouble(row["value"]).ToString("F2");
                        writer.WriteLine($"{timestamp}\t{meanValue}");
                    }
                }
            }
            catch (Exception )
            {
                throw;
            }
        }
    }
}
