//Room: shanhongpb.c 山洪瀑布
//Modify by Rcwiz for hero.cd

#include <ansi.h>

inherit ROOM;

string look_hongshui();

void create()
{
        set("short","山洪瀑布");
        set("long",@LONG
这里是一处峡谷，每年雨季山洪爆发时就形成了一处蔚为壮观的
瀑布。传说当年神雕侠杨过就是在这里练成绝世的玄铁剑法的。现在
人去谷空，只剩下空寥的山谷和奔腾的洪水(hongshui)。看来倒是个
隐居的好去处。
LONG);
        set("outdoors", "huashan");
        set("item_desc", ([
                "hongshui" : (: look_hongshui :),
                "stone"    : NOR + WHT "一块天然的巨石，被洪水无情地冲蚀着。\n" NOR,
        ]));
        set("exits",([ /* sizeof() == 1 */
                "southwest"     : __DIR__"shaluo",
        ]));
        setup();
}

void init()
{
        add_action("do_cross", "cross");
        add_action("do_jump", "jump");
}

string look_hongshui()
{
	return @DESC
这是一股奔腾不息的洪水，水中隐隐有个东西在发光，但你定睛
仔细一看，发现那只不过是水面反射的日光罢了。顺着洪水俯视，
只见瀑布底矗立着一块天然的巨石（stone）， 这个瀑布似乎可
以穿(cross)过去。
DESC ;
}

int do_jump(string arg)
{
        object me = this_player();

        if (me->is_busy() || me->is_fighting())
              return notify_fail("你忙完了再说吧！\n");
    
        if (! arg || arg != "stone")
              return notify_fail("你要往哪儿跳？\n");
 
        if (me->query_skill("dodge") < 240)
              return notify_fail("你看了看，觉得自己轻功修为有限，不敢贸然跳下。\n");

        message_vision(HIG "$N" HIG "纵身跳下瀑布 ……\n", me);

        me->move(__DIR__"stone");

        return 1;
}

int do_cross()
{
        object me;       
        object cloth;

        me = this_player();
        if (me->query_dex() / 2 + random(me->query_dex()) < 22)
        {
                message_vision("$N望了望奔腾的瀑布，突然一跃，试图穿过"
                               "瀑布，结果“扑通”一下摔进了水中。\n", me);

                cloth = me->query_temp("armor/cloth");
                if (cloth && cloth->washed(120 + random(120)))
                        tell_object(me, "你身上的" + cloth->name() + "湿透了！\n");
                return 1;
        }

        message_vision("$N望了望奔腾的瀑布，突然一跃，穿过了"
                       "瀑布。\n", me);
        me->move(__DIR__"shandong");
        return 1;
}
