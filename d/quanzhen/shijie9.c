inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
这是一条整齐的石板路，依山而建，随着山势的曲折蜿蜒
曲折。由于山势陡了，当初修建这条石阶时肯定费了不小的功
夫。走到这里，已经可以看见全真教重阳观的檐角了。西面好
象有一条小路。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "northdown" : __DIR__"shijie8",
                "south" : __DIR__"guanritai",
        ]));
        set("objects",([
                __DIR__"npc/daotong" : 2,
                "/clone/npc/walker" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
