#include <ansi.h>

inherit COMBINED_ITEM;

int is_herb() { return 1; }

void setup()
{
        set_amount(1);
        ::setup();
}
