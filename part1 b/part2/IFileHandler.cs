using System.Data;

public interface IFileHandler
{
    DataTable Read();
    void Write(DataTable data, string outputFilePath);
    void ProcessData(DataTable data, string outputFilePath);
}