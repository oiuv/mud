#include <ansi.h>

inherit ROOM;

void close_passage();
string look_bei();

void create()
{
    set("short", HIR "无名峰" NOR);
        set("long", @LONG
跨过路上的荆棘和荒草，你终于登上了五指山无名峰的峰顶。由于这里
地处五峰之中，四周有其它山峰阻挡，因此风势很小，常年笼罩在一片云雾
之中。峰顶长满了齐腰的荒草，怪石嶙峋，一片荒凉景色。在山峰顶部的正
中赫然矗立着一座岩石砌就的坟墓，坟墓的前面立着一块一人多高的花岗岩
的墓碑(bei)。
LONG    );
        set("exits", ([
                "southdown" : __DIR__"hclu-4",
        ]));

        set("item_desc",([
                "bei" : (: look_bei :),
        ]));

        set("no_clean_up", 0);
        set("outdoors", "tiezhang");
        setup();
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me;
        me = this_player();

        if (! arg || arg != "bei") 
                return notify_fail("你要推什么？\n");

        if ((int)me->query_str() < 30)
                return notify_fail("你将吃奶的劲都用上了，可还是无法把石碑推开。\n");

        if ((int)me->query_skill("force", 1) < 100 )
                return notify_fail("你推了半天，发现石碑还是纹丝不动。\n");

        write(HIY "你扎下马步，深深的吸了口气，将墓碑缓缓的向旁推开，下面露出"
              "一个黑洞洞的入口。\n" NOR);
        message("vision", HIR + me->name() + HIR "双膀用力，将墓碑向旁缓缓推"
                          "开，下面露出一个黑洞洞的入口。\n" NOR , environment(me), ({me}) );
        set("exits/enter", __DIR__"shijie-1");
        remove_call_out("close_passage");
        call_out("close_passage", 10);
        return 1;
}

void close_passage()
{
//      object room;

        if (! query("exits/enter"))
		return;
        message("vision", HIR "墓碑发出隆隆的声音，缓缓移回原处。\n" NOR, this_object() );
        delete("exits/enter");
}

string look_bei()
{
    return
    "\n"
 WHT "\n\n    ###################\n"
         "    ##               ##\n"
         "    ##           铁  ##\n"
         "    ##           掌  ##\n"
         "    ##           帮  ##\n"
         "    ##" NOR + HIR "       上" NOR + WHT "  第  ##\n"
         "    ##           十  ##\n"
         "    ##" NOR + HIR "       官" NOR + WHT "  三  ##\n"
         "    ##           代  ##\n"
         "    ##" NOR + HIR "       剑" NOR + WHT "  帮  ##\n"
         "    ##           主  ##\n"
         "    ##   不" NOR + HIR "  南" NOR + WHT "      ##\n"
         "    ##   肖          ##\n"
         "    ##   弟          ##\n"
         "    ##   子  之      ##\n"
         "    ##   裘  墓      ##\n"
         "    ##   千          ##\n"
         "    ##   仞          ##\n"
         "    ##   谨          ##\n"
         "    ##   立          ##\n"
         "    ##               ##\n"
         "    ###################\n\n" NOR;
    "\n";
}