from PIL import Image
import pytesseract


def ocr_convert_to_text(filename):
    return pytesseract.image_to_string(Image.open(filename))


extracted_text = ocr_convert_to_text("images/example_3.jpg")

print(extracted_text)

# def ocr_core(filename):
# """
# This function will handle the core OCR processing of images.
# """
# text = pytesseract.image_to_string(Image.open(filename))  # We'll use Pillow's Image class to open the image and pytesseract to detect the string in the image
# return text

# print(ocr_core('images/example.png'))
