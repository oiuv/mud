inherit ROOM;
void create()
{
        set("short", "西大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往东边走去，那里有一个热闹的广场。南边远
远的有一家生意兴隆的小酒店，来自各地的人们进进出出。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "east" : __DIR__"guangchang",
                "west" : __DIR__"ximen",
                "south" : __DIR__"xiaojisi",
        ]));
        setup();
        replace_program(ROOM);
}
