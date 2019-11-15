# Making Executables Installable with Inno Setup

Following on from last week's post on making executable GUIs with Gooey, this post will cover how to make the executables we have packaged up into installable files so our users can run them easily.

Once we have created the executable file for our GUI (which will be located in the dist folder:

![explorer_QxD96RKedI](C:\Users\jackm\Documents\GitHub\blog\content\img\guis-with-gooey-and-pyinstalller\explorer_QxD96RKedI.png)

Now we are going to use a program called Inno Setup, which can be downloaded from: http://www.jrsoftware.org/isinfo.php.

After you've installed Inno Setup, run these commands:

1) Select create a new script file using the Script Wizard

![image-20191106201014701](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201014701.png)

2) Fill in the application information

![image-20191106201132191](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201132191.png)

3) Leave defaults

![image-20191106201214496](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201214496.png)

4) Select the *.exe file found in the dist folder

![image-20191106201302960](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201302960.png)

5) Select shortcut choices

![image-20191106201331420](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201331420.png)

6) Add any license or information files

![image-20191106201402191](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201402191.png)

7) Select install mode

![image-20191106201440980](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201440980.png)

8) Select the languages

![image-20191106201500118](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201500118.png)

9) Provide compiler settings and icon for installable

![image-20191106201550569](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201550569.png)

10) Leave default

![image-20191106201611129](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201611129.png)

11) Compile new script

![image-20191106201634021](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201634021.png)

12) Share around the executable installer!

![image-20191106201801891](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201801891.png)

Once installed, it will now act and behave like any other software installed on your computer!

![image-20191106201903238](C:\Users\jackm\AppData\Roaming\Typora\typora-user-images\image-20191106201903238.png)