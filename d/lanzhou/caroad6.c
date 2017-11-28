inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
你走在一条青石大道上，人渐渐少起来，只是有时有人骑
着马匆匆而过。
LONG);
        set("outdoors", "lanzhou");

        set("exits", ([
                "west" : __DIR__"caroad5",
                "south" : __DIR__"caroad7",
        ]));

        setup();
        replace_program(ROOM);
}
