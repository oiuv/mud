inherit ROOM;

void create()
{
        set("short", "密道");
        set("long", @LONG
这是漆黑的密道，当年白驼山弟子为了直达中原而挖凿的。
LONG);
        set("exits" , ([
                "east" : "/d/city/beidajie1",
                "up"   : __DIR__"neishi",
        ]));
        setup();
        replace_program(ROOM);
}
