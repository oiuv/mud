inherit ROOM;

void create()
{
        set("short", "大厅");
        set("long", @LONG
这里是寺内的大厅，几位有道的高僧在高声辩论。看来正
在引经据典，争斗机锋。
LONG);
        set("exits", ([
                "east"  : __DIR__"zoulang1",
                "west"  : __DIR__"zoulang2",
                "north" : __DIR__"cangjing",
                "south" : __DIR__"cangjingge",
        ]));
        setup();
        replace_program(ROOM);
}
