#include <ansi.h>
inherit ROOM;

void create()
{

        set("short", "翡翠池");
        set("long", @LONG
这里是一个四周镶满翡翠的圆池，你身在池中，伸下手去
只觉清凉入骨，双手捧起水来但见池水澄净清澈，更无纤毫苔
泥，原来圆池四周都是翡翠，池水才映成绿色。洁白的玉峰映
在碧绿的池中，显得格外的明艳洁净，幽绝清绝。只见池边长
满了翠绿的青藤(rattan)。池底似乎有个洞(hole)。

LONG);
        set("item_desc", ([
        	"rattan" : GRN "\n生长在翡翠池岸边的翠绿青藤，可以由它爬上岸去。\n" NOR,
        	"hole"   : WHT "\n潜藏在池底的一个小洞，你似乎可以钻进去。\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_zuan", "zuan");
        add_action("do_climb", "climb");
}

int do_zuan(string arg)
{
        object me = this_player();

        if (! arg || arg != "hole")
		return notify_fail("你要钻什么？\n");

        message("vision", HIC "只见" + me->name() + HIC "紧闭呼吸，一个猛子朝池底"
                          "的洞钻去。\n" NOR, environment(me), ({me}) );
        write(HIC "\n你朝池底的洞钻去，哪知突然一道暗流冲来，把你扯入旋涡中。\n\n" NOR);

        me->move(__DIR__"lake3");
        message_vision(HIC "\n$N" HIC "被暗流从瀑布里抛了出来。\n\n" NOR, me);

        return 1;
}

int do_climb(string arg)
{
    	object me = this_player();

    	if (! arg || arg != "rattan")
		return notify_fail("你要爬什么？\n");

        message("vision", HIC "只见" + me->name() + HIC "顺着青藤爬了上去。\n" NOR,
                          environment(me), ({me}));
        me->move(__DIR__"feicui1");
        message_vision(HIC "\n$N" HIC "顺着青藤水淋淋地爬了上来。\n\n" NOR, me);
        return 1;
}

