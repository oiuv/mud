                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: 16 june 1993

CHAPTER 2: The LPC Program

2.1 About programs
The title of this chapter of the textbook is actually poorly named, since
one does not write programs in LPC.  An LPC coder instead writes *objects*.
What is the difference?  Well, for our purposes now, the difference is
in the way the file is executed.  When you "run" a program, execution
begins at a definite place in the program.  In other words, there
is a place in all programs that is noted as the beginning where program
execution starts.  In addition, programs have definite end points,
so that when execution reaches that point, the execution of the program
terminates.  So, in short, execution of a program runs from a definite
beginning point through to a definite end point.  This is not so with
LPC objects.

With muds, LPC objects are simply distinct parts of the C program which
is running the game (the driver).  In other words, execution of the mud
program begins and ends in the driver.  But the driver in fact does
very little in the way of creating the world you know when you play
a mud.  Instead, the driver relies heavily on the code created in LPC,
executing lines of the objects in the mud as needed.  LPC objects thus
have no place that is necessarily the beginning point, nor do they
have a definite ending point.

Like other programming languages, an LPC "program" may be made up of
one or more files.  For an LPC object to get executed, it simple
needs to be loaded into the driver's memory.  The driver will call lines
from the object as it needs according to a structure which will be
defined throughout this textbook.  The important thing you need to
understand at this point is that there is no "beginning" to an LPC
object in terms of execution, and there is no "end".

2.2 Driver-mudlib interaction
As I have mentioned earlier, the driver is the C program that runs on
the host machine.  It connects you into the game and processes LPC code.
Note that this is one theory of mud programming, and not necessarily
better than others.  It could be that the entire game is written in C.
Such a game would be much faster, but it would be less flexible in
that wizards could not add things to the game while it was running. This
is the theory behind DikuMUDs.  Instead, LPMUDs run on the theory that
the driver should in no define the nature of the game, that the nature
of the game is to be decided by the individuals involved, and that
you should be able to add to the game *as it is being played*.  This
is why LPMUDs make use of the LPC programming language.  It allows
you to define the nature of the game in LPC for the driver to read and
execute as needed.  It is also a much simpler language to understand
than C, thus making the process of world creation open to a greater
number of people.

Once you have written a file in LPC (assuming it is corrent LPC ), it justs
sits there on the host machine's hard drive until something in the game
makes reference to it.  When something in the game finally does make
reference to the object, a copy of the file is loaded into memory and
a special *function* of that object is called in order to initialize
the values of the variables in the object.  Now, do not be concerned
if that last sentence went right over your head, since someone brand
new to programming would not know what the hell a function or a variable
is.  The important thing to understand right now is that a copy of the
object file is taken by the driver from the machine's hard drive and
stored into memory (since it is a copy, multiple versions of that
object may exist).  You will later understand what a function is, what
a variable is, and exactly how it is something in the game made reference
to your object.

2.3 Loading an object into memory
Although there is no particular place in an object code that must exist
in order for the driver to begin executing it, there is a place for which
the driver will search in order to initialize the object.  On compat 
drivers, it is the function called reset().  On native muds it is the
function called create().

LPC objects are made up of variables (values which can change) and
functions which are used to manipulate those variables.  Functions
manipulate variables through the use of LPC grammatical structures,
which include calling other functions, using externally defined
functions (efuns), and basic LPC expressions and flow control 
mechanisms.

Does that sound convoluted?  First lets start with a variable.  A
variable might be something like: level.  It can "vary" from sitation
to situation in value, and different things use the value of the player's
level to make different things happen.  For instance, if you are a
level 19 player, the value of the variable level will be 19.  Now
if your mud is on the old LPMud 2.4.5 system where levels 1-19 are
players and 20+ are wizards, things can ask for your level value to
see if you can perform wizard type actions.  Basically, each object
in LPC is a pile of variables with values which change over time.
Things happen to these objects based on what values its variables
hold.  Often, then things that happen cause the variables to change.

So, whenever an object in LPC is referenced by another object currently
in memory, the driver searches to see what places for values the
object has (but they have no values yet).  Once that is done, the driver
calls a function in the object called reset() or create() (depending
on your driver) which will set up the starting values for the object's
variables.  It is thus through *calls* to *functions* that variable
values get manipulated.

But create() or reset() is NOT the starting place of LPC code, although
it is where most LPC code execution does begin.  The fact is, those
functions need not exist.  If your object does just fine with its
starting values all being NULL pointers (meaning, for our purposes
here, 0), then you do not need a create() or reset() function.  Thus
the first bit of execution of the object's code may begin somewhere
completely different.

Now we get to what this chapter is all about.  The question: What
consists a complete LPC object?  Well, an LPC object is simply
one or more functions grouped together manipulating 0 or more
variables.  The order in which functions are placed in an object
relative to one another is irrelevant.  In other words:

-----
void init() { add_action("smile", "smile"); }

void create() { return; }

int smile(string str) { return 0; }
-----

is exactly the same as:

-----
void create() { return; }

int smile(string str) { return 0; }

void init() { add_action("smile", "smile"); }
_____

Also important to note, the object containing only:

-----
void nonsense() {}
-----

is a valid, but trivial object, although it probably would not interact
properly with other objects on your mud since such an object has no
weight, is invisible, etc..

2.4 Chapter summary
LPC code has no beginning point or ending point, since LPC code is used
to create objects to be used by the driver program rather than create
individual programs.  LPC objects consist of one or more functions whose
order in the code is irrelevant, as well as of zero or more variables whose
values are manipulated inside those functions.  LPC objects simply sit
on the host machine's hard driver until referenced by another object in
the game (in other words, they do not really exist).  Once the object
is referenced, it is loaded into the machine's memory with empty
values for the variables.  The function reset() in compat muds or
create() in native muds is called in that object if it exists to allow
the variables to take on initial values.  Other functions in the object
are used by the driver and other objects in the game to allow interaction
among objects and the manipulation of the LPC variables.

A note on reset() and create():
create() is only used by muds in native mode (see the textbook Introduction
for more information on native mode vs. compat mode).  It is only used
to initialize newly referenced objects.

reset() is used by both muds in compat mode and native mode.  In compat
mode, reset() performs two functions.  First, it is used to initialize
newly referenced objects.  In addition, however, compat mode muds use
reset() to "reset" the object.  In other words, return it to its initial
state of affairs.  This allows monsters to regenerate in a room and doors
to start back in the shut position, etc..  Native mode muds use reset()
to perform the second function (as its name implies).

So there are two important things which happen in LP style muds which
cause the driver to make calls to functions in objects.  The first is
the creation of the object.  At this time, the driver calls a function
to initalize the values in the object.  For compat mode muds, this
is performed by the function named reset() (with an argument of 0,
more on this later though).  For muds running in native mode, this is
performed by the function create().

The second is the returning of the room to some base state of affairs.
This base set of affairs may or may not be different from the initial
state of affairs, and certainly you would not want to take up time
doing redundant things (like resetting variables that never change).
Compat mode muds nevertheless use the same function that was used to
create the object to reset it, that being reset().  Native mode muds,
who use create() to create the room, instead use reset() to reset it.
All is not lost in compat mode though, as there is a way to tell the
difference between creation and resetting.  For reset purposes, the
driver passes either 1 or the reset number as an argument to reset()
in compat mode.  Now this is meaningless to you now, but just keep in
mind that you can in fact tell the difference in compat mode.  Also
keep in mind that the argment in the creation use of reset is 0 and
the argument in the reset use is a nonzero number.
