inherit ROOM;

void create()
{
        set("short", "民居");
        set("long", @LONG
这好象是一家相对殷实的小康人家，屋内铺着青砖，正中
摆着套红木桌椅。墙上挂着几幅山水画，主人不在家里。
LONG);
        set("exits", ([
                "east" : __DIR__"beijie",
        ]));
        setup();
        replace_program(ROOM);
}
