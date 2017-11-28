inherit ROOM;
#include <ansi.h>;

void create()
{
        set("short", "密室");
        set("long", @LONG
这是一间光线阴暗的密室，从地上厚厚的灰尘看得出来这
里很少有人出入，靠西边的地上放着一副脚镣，连着一条铁链
镶在墙上，不知道是用来锁什麽人，南面的墙(wall)是用红杉
木做的，跟另外三面的灰土墙比起来显得有些不寻常。
LONG);
        set("exits", ([
                "east" : __DIR__"undertre",
        ]));
        set("item_desc", ([
                "wall" : WHT "这是一堵斑剥淋漓的墙，墙"
                         "上密密麻麻写满了小字，似乎均"
                         "与杖法有关。\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_think", "think");
}

int do_think(string arg)
{
        object me = this_player();
        int add;

        if (! living(me))
                return 0;

        if (! living(this_player()) || arg != "wall")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("staff", 1) < 80)
                return notify_fail("你发现墙上所记载的杖法过于高深，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query_skill("staff", 1) > 180)
                return notify_fail("你发现墙上所记载的杖法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 120)
                return notify_fail("你现在精神不济，过于疲倦，还是先休"
                                   "息一会吧。\n");

        me->receive_damage("jing", 50 + random(60));

        if ( me->query( "special_skill/clever" ) )
                add = me->query("int") + 10;
        else
                add = me->query("int");
        if (me->can_improve_skill("staff"))
                me->improve_skill("staff", add);
        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详墙上所记载的杖法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「基本杖法」有了新的领悟。\n" NOR);
        return 1;
}
