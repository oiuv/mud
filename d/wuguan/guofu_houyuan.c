inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
这里是郭府的后院，都是些干活做事的地方，东面过去都
是柴房，西面是一个水房。人们忙碌的进出，干着自己的活。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "east" : __DIR__"guofu_chaifang",
               "west" : __DIR__"guofu_shuifang",
               "north" : __DIR__"guofu_houyuan2",
               "south" : __DIR__"guofu_shilu-3",
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
