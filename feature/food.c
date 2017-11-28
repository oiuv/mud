// food.c

#include <dbase.h>
#include <name.h>

mixed func = 0;

void apply_effect(function f)
{
        if (! func)
                func = f;
        else
        if (functionp(func))
                func = ({ func, f });
        else
        if (sizeof(func) < 12)
                func += ({ f });
}

void clear_effect()
{
        func = 0;
}

mixed query_effect()
{
        return func;
}

void do_effect()
{
        int i;

        if (functionp(func))
                evaluate(func);
        if (arrayp(func))
                for (i = 0; i < sizeof(func); i++)
                        evaluate(func[i]);
}
