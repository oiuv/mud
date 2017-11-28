// shoeshine.c 鞋油

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(YEL "鞋油" NOR, ({"shoeshine", "xie you"}));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "支");
                set("value", 90);
        }
        set("count", 10);
        setup();
}

string long()
{
        int c;

        c = query("count");
        if (c < 1)
        {
                set("count", 1);
                c = 1;
        }

        return "这是一包鞋油，看上去还能用" + chinese_number(c) + "次。\n";
}

void cost()
{
        if (add("count", -1) < 1)
        {
                message_vision("$N把$n用完了，随手扔到了一边。\n",
                               this_player(), this_object());
                destruct(this_object());
        }
}

