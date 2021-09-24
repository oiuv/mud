#ifndef TEST_H
#define TEST_H

#define SAFE(x) do { x } while (0)
#define OUTPUT(x) SAFE(write(catch (error(x))); if (!this_player()) { shutdown(-1); })
#define WHERE __FILE__ + ":" + __LINE__

#include <type.h>

int same(mixed x, mixed y)
{
    // Allow comparing array with buffer
    if (!(typeof(x) == T_ARRAY && typeof(y) == T_BUFFER || typeof(y) == T_ARRAY && typeof(x) == T_BUFFER))
        if (typeof(x) != typeof(y))
            return 0;
    switch (typeof(x))
    {
    case T_INT:
    case T_STRING:
    case T_OBJECT:
    case T_FLOAT:
        return x == y;
    case T_MAPPING:
        if (x == y)
            return 1; // speed up this case
        if (sizeof(x) != sizeof(y))
            return 0;
        if (!same(keys(x), keys(y)))
            return 0;
        if (!same(values(x), values(y)))
            return 0;
        return 1;
    case T_BUFFER:
    case T_ARRAY:
        if (x == y)
            return 1; // speed up this case
        if (sizeof(x) != sizeof(y))
            return 0;
        for (int i = 0; i < sizeof(x); i++)
        {
            if (!same(x[i], y[i]))
                return 0;
        }
        return 1;
    case T_FUNCTION:
    case T_CLASS:
        error("Not implemented.");
    }
}

void __assert_eq(mixed expected, mixed actual, string where)
{
    if (!same(expected, actual))
    {
        OUTPUT(where + ", Check Failed: \n" +
               "Expected: \n" + sprintf("%O", expected) + "\nActual: \n" + sprintf("%O", actual) + "\n");
    }
}

void __assert_ne(mixed expected, mixed actual, string where)
{
    if (same(expected, actual))
    {
        OUTPUT(where + ", Check Failed: \n" +
               "Expect Not: \n" + sprintf("%O", expected) + "\nActual: \n" + sprintf("%O", actual) + "\n");
    }
}

#define ASSERT_EQ(x, y) do { __assert_eq((x), (y), WHERE); } while (0)
#define ASSERT_NE(x, y) do { __assert_ne((x), (y), WHERE); } while (0)

#endif
