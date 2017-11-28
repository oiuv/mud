                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: 12 july 1993

CHAPTER 8: The data type "object"

8.1 Review
You should now be able to do anything so long as you stick to calling
functions within your own object.  You should also know, that at the
bare minimum you can get the create() (or reset()) function in your object
called to start just by loading it into memory, and that your reset()
function will be called every now and then so that you may write the
code necessary to refresh your room.  Note that neither of these
functions MUST be in your object.  The driver checks to see if the
function exists in your object first.  If it does not, then it does not
bother.  You are also acquainted with the data types void, int, and string.
 
7.2 Objects as data types
In this chapter you will be acquainted with a more complex data type,
object.  An object variable points to a real object loaded into the
driver's memory.  You declare it in the same manner as other data types:
    object ob;
It differs in that you cannot use +, -, +=, -=, *, or / (what would it
mean to divide a monster by another monster?).  And since efuns like
say() and write() only want strings or ints, you cannot write() or
say() them (again, what would it mean to say a monster?).
But you can use them with some other of the most important efuns on any
LPMud.
 
8.3 The efun: this_object()
This is an efun which returns an object in which the function being executed
exists.  In other words, in a file, this_object() refers to the object your
file is in whether the file gets cloned itself or inherted by another file.
It is often useful when you are writing a file which is getting inherited
by another file.  Say you are writing your own living.c which gets
inherited by user.c and monster.c, but never used alone.  You want to log
the function set_level() it is a player's level being set (but you do not
care if it is a monster.
You might do this:
 
void set_level(int x) {
    if(this_object()->is_player()) log_file("levels", "foo\n");
    level = x;
}
 
Since is_player() is not defined in living.c or anything it inherits,
just saying if(is_player()) will result in an error since the driver
does not find that function in your file or anything it inherits.
this_object() allows you to access functions which may or may not be
present in any final products because your file is inherited by others
without resulting in an error.
 
8.4 Calling functions in other objects
This of course introduces us to the most important characteristic of
the object data type.  It allows us to access functions in other objects.
In previous examples you have been able to find out about a player's level,
reduce the money they have, and how much hp they have.
Calls to functions in other objects may be done in two ways:
 
object->function(parameters)
call_other(object, "function", parameters);
 
example:
this_player()->add_money("silver", -5);
call_other(this_player(), "add_money", "silver", -5);
 
In some (very loose sense), the game is just a chain reaction of function
calls initiated by player commands.  When a player initiates a chain of
function calls, that player is the object which is returned by
the efun this_player().  So, since this_player() can change depending
on who initiated the sequence of events, you want to be very careful
as to where you place calls to functions in this_player().  The most common
place you do this is through the last important lfun (we have mentioned
create() and reset()) init().
 
8.5 The lfun: init()
Any time a living thing encounters an object (enters a new room, or enters
the same room as a certain other object), init() is called in all of
the objects the living being newly encounters.  It is at this point
that you can add commands the player can issue in order to act.
Here is a sample init() function in a flower.
 
void init() {
    ::init();
    add_action("smell_flower", "smell");
}
 
Ito smell_flower().  So you should have smell_flower() look like this:
 
1 int smell_flower(string str);        /* action functions are type int */
2
3 int smell_flower(string str) {
4    if(str != "flower") return 0;     /* it is not the flower being smelled */
5    write("You sniff the flower.\n");
6    say((string)this_player()->query_cap_name()+" smells the flower.\n");
7    this_player()->add_hp(random(5));
8    return 1;
9 }
 
In line 1, we have our function declared.
In line 3, smell_flower() begins.  str becomes whatever comes after the
    players command (not including the first white space).
In line 4, it checks to see if the player had typed "smell flower".  If
    the player had typed "smell cheese", then str would be "cheese".  If
    it is not in fact "flower" which is being smelled, then 0 is returned,
    letting the driver know that this was not the function which should
    have been called.  If in fact the player had a piece of cheese as well
    which had a smell command to it, the driver would then call the function
    for smelling in that object.  The driver will keep calling all functions
    tied to smell commands until one of them returns 1.  If they all return
    0, then the player sees "What?"
In line 5, the efun write() is called.  write() prints the string which
    is passed to it to this_player().  So whoever typed the command here
    sees "You sniff the flower."
In line 6, the efun say() is called.  say() prints the string which is
    doing the sniffing, we have to call the query_cap_name() function
    in this_player().  That way if the player is invis, it will say
    "Someone" (or something like that), and it will also be properly
    capitalized.
In line 7, we call the add_hp() function in the this_player() object,
    since we want to do a little healing for the sniff (Note: do not
    code this object on your mud, whoever balances your mud will shoot you).
In line 8, we return control of the game to the driver, returning 1 to
    let it know that this was in fact the right function to call.
 
8.6 Adding objects to your rooms
And now, using the data type object, you can add monsters to your rooms:
 
void create() {
    ::create();
    set_property("light", 3);
    set("short", "Krasna Square");
    set("long", "Welcome to the Central Square of the town of Praxis.\n");
    set_exits( ({ "d/standard/hall" }), ({ "east" }) );
}
 
void reset() {
    object ob;
 
    ::reset();
    if(present("guard")) return;     /* Do not want to add a guard if */
    ob = new("/std/monster");        /* one is already here           */
    ob->set_name("guard");
    ob->set("id", ({ "guard", "town guard" }) );
    ob->set("short", "Town guard");
    ob->set("long", "He guards Praxis from nothingness.\n");
    ob->set_gender("male");
    ob->set_race("human");
    ob->set_level(10);
    ob->set_alignment(200);
    ob->set_humanoid();
    ob->set_hp(150);
    ob->set_wielding_limbs( ({ "right hand", "left hand" }) );
    ob->move(this_object());
}
 
Now, this will be wildly different on most muds.  Some, as noted before,
in that object so you have a uniquely configured monster object.  The
last act in native muds is to call move() in the monster object to move
it to this room (this_object()).  In compat muds, you call the efun
move_object() which takes two parameters, the object to be moved, and the
object into which it is being moved.
 
8.7 Chapter summary
At this point, you now have enough knowledge to code some really nice
stuff.  Of course, as I have been stressing all along, you really need
to read the documents on building for your mud, as they detail which
functions exist in which types of objects for you to call.  No matter
what your knowledge of the mudlib is, you have enough know-how to
give a player extra things to do like sniffing flowers or glue or whatever.
At this point you should get busy coding stuff.  But the moment things
even look to become tedious, that means it is time for you to move to
the next level and do more.  Right now code yourself a small area.
Make extensive use of the special functions coded in your mud's
room.c (search the docs for obscure ones no one else seems to use).
Add lots o' neat actions.  Create weapons which have magic powers which
gradually fade away.  All of this you should be able to do now.  Once
this becomes routine for you, it will be time to move on to intermediate
stuff.  Note that few people actually get to the intermediate stuff.
If you have played at all, you notice there are few areas on the mud
which do what I just told you you should be able to do.  It is not
because it is hard, but because there is a lot of arrogance out there
on the part of people who have gotten beyond this point, and very little
communicating of that knowledge.  The trick is to push yourself and
think of something you want to do that is impossible.  If you ask someone
in the know how to do X, and they say that is impossible, find out
youself how to code it by experimenting.

George Reese
Descartes of Borg
12 july 1993
borg@hebron.connected.com
Descartes@Nightmare (intermud)
Descartes@Igor (not intermud)
