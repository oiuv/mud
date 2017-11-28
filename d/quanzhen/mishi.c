inherit ROOM;

void create()
{
        set("short", "密室");
        set("long", @LONG
这里是全真教弟子为了直达中原修建的密室，这里的光线
非常昏暗，也许已经身处地下了。
LONG);
        set("exits", ([
                "up" : __DIR__"diziju",
                "eastup" : "/d/city/guangchang",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
