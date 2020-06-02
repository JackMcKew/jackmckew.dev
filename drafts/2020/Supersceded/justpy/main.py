import justpy as jp

@jp.SetRoute('/hello')
def hello_function():
    wp = jp.WebPage()
    wp.add(jp.P(text='Hello there!', classes='text-5xl m-2'))
    return wp

@jp.SetRoute('/bye')
def bye_function():
    wp = jp.WebPage()
    wp.add(jp.P(text='Goodbye!', classes='text-5xl m-2'))
    return wp


jp.justpy()