Title: Find Nth Visible Cell with VBA - Excel
Date: 2020-04-11
Author: Jack McKew
Category: Excel, VBA
Tags: vba, excel

Excel is the undisputed leader in the spreadsheet world, with over 750 million users worldwide. It is a household name when it comes to analyzing data, so personally I find myself in Excel for most of the work I do. One powerful option that in my experience is underused is formatting as table, this enables users to filter, create slicers, create data links, summarize as pivot tables and more.

One sore point that I've faced in the past is being able to retrieve the first 5 results of the table after filtering, as index-match, vlookup, etc still search within the entire data space of the table, whether the cells are visible or not.

Today, let's go through how to create a function in VBA that anyone in the spreadsheet can access to return the nth visible cell in the table (filtered or not).

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

# Create Function to Find Visible Row

After researching the internet when I came across this problem, I stumbled across a similar question on Stackoverflow:

<https://stackoverflow.com/questions/58381445/how-to-get-value-of-visible-cell-in-a-table-after-filtering-only-working-for-1>

With one of the answers from [Chris Neilsen](https://stackoverflow.com/users/445425/chris-neilsen) being:

``` VBA
Function FindNthVisibleRow(lo As ListObject, Idx As Long) As ListRow
    Dim RwCnt As Long
    Dim lr As ListRow

    If Idx <= 0 Then Exit Function
    For Each lr In lo.ListRows
        If lr.Range.EntireRow.Hidden = False Then
            RwCnt = RwCnt + 1
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
