// /d/xiakedao/shihole3.c 侠客岛 石洞3

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
迎面可见四个行书大字「水银泻地」，极具神韵。洞中陈设奢华，
洁白的大理石砖，汉白玉栏杆。几个香炉烟雾缭绕，白衣婢女垂手侍
立，依稀是豪门内宅一般。
LONG );
        set("exits", ([
                "out"   : __DIR__"shihole2",
                "enter" : __DIR__"shihole4",
                "north" : __DIR__"shiroom09",
                "south" : __DIR__"shiroom10",
                "east"  : __DIR__"shiroom11",
                "west"  : __DIR__"shiroom12",
        ]));
        setup();
	replace_program(ROOM);
}
