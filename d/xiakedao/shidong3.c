// Room: /xiakedao/shidong3.c

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石洞，四周点着八盏油灯，使得整个房间非常明亮。山
洞中支路甚多，你可要小心，别走错了路。
LONG );
        set("exits", ([
                "east" : __FILE__,
                "west" : __FILE__,
                "south" : __DIR__"shidong4",
                "north" : __DIR__"yingbin",
        ]));
        setup();
        replace_program(ROOM);
}
