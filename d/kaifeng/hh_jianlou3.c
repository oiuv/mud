#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", "藏剑楼三层");
        set("long", @LONG
这里是红花会二当家无尘道长的静修之处，无尘道长号称
追魂夺命剑，因此将此地命为「藏剑楼」。楼分三层，这三楼
上搁着一些杂物，正中的墙壁(wall)上绘着一些小人，似乎正
在练剑。
LONG);
        set("no_clean_up", 0);
        set("item_desc", ([
                "wall" : WHT "\n墙壁上绘着一些正在练剑的小人，似是"
                         "与剑法有关。\n" NOR,
        ]) );
        set("exits", ([
                "down" : __DIR__"hh_jianlou2",
        ]));
        setup();
}

void init()
{
        add_action("do_think", "think");
}

int do_think(string arg)
{
        object me;
        int add;
        me = this_player();

        if ( ! living(me)) return 0;

        if ( ! living(this_player()) || arg != "wall" )
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("sword", 1) < 50)
                return notify_fail("你发现墙上所记载的剑法过于高深，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query_skill("sword", 1) > 180)
                return notify_fail("你发现墙上所记载的剑法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 100)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("jing", 80);
        if ( me->query( "special_skill/clever" ) )
                add = me->query("int") * 2;
        else
                add = me->query("int");
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", add);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详墙上所记载的剑法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「基本剑法」有了新的领悟。\n" NOR);
        return 1;
}
