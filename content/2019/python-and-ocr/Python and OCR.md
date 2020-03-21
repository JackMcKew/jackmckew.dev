Title: Python and OCR
Date: 2019-06-28 06:30
Category: Python
Author: Jack McKew
Tags: python, ocr
Slug: python-and-ocr
Status: published

This post will demonstrate how to extract the text out of a photo, whether it being handwritten, typed or just a photo of text in the world using Python and OCR (Optical Character Recognition). While this is something that humans do particularly well at distinguishing letters, it is a form of semi-structured data. OCR just like humans also has it's limitations, for example, if you were trying to read someone with really difficult handwriting, it could be a big challenge. In this post, we will use the [Tesseract](https://opensource.google.com/projects/tesseract) engine (an open source Google project) to undertake the OCR process for us.

First of all, as always, we must create a new virtual environment for our project to live in or use a package manager such as Anaconda (as explained in my post [Episode - 8: Anaconda](https://jackmckew.dev/episode-8-anaconda.html). Once initialized, we want to install a few packages to help us on our quest for OCR. Both [Pillow](https://pillow.readthedocs.io/en/stable/) and [PyTesseract](https://pypi.org/project/pytesseract/), if you are using Anaconda like I did, you will want to specifically use pip, not conda, to install these packages. Further to this, you will need to install the binary of the Tesseract-OCR engine, which installation instructions can be found: <https://github.com/UB-Mannheim/tesseract/wiki>.

Now we are finally ready to test the engine and see if we can extract text out of an image, first of all we will start with a 'well' written example, the 'logo' of this website!

![test_image]({static img/example.png})

Of course, we have still yet to write any code, so naturally, that is the next step. As always in a python project, you will need to import all the dependencies of the project, in this case, it will be Image from the PIL (pillow) package, and pytesseract (the python wrapper around the Tesseract Engine).

``` python
from PIL import Image
import pytesseract
```

Now that we have our dependencies loaded, it's time to check out the documentation behind Pillow and pytesseract to know how to operate the tools, consider these an instruction manual. The documentation for these tools can be found:

- [Pillow](https://pillow.readthedocs.io/en/stable/),
- [PyTesseract](https://pytesseract.readthedocs.io/).

Luckily for us, the developers have made this so simple it could be a one liner:

``` python
print(pytesseract.image_to_string(Image.open('images/example.png')))
```

Which outputs in the console from the example image above:

> JACK MCKEW'S\
> BLOG\
> Python enthusiast, electrical engineer and\
> tinkerer

Great! We can confirm that the text that the tesseract engine detected, is in fact, exactly what the example we gave it was.

However, let's go a bit out of the way to make this a function such that it can be called more easily with the filepath to the image as a string.

``` python
from PIL import Image
import pytesseract

def ocr_convert_to_text(filename):
    text = pytesseract.image_to_string(Image.open(filename))
    return text

extracted_text = ocr_convert_to_text('images/example.png')

print(extracted_text)
```

Now we have a function that we can call with a file path to easily convert our images to text. Now let's give the tesseract engine a bit of challenge with a full page of handwritten text:

![example_2.jpg]({static img/example_2.jpg})

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

Using the same code, we were able to determine most of the text out of the picture that the tesseract engine was given. Obviously this is not perfect, but it is a whole lot easier than typing it all in by hand.

For a bit of another challenge and to demonstrate the capabilities, let's try some Australian number plates:

![example_3.jpg]({static img/example_3.jpg})

> (CSE) XcB-962 (66M-059\
> X2ZH:709) EEH:133) (GAA729)

Obviously this can and has had a big impact on the way people can utilize images to make their life easier, from scanning in your handwritten notes at school and converting straight on to the computer, to being able to add all the contact information in your phone from a business card. How can OCR help your life at work or at home? Please let me know in the comments..
