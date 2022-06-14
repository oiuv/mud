/**
 * NAME: range
 * SYNOPSIS: (int | float) range( int | float lower, int | float upper, int | float value )
 * DESCRIPTION: Given a lower bound and upper bound, test the value. If the value is between
 *              the ranges, return the value. If value is less than or equal to the lower
 *              bound, return lower. If the value is greater than or equal to the upper
 *              bound, return upper.
 */

#include <type.h>

mixed range( mixed lower, mixed upper, mixed value )
{
    mixed min, max ;

    if(nullp(lower)) error("Missing argument 1.\n");
    if(nullp(upper)) error("Missing argument 2.\n");
    if(nullp(value)) error("Missing argument 3.\n");

    if( typeof(lower) != T_INT && typeof(lower) != T_FLOAT )
    {
        error("Argument 1 must be of type int or float.\n") ;
    }
    if( typeof(upper) != T_INT && typeof(upper) != T_FLOAT )
    {
        error("Argument 2 must be of type int or float.\n") ;
    }
    if( typeof(value) != T_INT && typeof(value) != T_FLOAT )
    {
        error("Argument 3 must be of type int or float.\n") ;
    }

    if ( upper < value )
    {
        min = upper ;
        max = value ;
    }
    else
    {
        min = value ;
        max = upper ;
    }

    return lower < min ? min : (lower > max ? max : lower) ;
}
