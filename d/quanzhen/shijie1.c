inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
这是一条整齐的石板路，依山而建，随着山势的曲折蜿蜒
曲折。由于山势陡了，当初修建这条石阶时肯定费了不小的功
夫。走到这里，已经可以看见全真教重阳观的檐角了。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "northup"   : __DIR__"shijie2",
                "southdown" : "/d/gumu/daxiaochang",
        ]));

        set("objects",([
                __DIR__"npc/youke" : 1,
                __DIR__"npc/xiangke" : 2,
                "/clone/npc/walker" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
