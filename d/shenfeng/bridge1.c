#include <ansi.h>; 
inherit ROOM;

void create()
{
        set("short", "独木桥");
        set("long", @LONG
四下无声，仰视苍天，注视雪白的山峰，令人不觉怆然而
发思古之幽情。往前只见一道飞岩，下临绝崖，只有一条狭窄
的独木桥(bridge)通达对崖，危桥在谷风中不停地抖动。
LONG);
        set("outdoors", "shenfeng");

        set("exits", ([ 
        	"south" : __DIR__"xiaojing",
	]));
        set("item_desc",([
                "bridge" : YEL "这是一条宽约七寸的独木桥，看来只"
                           "能走(zou)过一人。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_zou", "zou");
}

int do_zou(string arg)
{
        object me = this_player(), room;

        if (! arg || arg != "bridge")
                return notify_fail("你要走什么？\n");

        if (me->query_skill("dodge", 1) < 100)
                return notify_fail(HIY "\n你战战兢兢地向前迈出两"
                                   "步，可突然间谷风刮过，危桥一"
                                   "阵狂\n颤，吓得你赶忙收回了脚"
                                   "步。\n" NOR);

        if (! (room = find_object(__DIR__"bridge2")))
                room = load_object(__DIR__"bridge2");

        if (! objectp(room))
                return notify_fail(HIW "你大叫道：BUG！BUG！\n" NOR);

        message_vision(HIW "\n只见$N" HIW "轻轻跃上独木桥，飘然而"
                       "去。\n" NOR, me);
        me->move(room);
        message_vision(HIW "$N" HIW "从独木桥上飘然而下，来到了山"
                       "峰的对面。\n" NOR, me);
        return 1;
}
