inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
这里仍然是后院，西面不时传来马嘶声，你看过去，那里
是个马房，东面屋子里也是吵吵的，好象是锯木头的声音。
LONG);
        set("no_fight", 1);
        set("exits", ([
              "west" : __DIR__"guofu_mafang",
              "east" : __DIR__"guofu_mufang",
              "south" : __DIR__"guofu_houyuan",
              "north" : __DIR__"guofu_houyuan3",

        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
