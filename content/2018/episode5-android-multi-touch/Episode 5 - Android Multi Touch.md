Title: Episode 5 - Android Multi-Touch
Date: 2018-12-21 01:30
Category: Android
Author: admin
Tags: android
Slug: episode-5-android-multi-touch
Status: published

![ezgif.com-video-to-gif-2](..\img\episode-5-android-multi-touch\ezgif.com-video-to-gif-2.gif)

This week's episode of Code Fridays will go into detail on how to handle multi-touch inputs within Android. Firstly to handle the location on where the screen in being touched we need to create a class to handle the interaction. By creating a public class like Finger.java as can be seen below it contains 3 values: x\_pos, y\_pos and id. It is also useful to create a constructor so that other classes can easily construct the Finger class.

``` java
public class Finger
{
    public float x_pos;
    public float y_pos;
    public int id;

    Finger(float init_x,float init_y,int init_id)
    {
        x_pos = init_x;
        y_pos = init_y;
        id = init_id;
    }
}
```

Now that we have a class to store our details on how each finger is touching the screen, we now need to interact with some base level Java. Firstly we need to extend a view within the Android application so that the application knows what boundaries to deal, in my test application, I've just used the entire screen as a view.

After that an array is needed to store the data of multiple inputs touching the screen. I've used a TreeMap in this example as this allows for ease later on so that they are in order on how they were input, however this comes with a downside to this example as lifting a input in the middle of the order touched crashes the array, this will be fixed in a later episode.

A paint is initialized for both the stroke paint for drawing lines between the touches and a paint for the text that is to come. Generic constructors for the view are also listed below.

``` java
public class TouchView extends View {
private TreeMap<Integer, Finger> lineMap = new TreeMap<>();

@SuppressLint("UseSparseArrays")
private HashMap<Integer, Path> fingerMap = new HashMap<>();
private Paint myPaint;
private Paint textPaint;

public TouchView(Context context) {
    super(context);
    init();
}

public TouchView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
    init();
}

public TouchView(Context context, AttributeSet attrs) {
    super(context, attrs);
    init();
}

private void init() {
        myPaint = new Paint();
        myPaint.setStyle(Paint.Style.FILL_AND_STROKE);
        myPaint.setStrokeWidth(5);
        myPaint.setColor(Color.RED);

        textPaint = new Paint();
        textPaint.setTextSize(50);
    }
```

Now that everything is initialized and ready to draw some graphics on the screen so that the application is interactive, now we have to interface with touch events. This is done by creating a new function within our View class, that takes in a MotionEvent on the View so that we can detect different types of touch events. Documentation on this can be found (<https://developer.android.com/training/graphics/opengl/touch#java>).

``` java
@SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getAction() & MotionEvent.ACTION_MASK;
        switch(action) {
            case MotionEvent.ACTION_DOWN : {
                int id = event.getPointerId(0);
                fingerMap.put(id, createCirPath(event.getX(), event.getY(), id));
                lineMap.put(id,createFinger(event.getX(),event.getY(),id));
                break;
            }
            case MotionEvent.ACTION_MOVE : {

                int touchCounter = event.getPointerCount();
                for (int t = 0; t < touchCounter; t++) {
                    int id = event.getPointerId(t);
                    fingerMap.remove(id);
                    lineMap.remove(id);
                    fingerMap.put(id, createCirPath(event.getX(t), event.getY(t), id));
                    lineMap.put(id,createFinger(event.getX(t), event.getY(t), id));
                }
            }
            case MotionEvent.ACTION_POINTER_DOWN : {
                int id = event.getPointerId(getIndex(event));
                fingerMap.put(id, createCirPath(event.getX(getIndex(event)), event.getY(getIndex(event)), getIndex(event)));
                lineMap.put(id,createFinger(event.getX(getIndex(event)), event.getY(getIndex(event)), getIndex(event)));
                break;
            }
            case MotionEvent.ACTION_POINTER_UP : {
                int id = event.getPointerId(getIndex(event));
                fingerMap.remove(id);
                lineMap.remove(id);
                break;
            }
            case MotionEvent.ACTION_UP : {
                int id = event.getPointerId(0);
                fingerMap.remove(id);
                lineMap.remove(id);
                break;
            }
        }

        invalidate();
        return true;
    }

private int getIndex(MotionEvent event) {
        return (event.getAction() & MotionEvent.ACTION_POINTER_INDEX_MASK) >> MotionEvent.ACTION_POINTER_INDEX_SHIFT;
    }

private Finger createFinger(float x, float y, int id)
    {
        return new Finger(x,y,id);
    }
```

Now that we've created a new Finger class inside our TreeMap by the order that the screen is touched in and we're removing that class when the screen input has been released, we are now ready to draw on the screen from our inputs.

By iterating through the TreeMap, in each loop we know what the previous and what the next value in the array we can draw a circle for where the input is and a line between. This also allows us to determine whereabouts is the point in between these two points so we can write text. For this example, I've chosen to write the length of the distance between the two inputs to demonstrate that this can also be dynamic in nature.

``` java
private Path createCirPath(float x, float y, int id) {
        Path p = new Path();
        p.addCircle(x, y, 50, Path.Direction.CW);
        return p;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        for (Integer key : fingerMap.keySet()) {
            Path p = fingerMap.get(key);
            canvas.drawPath(p, myPaint);
        }
        if(lineMap.size() > 1)
        {
            Integer key = lineMap.firstKey();
            for(int i = 0; i < lineMap.size(); i = i + 1)
            {
                Finger start_fin = lineMap.get(key);
                if(key + 1 != lineMap.size()) {
                    Integer new_key = lineMap.higherKey(key);
                    Finger end_fin = lineMap.get(new_key);
                    canvas.drawLine(start_fin.x_pos, start_fin.y_pos, end_fin.x_pos, end_fin.y_pos, myPaint);
                    String lineText = "Length: " + new DecimalFormat("#.##").format(Math.sqrt(Math.pow(end_fin.x_pos - start_fin.x_pos,2) + Math.pow(end_fin.y_pos - start_fin.y_pos,2)));
                    canvas.drawText(lineText,((start_fin.x_pos + end_fin.x_pos) / 2), ((start_fin.y_pos + end_fin.y_pos) / 2),textPaint);
                    key = new_key;
                }
            }
        }
    }
```

In summary, it is quite simple to develop multi-touch interactions between the user and the application to enhance usability and interactivity. This is part of a application that I am developing at the moment and hope to share more insights into development as I progress on.
