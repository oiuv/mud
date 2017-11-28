inherit ROOM;

void create()
{
        set("short", "面馆");
        set("long", @LONG
这里是虎坊路尽头的一家小面馆，几个皇宫里的摔跤手拥在里面。面馆的
掌柜和伙计威于他们的势头，连大气也不敢出一声。
LONG );
        set("exits", ([
                "north" : __DIR__"fu_1",
        ]));
        set("objects", ([
                __DIR__"npc/zhanggui":1,
                __DIR__"npc/mianhuoji":1,
                __DIR__"npc/jiao1":3,
                __DIR__"npc/jiao2":1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
