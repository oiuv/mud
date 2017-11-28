
inherit ROOM;

void create()
{
        set("short", "草地");
        set("long", @LONG
这里是一片草地，草很深，几乎淹没了小腿。草间散布着
一些奇花，微风吹过，芬芳扑鼻。你听到时而有“嗡嗡嗡”的
声音，看见有一些个头奇大的白色的蜜蜂在草地上飞舞盘旋。
LONG
        );
        set("outdoors", "gumu");
        set("exits", ([
                "west" : __DIR__"caodi",
                "southeast" : __DIR__"hanshuitan",
        ]));
        setup();
        replace_program(ROOM);
}
