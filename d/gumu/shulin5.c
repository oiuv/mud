

inherit ROOM;

void create()
{
        set("short", "小树林");
        set("long", @LONG
走在林中，你只闻铮铮琴声，一股淡淡白烟，带着极甜的
花香，自密林深处传出。一群乳白色的蜜蜂在你身旁飞来飞去。
不论往哪ㄦ走尽是茂密的树林。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "east"   : __DIR__"shulin0",
                "south"  : __DIR__"shulin4",
                "north"  : __FILE__,
                "west"   : __FILE__,
        ]));

        setup();
        replace_program(ROOM);
}
