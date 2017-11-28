#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "密室");
        set("long", @LONG
这里是一间隐藏在红花会总舵后花园之下的小石屋，石屋
内充满了霉气，周围很是空旷，墙壁四周嵌着几盏油灯，散发
出暗淡昏黄的光亮。正对阶梯的石壁(wall)上刻着一些图形。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
                "up" : __DIR__"hh_xiaozhu",
        ]));
        set("item_desc",([
                "wall": WHT "\n石壁上刻着一些栩栩如生，正拳"
                        "搏激烈的小人，旁边还有一些注释。\n "
                        NOR,
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

        if (! living(me)) return 0;

        if (! living(this_player()) || arg != "wall")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("unarmed", 1) < 50)
                return notify_fail("你发现墙上所记载的拳法过于高深，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query_skill("unarmed", 1) > 180)
                return notify_fail("你发现墙上所记载的拳法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 80)
                return notify_fail("你精力无法集中。 \n");

        me->receive_damage("jing", 50 + random(20));

        if ( me->query( "special_skill/clever" ) )
                add = me->query("int") * 2;
        else
                add = me->query("int");
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", add);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详墙上所记载的拳法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「基本拳脚」有了新的领悟。\n" NOR);
        return 1;
}

