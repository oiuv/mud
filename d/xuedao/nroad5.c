inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条崎岖的山路，马队到了这里就不能在上去了。山
路两旁杂草从生，路开始越来越难走。
LONG);
        set("exits", ([
                "north" : __DIR__"nroad6",
                "south" : __DIR__"nroad1",
        ]));
        set("objects",([
                "/clone/quarry/ying" : 1,
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

