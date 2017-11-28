// /d/xiakedao/shihole5.c 侠客岛 石洞5

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
进洞便觉脚下有些不同，原来特意垫了半尺厚的黄土，不知有什
麽妙用。正面也是刻着这四句的总纲：「落花残阳」，却是笔致圆润，
似出女子之手。周围帘幕低垂，一色淡黄。
LONG );
        set("exits", ([
                "out"   : __DIR__"shihole4",
                "enter" : __DIR__"shihole6",
                "north" : __DIR__"shiroom17",
                "south" : __DIR__"shiroom18",
                "east"  : __DIR__"shiroom19",
                "west"  : __DIR__"shiroom20",
        ]));
        setup();
	replace_program(ROOM);
}
