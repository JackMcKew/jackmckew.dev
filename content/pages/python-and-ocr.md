Title: Python and OCR
Date: 2019-06-28 06:30
Author: admin
Category: Code Fridays
Slug: python-and-ocr
Status: published

<!-- wp:paragraph -->

This post will demonstrate how to extract the text out of a photo, whether it being handwritten, typed or just a photo of text in the world using Python and OCR (Optical Character Recognition). While this is something that humans do particularly well at distinguishing letters, it is a form of semi-structured data. OCR just like humans also has it's limitations, for example, if you were trying to read someone with really difficult handwriting, it could be a big challenge. In this post, we will use the [Tesseract](https://opensource.google.com/projects/tesseract) engine (an open source Google project) to undertake the OCR process for us.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

First of all, as always, we must create a new virtual environment for our project to live in or use a package manager such as Anaconda (as explained in my post [Episode - 8: Anaconda](https://jmckew.com/2019/01/11/episode-8-anaconda/). Once initialized, we want to install a few packages to help us on our quest for OCR. Both [Pillow](https://pillow.readthedocs.io/en/stable/) and [PyTesseract](https://pypi.org/project/pytesseract/), if you are using Anaconda like I did, you will want to specifically use pip, not conda, to install these packages. Further to this, you will need to install the binary of the Tesseract-OCR engine, which installation instructions can be found: <https://github.com/UB-Mannheim/tesseract/wiki>.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Now we are finally ready to test the engine and see if we can extract text out of an image, first of all we will start with a 'well' written example, the 'logo' of this website!

<!-- /wp:paragraph -->

<!-- wp:image {"id":343,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/06/example.png){.wp-image-343}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Of course, we have still yet to write any code, so naturally, that is the next step. As always in a python project, you will need to import all the dependencies of the project, in this case, it will be Image from the PIL (pillow) package, and pytesseract (the python wrapper around the Tesseract Engine).

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->

``` {.wp-block-syntaxhighlighter-code}
from PIL import Image
import pytesseract
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Now that we have our dependencies loaded, it's time to check out the documentation behind Pillow and pytesseract to know how to operate the tools, consider these an instruction manual. The documentation for these tools can be found:

<!-- /wp:paragraph -->

<!-- wp:list -->

-   [Pillow](https://pillow.readthedocs.io/en/stable/),
-   [PyTesseract](https://pytesseract.readthedocs.io/).

<!-- /wp:list -->

<!-- wp:paragraph -->

Luckily for us, the developers have made this so simple it could be a one liner:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
print(pytesseract.image_to_string(Image.open('images/example.png')))
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Which outputs in the console from the example image above:

<!-- /wp:paragraph -->

<!-- wp:quote -->

> JACK MCKEW'S\
> BLOG\
> Python enthusiast, electrical engineer and\
> tinkerer

<!-- /wp:quote -->

<!-- wp:paragraph -->

Great! We can confirm that the text that the tesseract engine detected, is in fact, exactly what the example we gave it was.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

However, let's go a bit out of the way to make this a function such that it can be called more easily with the filepath to the image as a string.

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
from PIL import Image
import pytesseract

def ocr_convert_to_text(filename):
    text = pytesseract.image_to_string(Image.open(filename))
    return text

extracted_text = ocr_convert_to_text('images/example.png')

print(extracted_text)
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Now we have a function that we can call with a file path to easily convert our images to text. Now let's give the tesseract engine a bit of challenge with a full page of handwritten text:

<!-- /wp:paragraph -->

<!-- wp:image {"id":345,"align":"center"} -->

::: {.wp-block-image}
![[Source](https://graphicdesign.stackexchange.com/questions/96496/imitate-handwritten-text)](https://i2.wp.com/jmckew.com/wp-content/uploads/2019/06/example_2.jpg?fit=640%2C887&ssl=1){.wp-image-345}
:::

<!-- /wp:image -->

<!-- wp:quote -->

> Ad Bb Cc Da Fe FEF Ge Hh Ii IS RR lt Hm We\
> 00 PP Ag Rr SsT\# Uu Vv Ww Xx 44 Le\
> Aa BS (36 72 Re bebe nme \#% Ua ti ke\
> At Au Hee Bo In Fn Le Sim \$y Rep Ha Wy\
> Ye Unu Uppy bb otn tx 79 Ww 2A\
> Sr be Liki 4\
> IR AS67890\
> so cool! New \|neerndtinas release of mast\
> famous APP for exhorting Printed text 40\
> handwritten "Sinyak\
> PacK mY box with. five dozen uguor Jugs\
> Don't 62 @. Earn \$ & Put 12 Jar.\
> Ingredienes: Zuss, Chis, CAR Lid.\
> (Sécrez info), kndw tb. 3\
> Wo xr dA h-(H4+F 060 Cheah\]\
> ChiP & Dae." fava ys ie m4 mind.\
> Jackdaws uve m4 bi? sPhinx Of quare 2.\
> The five boxing withrds JumP quick.\
> How vexiegi quick date 2ebras sump!\
> {0.0} ainsa & crepim pa. bau! -)

<!-- /wp:quote -->

<!-- wp:paragraph -->

Using the same code, we were able to determine most of the text out of the picture that the tesseract engine was given. Obviously this is not perfect, but it is a whole lot easier than typing it all in by hand.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

For a bit of another challenge and to demonstrate the capabilities, let's try some Australian number plates:

<!-- /wp:paragraph -->

<!-- wp:image {"id":347,"align":"center"} -->

::: {.wp-block-image}
![[Source](http://www.worldlicenseplates.com/world/AU_WAXX.html)](https://jmckew.com/wp-content/uploads/2019/06/example_3.jpg){.wp-image-347}
:::

<!-- /wp:image -->

<!-- wp:quote -->

> (CSE) XcB-962 (66M-059\
> X2ZH:709) EEH:133) (GAA729)

<!-- /wp:quote -->

<!-- wp:paragraph -->

Obviously this can and has had a big impact on the way people can utilize images to make their life easier, from scanning in your handwritten notes at school and converting straight on to the computer, to being able to add all the contact information in your phone from a business card. How can OCR help your life at work or at home? Please let me know in the comments..

<!-- /wp:paragraph -->
