                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: july 5 1993

CHAPTER 6: Variable Handling

6.1 Review
By now you should be able to code some simple objects using your muds standard
object library.  Inheritance allows you to use functions defined in those
objects without having to go and define yourself.  In addition,
you should know how to declare your own functions.  This
chapter will teach you about the basic elements of LPC which will allow you to
define your own functions using the manipulation of variables.

6.2 Values and objects
Basically, what makes objects on the mud different are two things:
1) Some have different functions
2) All have different values

Now, all player objects have the same functions.  They are therefore
differentiated by the values they hold.  For instance, the player
named "Forlock" is different from "Descartes" *at least* in that they
have different values for the variable true_name, those being
"descartes" and "forlock".

Therefore, changes in the game involve changes in the values of the objects
in the game.  Functions are used to name specific process for manipulating
values.  For instance, the create() function is the function whose
process is specifically to initialize the values of an object.
Within a function, it is specifically things called instructions which are
responsible for the direct manipulation of variables.

6.3 Local and global variables
Like variables in most programming language, LPC variables may be declared
as variables "local" to a specific function, or "globally" available
to all functions.  Local variables are declared inside the function which
will use them.  No other function knows about their existence, since
the values are only stored in memory while that function is being executed.
A global variable is available to any function which comes after its
declaration in the object code.  Since global variables take up RAM for
the entire existence of the object, you should use them only when
you need a value stored for the entire existence of the object.
Have a look at the following 2 bits of code:

-----
int x;

int query_x() { return x; }

void set_x(int y) { x = y; }
-----

-----
void set_x(int y) {
    int x;

    x = y;
    write("x is set to x"+x+" and will now be forgotten.\n");
}
-----

In the first example, x is declared outside of any functions, and therefore
will be available to any function declared after it.  In that example,
x is a global variable.
In the second example, x is declared inside the function set_x().  It
only exists while the function set_x() is being executed.  Afterwards,
it ceases to exist.  In that example, x is a local variable.

6.4 Manipulating the values of variables
Instructions to the driver are used to manipulate the values of variables.
An example of an instruction would be:

-----
x = 5;
-----

The above instruction is self-explanatory.  It assigns to the variable
x the value 5.  However, there are some important concepts in involved
in that instruction which are involved in instructions in general.
The first involves the concept of an expression.  An expression is
any series of symbols which have a value.  In the above instruction,
the variable x is assigned the value of the expression 5.  Constant
values are the simplest forms in which expressions can be put.  A constant
is a value that never changes like the int 5 or the string "hello".
The last concept is the concept of an operator.  In the above example,
the assignment operator = is used.

There are however many more operators in LPC, and expressions can get
quite complex.  If we go up one level of complexity, we get:

-----
y = 5;
x = y +2;
-----

The first instruction uses the assignment operator to assign the value
of the constant expression 5 to the variable y.  The second one
uses the assignment operator to assign to x the value of the expression
(y+2) which uses the addition operator to come up with a value which
is the sum of the value of y and the value of the constant expression 2.
Sound like a lot of hot air?

In another manner of speaking, operators can be used to form complex
expressions.  In the above example, there are two expressions in the
one instruction x = y + 2;:
    1) the expression y+2
    2) the expression x = y + 2
As stated before, all expressions have a value.  The expression
y+2 has the value of the sum of y and 2 (here, 7);
The expression x = y + 2 *also* has the value of 7.
So operators have to important tasks:
    1) They *may* act upon input like a function
    2) They evaluate as having a value themselves.
Now, not all operators do what 1 does.  The = operators does act upon
the value of 7 on its right by assigning that value to x.  The operator
+ however does nothing.  They both, however, have their own values.

6.5 Complex expressions
As you may have noticed above, the expression x = 5 *itself* has a value
of 5.  In fact, since LPC operators themselves have value as expressions,
they cal allow you to write some really convoluted looking nonsense like:
    i = ( (x=sizeof(tmp=users())) ? --x : sizeof(tmp=children("/std/monster"))-1)
which says basically:
    assing to tmp the array returned by the efun users(), then assign to x
    the value equal to the number of elements to that array.  If the value
    of the expression assigning the value to x is true (not 0), then assign
    x by 1 and assign the value of x-1 to i.  If x is false though,
    then set tmp to the array returned by the efun children(), and then
    assign to i the value of the number of members in the array tmp -1.
Would you ever use the above statement? I doubt it.  However you might
see or use expressions similar to it, since the ability to consolidate
so much information into one single line helps to speed up the execution of
your code.  A more often used version of this property of LPC operators
would be something like:
    x = sizeof(tmp = users());
    while(i--) write((string)tmp[i]->query_name()+"\n");
instead of writing something like:
    tmp = users();
    x = sizeof(tmp);
    for(i=0; i<x; i++) write((string)tmp[i]->query_name()+"\n");
Things like for(), while(), arrays and such will be explained later.
But the first bit of code is more concise and it executed faster.

NOTE: A detailed description of all basic LPC operators follows the chapter
summary.


6.6 Chapter Summary
You now know how to declare variables and understand the difference between
declaring and using them globally or locally.  Once you become familiar
with your driver's efuns, you can display those values in many different
ways.  In addition, through the LPC operators, you know how to change
and evaluate the values contained in variables.  This is useful of course
in that it allows you to do something like count how many apples have
been picked from a tree, so that once all apples have been picked, no
players can pick more.  Unfortunately, you do not know how to have
code executed in anything other than a linera fashion.  In other words,
hold off on that apple until the next chapter, cause you do not know
how to check if the apples picked is equal to the number of apples in the
tree.  You also do not know about the special function init() where you
give new commands to players.  But you are almost ready to code a nice,
fairly complex area.

