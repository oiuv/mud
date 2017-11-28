inherit ROOM;

void create()
{
        set("short", "马庄正厅");
        set("long", @LONG
这里是马庄的正厅，厅内非常宽敞明亮。正中摆放着一张
八仙桌，四周墙壁上挂着一些字画。几个年龄较大的乞丐正坐
在大厅的中央，大声谈论着些什么。
LONG);
        set("exits", ([
                "west"  : __DIR__"ma_yantingw",
                "east"  : __DIR__"ma_yantinge",
                "north" : __DIR__"ma_zoulang1",
                "south" : __DIR__"ma_houyuan",
        ]));
        set("objects", ([
                CLASS_D("gaibang") + "/ma" : 1,
                CLASS_D("gaibang") + "/xi" : 1,
                CLASS_D("gaibang") + "/wu" : 1,
		"/d/gaibang/npc/6dai" : 1 + random(2),
		"/d/gaibang/npc/7dai" : 1 + random(2),
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
