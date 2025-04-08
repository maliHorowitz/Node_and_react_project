using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

class Program
{
    const int LINES_IN_EACH_FILE = 10000;
    static void Main()
    {
        try
        {
            string filePath = "../../../../logs1.txt";
            Console.WriteLine("Enter a number betwwen 1 and 5 for the amount of the most common Errors:");
            int N = int.Parse(Console.ReadLine()!);
            if (N < 0 || N > 5)
                throw new Exception("invalid number");

            SplitFile(filePath);//Separating to smaller files

            var allCounters = new List<Dictionary<string, int>>();

            
            var partFilePaths = Directory.GetFiles(Directory.GetCurrentDirectory(), "../../../../logs_part_*.txt");

            foreach (string partFilePath in partFilePaths)
            {
                allCounters.Add(CountErrorCodesInFile(partFilePath));//counting the amount of errors per file
            }

            var mergedCounter = MergeCountersFromFiles(allCounters);//merging all the amounts together

            var topNErrorCodes = GetNErrors(mergedCounter, N);//gat the N common errors

            Console.WriteLine($"The {N} most common errors:");
            foreach (var error in topNErrorCodes)
            {
                Console.WriteLine($"{error.Key}: {error.Value}");
            }
        }
        
        catch (FormatException)
        {
            Console.WriteLine("Input could not be converted to an integer.");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
        Console.ReadKey();

    }



    public static void SplitFile(string filePath)//O(K) where K is the length of the oroginal file
    {        
            string outputDirectory = Path.GetDirectoryName(filePath)!;
        using (var reader = new StreamReader(filePath))
            {
                int fileIndex = 0;
                while (!reader.EndOfStream)
                {
                    string outputFilePath = Path.Combine(outputDirectory, $"logs_part_{fileIndex}.txt");
                    using (var writer = new StreamWriter(outputFilePath))
                    {
                        for (int i = 0; i < LINES_IN_EACH_FILE && !reader.EndOfStream; i++)
                        {
                            string line = reader.ReadLine();
                            writer.WriteLine(line);
                        }
                    }
                    fileIndex++;
                }
            }
    }
    public static Dictionary<string, int> CountErrorCodesInFile(string filePath)//O(k*) where k* is the length of  each file. (10000)
    {
        var errorCounter = new Dictionary<string, int>();
        using (var reader = new StreamReader(filePath))
        {
            while (!reader.EndOfStream)
            {
                string line = reader.ReadLine();
                string errorCode = line.Split(", Error: ")[1];
                errorCounter[errorCode] = errorCounter.TryGetValue(errorCode, out int value) ? value + 1 : 1; //adding 1 to the value of this error or starting with 1
            }
        }
        return errorCounter;
    }

    public static Dictionary<string, int> MergeCountersFromFiles(List<Dictionary<string, int>> counters)//O((k/k*)*N) where N is the number of the errors
    {
        var mergedCounter = new Dictionary<string, int>();
        foreach (var counter in counters)
        {
            foreach (var keyAndValue in counter)
            {
                mergedCounter[keyAndValue.Key]=mergedCounter.TryGetValue(keyAndValue.Key, out int value) ?
                    value + keyAndValue.Value : keyAndValue.Value;
            }
        }
        return mergedCounter;
    }

    public static List<KeyValuePair<string, int>> GetNErrors(Dictionary<string, int> counter, int n)//o(NlogN)=o(1) where N is maximum 5
    {
        return counter.OrderByDescending(keyAndVal => keyAndVal.Value).Take(n).ToList();
    }
}




//running time:
//The overall running time of the program is dominated by the steps that process each line of the original file,
//which are splitting the file and counting errors. These steps both have a complexity of 
//O(K)+  where K  is the total number of lines in the original file.
//The merging of error counters is also linear with respect to the number of lines.
//Finding the top N errors is a constant time operation since N is a small fixed number (between 1 and 5).

//Therefore, the overall running time of the program is O(K), where K is the total number of lines in the original file.
//This is because each line in the file is processed a constant number of times.
//But if there are many types of error the running time becomes: O(K) + O(nlogn), where n is the number of the error types

//space complexity:
//o(K) , becouse the total length of all lines is K and no matter how many you split it - there is no extra space (i.e. different complexity of space added throughout the code)
//Therefore the ovverall space complexity is o(K)

