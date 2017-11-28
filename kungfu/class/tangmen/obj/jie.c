#include <ansi.h>
#include <weapon.h>
inherit ITEM;

void create()
{
        set_name(HIG "心有千千结" NOR, ({"qianqian jie"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一枚四川唐门秘制的暗器心有千千结，一条飞索，有无数个结，威力无比。\n");
                set("unit", "条");
                set("value", 21);
        }
        setup();
}