// walle1.c

inherit ROOM;

void create()
{
        set("short", "城头");
        set("long", @LONG 
这是凌霄城的城头，从这极目远望，只见万里雪山，一片苍
茫。黄云万丈之下，无数起伏的山脉向东奔腾而去。沉寂的雪岭
之间，只偶尔传来一阵阵狼嗷。
LONG );
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);

        set("exits", ([
                "east"   : __DIR__"walle2",
                "westdown" : __DIR__"gate",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 1,
        ])); 
        setup();
        replace_program(ROOM);
}

