inherit ROOM;

void create()
{
        set("short", "小巷尽头");
        set("long", @LONG
这是一条又深又黑的巷子，散发出一阵阵污水的味道和食
物发霉的味道，又脏又臭。
LONG);
        set("outdoors", "jingzhou");
        set("exits", ([
                "north" : __DIR__"xxiang",
        ]));
        set("objects", ([
                "/d/kaifeng/npc/qigai" : 2,
                "/d/beijing/npc/dipi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
