                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: 17 june 1993

CHAPTER 3: LPC Data Types

3.1 What you should know by now
LPC object are made up of zero or more variables manipulated by one or
more functions.  The order in which these functions appear in code is
irrelevant.  The driver uses the LPC code you write by loading copies of
it into memory whenever it is first referenced and additional copies
through cloning.  When each object is loaded into memory, all the variables
initially point to no value.  The reset() function in compat muds, and
create() in native muds are used to give initial values to variables in
objects.  The function for creation is called immediately after the object
is loaded into memory.  However, if you are reading this textbook with no
prior programming experience, you may not know what a function is or how
it gets called.  And even if you have programming experience, you may
be wondering how the process of functions calling each other gets started
in newly created objects.  Before any of these questions get answered,
however, you need to know more about what it is the functions are
manipulating.  You therefore should thouroughly come to know the concept
behind LPC data types.  Certainly the most boring subject in this manual,
yet it is the most crucial, as 90% of all errors (excepting misplaced
{} and ()) involve the improper usage of LPC data types.  So bear through
this important chapter, because it is my feeling that understanding this
chapter alone can help you find coding much, much easier.

3.2 Communicating with the computer
You possibly already know that computers cannot understand the letters
and numbers used by humans.  Instead, the "language" spoken by computers
consists of an "alphabet" of 0's and 1's.  Certainly you know computers
do not understand natural human languages.  But in fact, they do not
understand the computer languages we write for them either.  Computer
languages like BASIC, C, C++, Pascal, etc. are all intermediate
languages.  They allow you to structure your thoughts more coherently
for translation into the 0's and 1's of the computer's languages.

There are two methods in which translation is done: compilation and
interpretation.  These simply are differences betweem when the 
programming language is translated into computer language.  With
compiled languages, the programmer writes the code then uses a program
called a compiler to translate the program into the computer's
language.  This translation occurs before the program is run.  With
interpreted languages however, the process of translation occurs as
the program is being run.  Since the translation of the program is
occurring during the time of the program's running in interpreted
languages, interpreted languages make much slower programs than
compiled languages.

The bottom line is, no matter what language you are writing in, at
some point this has to be changed into 0's and 1's which can be
understood by the computer.  But the variables which you store in
memory are not simply 0's and 1's.  So you have to have a way in
your programming languages of telling the computer whether or not
the 0's and 1's should be treated as decimal numbers or characters or
strings or anything else.  You do this through the use of data types.

For example, say you have a variable which you call 'x' and you give
it the decimal whole number value 65.  In LPC you would do this through
the statement:

-----
x = 65;
-----

You can later do things like:

_____
write(x+"\n");        /* \n is symbolically represents a carriage return */
y = x + 5;
-----

The first line allows you to send 65 and a carriage return to someone's screen.
The second line lets you set the value of y to 70.
The problem for the computer is that it does not know what '65' means when
you tell it x = 65;.  What you think of 65, it might think of as:
00000000000000000000000001000001
But, also, to the computer, the letter 'A' is represented as:
00000000000000000000000001000001
So, whenever you instruct the computer write(x+"\n");, it must have some
way of knowing that you want to see '65' and not 'A'.

The computer can tell the difference between '65' and 'A' through the use
of data types.  A data types simply says what type of data is being stored
by the memory location pointed to by a given variable.  Thus, each LPC
variable has a variable type which guides conversions.  In the example
given above, you would have had the following line somewhere in the
code *before* the lines shown above:

-----
int x;
-----

This one line tells the driver that whatever value x points to, it will
be used as the data type "int", which is short for integer, or whole
number.  So you have a basic introduction into the reason why data types
exist.  They exist so the driver can make sense of the 0's and 1's that
the computer is storing in memory.

3.3 The data types of LPC
All LPMud drivers have the following data types:

void, status, int, string, object, int *, string *, object *, mixed *

Many drivers, but not all have the following important data types which
are important to discuss:

float, mapping, float *, mapping *

And there are a few drivers with the following rarely used data types
which are not important to discuss:

function, enum, struct, char

3.4 Simple data types
This introductory textbook will deal with the data types void, status,
int, float, string, object, mand mixed.  You can find out about the
more complex data types like mappings and arrays in the intermediate
textbook.  This chapter deals with the two simplest data types (from the
point of view of the LPC coder), int and string.

An int is any whole number.  Thus 1, 42, -17, 0, -10000023 are all type int.
A string is one or more alphanumeric characters.  Thus "a", "we are borg",
"42", "This is a string" are all strings.  Note that strings are always
enclosed in "" to allow the driver to distinguish between the int 42 and
the string "42" as well as to distinguish between variable names (like x)
and strings by the same names (like "x").

When you use a variable in code, you must first let the driver know
what type of data to which that variable points.  This process is
called *declaration*.  You do this at the beginning of the function
or at the beginning of the object code (outside of functions before all
functions which use it).  This is done by placing the name of the data type
before the name of the variable like in the following example:

-----
void add_two_and_two() {
    int x;
    int y;

    x = 2;
    y = x + x;
}
-----

Now, this is a complete function.  The name of the function is 
add_two_and_two().  The function begins with the declaration of an
int variable named x followed by the declaration of an in variable
named y.  So now, at this point, the driver now has two variables which
point to NULL values, and it expects what ever values end up there to be
of type int.

A note about the data types void and status:
Void is a trivial data type which points to nothing.  It is not used
with respect to variables, but instead with respect to functions.  You
will come to understand this better later.  For now, you need only
understand that it points to no value.  

The data type status is a boolean data type.  That is, it can only have
1 or 0 as a value.  This is often referred to as being true or false.

3.5 Chapter summary
For variables, the driver needs to know how the 0's and 1's the computer
stores in memory get converted into the forms in which you intend them
to be used.  The simplest LPC data types are void, status, int, and string.
You do not user variables of type void, but the data type does come
into play with respect to functions.  In addition to being used for
translation from one form to the next, data types are used in determining
what rules the driver uses for such operations as +, -, etc.  For example,
in the expression 5+5, the driver knows to add the values of 5 and 5
together to make 10.  With strings however, the rules for int addition
make no sense.  So instead, with "a"+"b", it appends "b" to the string "a"
so that the final string is "ab".  Errors can thus result if you mistakenly
try to add "5"+5.  Since int addition makes no sense with strings, the
driver will convert the second 5 to "5" and use string addition.  The final
result would be "55".  If you were looking for 10, you would therefore
have ended up with erroneous code.  Keep in mind, however, that in most
instances, the driver will not do something so useful as coming up with
"55".  It comes up with "55" cause it has a rule for adding a string
to an int, namely to treat the int as a string.  In most cases, if you
use a data type for which an operation or function is not defined
(like if you tried to divide "this is" by "nonsense", "this is"/"nonsense"),
the driver will barf and report an error to you.
