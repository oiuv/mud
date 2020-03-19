inherit ROOM;

void create()
{
        set("short", "城外");
        set("long", @LONG
这里是凌霄城的城外，出现在你面前的是高耸的城墙，看来
如果不从城门走，想要越墙而入，是不太可能的。凌霄城外野狼
很多，绝对不是什么安全的地方，还是赶快进城吧。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
                "west" : __DIR__"shanya",
        ]));
        set("objects", ([
                "/clone/quarry/lang" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
