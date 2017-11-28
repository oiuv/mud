                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: 01 july 1993

CHAPTER 5: The Basics of Inheritance

5.1 Review
You should now understand the basic workings of functions.  You should be
able to declare and call one.  In addition, you should be able to recognize
function definitions, although, if this is your first experience with LPC,
it is unlikely that you will as yet be able to define your own functions.
There functions form the basic building blocks of LPC objects.  Code
in them is executed when another function makes a call to them.  In making
a call, input is passed from the calling function into the execution of
the called one.  The called function then executes and returns a value
of a certain data type to the calling function.  Functions which return
no value are of type void.

After examining your workroom code, it might look something like this
(depending on the mudlib):

-----
inherit "/std/room";

void create() {
    ::create();
    set_property("light", 2);
    set_property("indoors", 1);
    set("short", "Descartes' Workroom");
    set("long", "This is where Descartes works.\nIt is a cube.\n");
    set_exits( ({ "/d/standard/square" }), ({ "square" }) );
}
-----

If you understand the entire textbook to this point, you should recognize
of the code the following:
    1) create() is the definition of a function (hey! he did not declare it)
    2) It makes calls to set_property(), set(), and set_exits(), none
       of which are declared or defined in the code.
    3) There is a line at the top that is no variable or function declaration
       nor is it a function definition!

This chapter will seek to answer the questions that should be in your head
at this point:
    1) Why is there no declaration of create()?
    2) Where are the functions set_property(), set(), and set_exits() declared
       and defined?
    3) What the hell is that line at the top of the file?

5.2 Object oriented programming
Inheritance is one of the properties which define true object oriented
programming (OOP).  It allows you to create generic code which can be used
in many different ways by many different programs.  What a mudlib does is
create these generalized files (objects) which you use to make very specific
objects.

If you had to write the code necessary for you to define the workroom above,
you would have to write about 1000 lines of code to get all the functionality
of the room above.  Clearly that is a waste of disk space.  In addition,
such code does not interact well with players and other rooms since every
creator is making up his or her own functions to perform the functionality
of a room.  Thus, what you might use to write out the room's long description,
query_long(), another wizard might be calling long().  This is the primary
reason mudlibs are not compatible, since they use different protocols for
object interaction.

OOP overcomes these problems.  In the above workroom, you inherit the
functions already defined in a file called "/std/room.c".  It has all
the functions which are commonly needed by all rooms defined in it.  When
you get to make a specific room, you are taking the general functionality
of that room file and making a unique room by adding your own function,
create().

5.3 How inheritance works
As you might have guessed by now, the line:

-----
inherit "/std/room";
-----

has you inherit the functionality of the room "/std/room.c".  By inheriting
the functionality, it means that you can use the functions which have
been declared and defined in the file "/std/room.c"  In the Nightmare Mudlib,
"/std/room.c" has, among other functions, set_property(), set(), and
set_exits() declared and defined.  In your function create(), you are
making calls to those functions in order to set values you want your
room to start with.  These values make your room different from others, yet
able to interact well with other objects in memory.

In actual practice, each mudlib is different, and thus requires you to use
a different set of standard functions, often to do the same thing.  It is
therefore beyond the scope of this textbook even to describe what
functions exist and what they do.  If your mudlib is well documented,
however, then (probably in /doc/build) you will have tutorials on how
to use the inheritable files to create such objects.  These tutorials
should tell you what functions exist, what input they take, the data
type of their output, and what they do.

5.4 Chapter summary
This is far from a complete explanation of the complex subject of inheritance.
The idea here is for you to be able to understand how to use inheritance in
creating your objects.  A full discussion will follow in a later textbook.
Right now you should know the following:
    1) Each mudlib has a library of generic objects with their own general
       functions used by creators through inheritance to make coding objects
       easier and to make interaction between objects smoother.
    2) The functions in the inheritable files of a mudlib vary from mudlib
       to mudlib.  There should exist documentation on your mud on how to
       use each inheritable file.  If you are unaware what functions are
       available, then there is simply no way for you to use them.  Always
       pay special attention to the data types of the input and the data
       types of ay output.
    3) You inherit the functionality of another object through the line:

-----
inherit "filename";
-----
       
       where filename is the name of the file of the object to be inherited.
       This line goes at the beginning of your code.

Note:
You may see the syntax ::create() or ::init() or ::reset() in places.
You do not need fully to understand at this point the full nuances of this,
but you should have a clue as to what it is. The "::" operator is a way
to call a function specifically in an inherited object (called the scope
resolution operator).  For instance, most muds' room.c has a function
called create().  When you inherit room.c and configure it, you are doing
what is called overriding the create() function in room.c.  This means
that whenever ANYTHING calls create(), it will call *your* version and not
the one in room.c.  However, there may be important stuff in the room.c
version of create().  The :: operator allows you to call the create() in
room.c instead of your create().
An example:

-----
#1

inherit "/std/room";

void create() { create(); }
-----

-----
#2

inherit "/std/room";

void create() { ::create(); }
-----

Example 1 is a horror.  When loaded, the driver calls create(), and then
create() calls create(), which calls create(), which calls create()...
In other words, all create() does is keep calling itself until the driver
detects a too deep recursion and exits.

Example 2 is basically just a waste of RAM, as it is no different from room.c
functionally.  With it, the driver calls its create(), which in turn calls
::create(), the create() in room.c.  Otherwise it is functionally
exactly the same as room.c.
