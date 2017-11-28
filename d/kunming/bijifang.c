inherit ROOM;

void create()
{
        set("short",  "碧鸡枋" );
        set("long", @LONG
昆明名胜之一，碧鸡枋，传说在每年的一天，其影子和金
马枋的影子交相辉印，称为金碧交辉，巍巍奇观。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "west" : __DIR__"jinrilou", 
                "east"  :__DIR__"dongmen",
        ]));
        set("objects", ([
                "/d/beijing/npc/jumin1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
