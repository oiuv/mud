#include <ansi.h>; 
inherit ROOM;

void create()
{
        set("short", "独木桥");
        set("long", @LONG
这是一条宽约七寸的独木桥(bridge)，天风凛冽，吹的人
衣襟头发齐飞，只要一不留神，稍一失足，立刻便要粉身碎骨。
两崖相隔，约有五十余丈，往下看，峭壁如刀削，云卷雾涌深
不见底，投块石子下去，也听不到回声！
LONG);
        set("exits", ([ 
		"north" : __DIR__"xiaojing1",
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

        if (! (room = find_object(__DIR__"bridge1")))
                room = load_object(__DIR__"bridge1");

        if (! objectp(room))
                return notify_fail(HIW "你大叫道：BUG！BUG！\n" NOR);

        message_vision(HIW "\n只见$N" HIW "轻轻跃上独木桥，飘然而"
                       "去。\n" NOR, me);
        me->move(room);
        message_vision(HIW "$N" HIW "从独木桥上飘然而下，来到了山"
                       "峰的对面。\n" NOR, me);
        return 1;
}