6.7 LPC operators
This section contains a detailed listing of the simpler LPC operators,
including what they do to the values they use (if anything) and the value
that they have.

The operators described here are:
=    +    -    *    /    %    +=    -=    *=    /=    %=
--    ++    ==    !=    >    <    >=    <=    !    &&    ||
->    ? :

Those operators are all described in a rather dry manner below, but it is best
to at least look at each one, since some may not behave *exactly* as
you think.  But it should make a rather good reference guide.

= assignment operator:
    example: x = 5;
    value: the value of the variable on the *left* after its function is done
    explanation: It takes the value of any expression on the *right* and
      assigns it to the variable on the *left*.  Note that you must use
      a single variable on the left, as you cannot assign values to 
      constants or complex expressions.

+ addition operator:
    example: x + 7
    value: The sum of the value on the left and the value on the right
    exaplanation: It takes the value of the expression on the right and
      adds it to the value of the expression on the left. For values
      of type int, this means the numerical sum.  For strings,
      it means that the value on the right is stuck onto the value on
      the left ("ab" is the value of "a"+"b").  This operator does not
      modify any of the original values (i.e. the variable x from
      above retains its old value).

- subtraction operator:
    example: x - 7
    value: the value of the expression on the left reduced by the right
    explanation:  Same characteristics as addition, except it subtracts.
      With strings: "a" is the value of "ab" - "b"

* multiplication operator:
    example: x*7
    value and explanation: same as with adding and subtracting except
      this one performs the math of multiplication

/ division operator:
    example: x/7
    value and explanation: see above

+= additive assignment operator:
    example: x += 5
    value: the same as x + 5
    exaplanation: It takes the value of the variable on the left
      and the value of the expression on the right, adds them together
      and assigns the sum to the variable on the left.
      example: if x = 2... x += 5 assigns the value
        7 to the variable x.  The whole expression
        has the value of 7.

-= subtraction assignment operator
    example: x-=7
    value: the value of the left value reduced by the right value
    examplanation: The same as += except for subtraction.

*= multiplicative assignment operator
    example: x *= 7
    value: the value of the left value multiplied by the right
    explanation: Similar to -= and += except for addition.

/= division assignment operator
    example: x /= 7
    value: the value of the variable on the left divided by the right value
    explanation: similar to above, except with division

++ post/pre-increment operators
    examples: i++ or ++i
    values: 
      i++ has the value of i
      ++i has the value of i+1
    explanation: ++ changes the value of i by increasing it by 1.
      However, the value of the expression depends on where you
      place the ++.  ++i is the pre-increment operator.  This means
      that it performs the increment *before* giving a value.
      i++ is the post-ncrement operator.  It evalutes before incrementing
      i.  What is the point?  Well, it does not much matter to you at
      this point, but you should recognize what it means.

-- post/pre-decrement operators
    examples: i-- or --i
    values:
      i-- the value of i
      --i the value of i reduced by 1
    explanation: like ++ except for subtraction

== equality operator
    example: x == 5
    value: true or false (not 0 or 0)
    explanation: it does nothing to either value, but
      it returns true if the 2 values are the same.
      It returns false if they are not equal.

!= inequality operator
    example: x != 5
    value: true or false
    explanation returns true if the left expression is not equal to the right
      expression.  It returns fals if they are equal

> greater than operator
    example: x > 5
    value: true or false
    explanation: true only if x has a value greater than 5
      false if the value is equal or less

< less than operator
>= greater than or equal to operator
<= less than or equal to operator
    examples: x < y    x >= y    x <= y
    values: true or false
    explanation: similar as to > except
      < true if left is less than right
      >= true if left is greater than *or equal to* right
      <= true if the left is less than *or equal to* the right

&& logical and operator
|| logical or operator
    examples: x && y      x || y
    values: true or false
    explanation: If the right value and left value are non-zero, && is true.
      If either are false, then && is false.
      For ||, only one of the values must be true for it to evaluate
      as true.  It is only false if both values indeed
      are false

! negation operator
    example: !x
    value: true or false
    explanation: If x is true, then !x is false
      If x is false, !x is true.

A pair of more complicated ones that are here just for the sake of being
here.  Do not worry if they utterly confuse you.

-> the call other operator
    example: this_player()->query_name()
    value: The value returned by the function being called
    explanation:  It calls the function which is on the right in the object
      on the left side of the operator.  The left expression *must* be
      an object, and the right expression *must* be the name of a function.
      If not such function exists in the object, it will return 0 (or
      more correctly, undefined).

? : conditional operator
    example: x ? y : z
    values: in the above example, if x is try, the value is y
      if x is false, the value of the expression is z
    explanation: If the leftmost value is true, it will give the expression as
      a whole the value of the middle expression.  Else, it will give the
      expression as a whole the value of the rightmost expression.

A note on equality:  A very nasty error people make that is VERY difficult
to debug is the error of placing = where you mean ==.  Since
operators return values, they both make sense when being evaluated.
In other words, no error occurs.  But they have very different values.  For example:
  if(x == 5)    if(x = 5)
The value of x == 5 is true if the value of x is 5, false othewise.
The value of x = 5 is 5 (and therefore always true).
The if statement is looking for the expression in () to be either true or false,
so if you had = and meant ==, you would end up with an expression that is
always true.  And you would pull your hair out trying to figure out
why things were not happening like they should :)
