inherit ROOM;

void create()
{
        set("short", "金马枋");
        set("long", @LONG
昆明名胜之一，金马枋，传说在每年的一天，其影子和碧
鸡枋的影子交相辉印，称为金碧交辉，巍巍奇观。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "west" : __DIR__"xiaoximen",
                "east"  :__DIR__"jinrilou",
        ]));

        set("objects", ([
                "/d/beijing/npc/old1" : 1,
                "/d/beijing/npc/boy1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
