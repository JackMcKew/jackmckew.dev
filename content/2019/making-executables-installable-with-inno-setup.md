Title: Making Executables Installable with Inno Setup
Date: 2019-11-08 06:30
Author: Jack McKew
Tags: python
Slug: making-executables-installable-with-inno-setup
Status: published

Following on from last week's post on making executable GUIs with Gooey, this post will cover how to make the executables we have packaged up into installable files so our users can run them easily.

Once we have created the executable file for our GUI (which will be located in the dist folder:

![explorer_QxD96RKedI]({filename}/img/making-executables-installable-with-inno-setup/explorer_QxD96RKedI.png)

Now we are going to use a program called Inno Setup, which can be downloaded from: http://www.jrsoftware.org/isinfo.php.

After you've installed Inno Setup, run these commands:

1) Select create a new script file using the Script Wizard

![image-20191106201014701](\img\making-executables-installable-with-inno-setup\Compil32_TgilJK2vqP.png)

2) Fill in the application information

![image-20191106201132191](\img\making-executables-installable-with-inno-setup\Compil32_KsdsIOEesc.png)

3) Leave defaults

![image-20191106201214496](\img\making-executables-installable-with-inno-setup\Compil32_8fAHgN6kKH.png)

4) Select the *.exe file found in the dist folder

![image-20191106201302960](\img\making-executables-installable-with-inno-setup\Compil32_udpcR1NePw.png)

5) Select shortcut choices

![image-20191106201331420](\img\making-executables-installable-with-inno-setup\Compil32_vDorhKhm29.png)

6) Add any license or information files

![image-20191106201402191](\img\making-executables-installable-with-inno-setup\Compil32_IkMbLdkdaw.png)

7) Select install mode

![image-20191106201440980](\img\making-executables-installable-with-inno-setup\Compil32_dSZd7YfJh8.png)

8) Select the languages

![image-20191106201500118](\img\making-executables-installable-with-inno-setup\Compil32_JYDCWS5x0g.png)

9) Provide compiler settings and icon for installable

![image-20191106201550569](\img\making-executables-installable-with-inno-setup\Compil32_tdbxJXiWgd.png)

10) Leave default

![image-20191106201611129](\img\making-executables-installable-with-inno-setup\Compil32_DUt3rPuZar.png)

11) Compile new script

![image-20191106201634021](\img\making-executables-installable-with-inno-setup\Compil32_8RBmOJvXus.png)

12) Share around the executable installer!

![image-20191106201801891](\img\making-executables-installable-with-inno-setup\explorer_d4QCQTi5sE.png)

Once installed, it will now act and behave like any other software installed on your computer!

![image-20191106201903238](\img\making-executables-installable-with-inno-setup\main_W1DbyAXofL.png)