#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "神峰山脚");
        set("long", @LONG
此处已是神峰(peak)山脚，近看尤其美丽，通体雪白，莹
光纯净，做玉匠的只要找到小小的一块白玉，已然是终身吃之
不尽了，哪知这里竟有这样一座白玉山峰。抬头仰望，只觉心
旷神怡，万虑俱消。你不禁暗暗赞叹造物之奇。
LONG);
        set("outdoors", "shenfeng");
        set("item_desc", ([
                "peak" : HIW "陡峭的白玉山峰上布满斧凿痕迹，看来似乎"
                         "可以爬上去。\n" NOR,
        ]));

        set("exits", ([
                "south" : __DIR__"pendi",
	]));
        setup();
}

void init()
{
        add_action("do_climb", "climb");
}

int do_climb(string arg)
{
        object me = this_player();

        if (! arg || arg != "up")
		return notify_fail("你要往哪个方向爬？\n");

        message("vision", HIW "只见" + me->name() + HIW "战战兢兢地往神"
                          "峰上爬去。\n" NOR, environment(me), ({me}));

        me->move(__DIR__"shenfeng");
        tell_object(me, HIW "\n你费了好大劲，终于爬上了神峰，累得你直喘"
                          "粗气。\n\n" NOR);
        message("vision", HIW "只见" + me->name() + HIW "气喘嘘嘘地爬了"
                          "上来。\n", environment(me), ({me}));
        return 1;
}
