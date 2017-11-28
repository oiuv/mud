// tianxiang-gao.c
inherit ITEM;
#include <ansi.h>

void init()
{
        add_action("do_smear", "smear");
}

void create()
{
        set_name(HIC "天香断续膏" NOR, ({"tianxiang gao", "gao"}));
        set("unit", "盒");
        set("long", "这是一盒黑色的疗伤膏药，可以擦涂（smear）。\n");
        setup();
}

int do_smear(string arg)
{
        if (!id(arg))  return notify_fail("你擦涂什么？\n");

        if ( this_player()->qeury("eff_qi") >= this_player()->qeury("max_qi") )
                return notify_fail("搞什么鬼！？你又没受伤，用不着涂它！\n");

        this_player()->receive_curing("qi", 250);
        tell_object(this_player(), HIG "你把黑色的膏药涂在了伤口上，顿时觉的一股清凉之意
流遍全身！\n" NOR );
        destruct(this_object());
        return 1;
}
