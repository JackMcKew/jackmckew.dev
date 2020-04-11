Title: Find Nth Visible Cell with VBA - Excel
Date: 2020-04-11
Author: Jack McKew
Category: Excel, VBA
Tags: vba, excel

Excel is the undisputed leader in the spreadsheet world, with over 750 million users worldwide. It is a household name when it comes to analyzing data, so personally I find myself in Excel for most of the work I do. One powerful option that in my experience is underused is formatting as table, this enables users to filter, create slicers, create data links, summarize as pivot tables and more.

One sore point that I've faced in the past is being able to retrieve the first 5 results of the table after filtering, as index-match, vlookup, etc still search within the entire data space of the table, whether the cells are visible or not.

Today, let's go through how to create a function in VBA that anyone in the spreadsheet can access to return the nth visible cell in the table (filtered or not).

# Working Example

I always love to see what something does & how I could use it before learning how to do it, so here is a GIF of this function in action.

**Application**: If you wanted to get the top 5 results after filtering, you can use this function and change the row index to be 1 through to 5.

The function searches in:

- Sheet Name = `Data Table`
- Table Name = `Table1`
- Row Index = `1` (first visible row)
- Column Index = `3` (Rep)

You should see cell `I2` changing to be whatever the first Rep value visible is.

![Working Function GIF]({ static img/working-function.gif})

# Create a Source Data Table

After googling 'Sample Excel Data', let's just use this data set to built & test our function:

[https://www.contextures.com/xlSampleData01.html](https://www.contextures.com/xlSampleData01.html)

A sample of this data set is:

| OrderDate | Region  | Rep     | Item   | Units | UnitCost | Total  |
|-----------|---------|---------|--------|-------|----------|--------|
| 1/06/2019 | East    | Jones   | Pencil | 95    | 1.99     | 189.05 |
| 1/23/2019 | Central | Kivell  | Binder | 50    | 19.99    | 999.5  |
| 2/09/2019 | Central | Jardine | Pencil | 36    | 4.99     | 179.64 |
| 2/26/2019 | Central | Gill    | Pen    | 27    | 19.99    | 539.73 |
| 3/15/2019 | West    | Sorvino | Pencil | 56    | 2.99     | 167.44 |

Once we've formatted the data source as a table in excel, this should result in:

![Source Data Table]({ static img/source-data-table.png })

# Enable Developer Mode / Macros

This post won't go into how to enable Developer mode/tab, there is many resources on the web for this, such as: <https://support.office.com/en-us/article/show-the-developer-tab-e1192344-5e56-4d45-931b-e5fd9bea2d45>

# Function to Find Visible Row

After researching the internet when I came across this problem, I stumbled across a similar question on Stackoverflow:

<https://stackoverflow.com/questions/58381445/how-to-get-value-of-visible-cell-in-a-table-after-filtering-only-working-for-1>

With one of the answers from [Chris Neilsen](https://stackoverflow.com/users/445425/chris-neilsen) being:

``` VBA
Function FindNthVisibleRow(lo As ListObject, Idx As Long) As ListRow
'The function takes in the Table as a ListObject (lo), and desired row index (Idx) and returns a ListRow
    Dim RwCnt As Long
    Dim lr As ListRow

'Return an error if the desired row index is less than 0
    If Idx <= 0 Then Exit Function

'Loop through each row in the table
    For Each lr In lo.ListRows

        'Check if the row is not hidden (not filtered out)
        If lr.Range.EntireRow.Hidden = False Then

            'Increment current number of rows found
            RwCnt = RwCnt + 1

            'If the current row number matches index, return row (ListRow)
            If Idx = RwCnt Then
                Set FindNthVisibleRow = lr
                Exit For
            End If
        End If
    Next

End Function
```

Fantastic, now we've got a function to locate the row, now we can make another function to determine the cell index and return the desired cell value.

## How to Create Functions

Once you have the Developer tab open, select `Visual Basic` button on the left hand side. This will present you with a window like:

![Visual Basic Window]({ static img/visual-basic.png })

Now, to create a space we're our functions will live, we need to insert a module:

![Visual Basic Window]({ static img/insert-module.png })

This is we're our functions live, copy & paste the above and you'll have made a function!

# Function for Visible Cell

To interface with the above `FindNthVisibleRow` function, we need 3 new variables:

- `sheetName` - The name of the sheet where the table lives. (This is only necessary if you have multiple tables spread across many sheets, as afaik VBA only selects table Objects through the worksheet object)
- `tableName` - The name of the table to return data from
- `iRow` - The row index we want to return
- `iCol` - The column index we want to return

Without further ado, here is the function. Note that another function `GetListObject` is used to find the table in question see [GetListObject Function](#getlistobject-function) for more information on this. Otherwise you can use `Application.Worksheets(sheetName)`.

``` VBA
Function FindNthVisibleCell(sheetName As String, tableName As String, iRow As Long, iCol As Long)

    Application.Volatile True 'This is set to True so the cell recalculates on changes

    Dim lo As ListObject
    Dim rng As Range
    Dim address As String
    Dim cellVal As Variant

    ' GetListObject returns the desired Table object from sheetName & tableName
    Set lo = GetListObject(tableName, Sheets(sheetName))

    'Get the address of the visible Row we want to look in
    address = FindNthVisibleRow(lo, iRow).Range.address

    'Set the desired visible row with address
    Set rng = Worksheets(sheetName).Range(address)

    'Return the cell at the desired column index
    FindNthVisibleCell = rng.Cells(1, iCol).Value


End Function
```

## GetListObject Function

Similarly, the GetListObject function was also found on Stackoverflow, by the user [AndrewD](https://stackoverflow.com/users/20151/andrewd):

<https://stackoverflow.com/questions/18030637/how-do-i-reference-tables-in-excel-using-vba>

``` VBA
Public Function GetListObject(ByVal ListObjectName As String, Optional ParentWorksheet As Worksheet = Nothing) As Excel.ListObject
' Source https://stackoverflow.com/questions/18030637/how-do-i-reference-tables-in-excel-using-vba
On Error Resume Next

    If (Not ParentWorksheet Is Nothing) Then
        Set GetListObject = ParentWorksheet.ListObjects(ListObjectName)
    Else
        Set GetListObject = Application.Range(ListObjectName).ListObject
    End If

On Error GoTo 0 'Or your error handler

    If (Not GetListObject Is Nothing) Then
        'Success
    ElseIf (Not ParentWorksheet Is Nothing) Then
        Call Err.Raise(1004, ThisWorkbook.Name, "ListObject '" & ListObjectName & "' not found on sheet '" & ParentWorksheet.Name & "'!")
    Else
        Call Err.Raise(1004, ThisWorkbook.Name, "ListObject '" & ListObjectName & "' not found!")
    End If

End Function
```
