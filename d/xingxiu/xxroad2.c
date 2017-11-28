inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
这是一条青石大道。西面可以通往军事重镇兰州。东面隐
约可以看到长安城的城墙。北面有座小山丘。
LONG );
        set("exits", ([
                "east" : __DIR__"xxroad1",
                "northwest" : "/d/lanzhou/caroad8",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "lanzhou");
        setup();
        replace_program(ROOM);
}

