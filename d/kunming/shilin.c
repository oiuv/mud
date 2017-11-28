inherit ROOM;

void create()
{
        set("short", "石林");
        set("long", @LONG
这里矗立着各种各样形状各异的石头，有的象人，有的象
树，有的又象动物，你这边看着象这样，也许换个角度又象其
他的，千姿百态。把你眼睛都看花了。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "north" : __DIR__"xiaolu", 
                "south"  :__DIR__"shilin1",
        ]));
        set("objects", ([
                "/d/beijing/npc/youke" : 1,
        ]));
        setup();
        replace_program(ROOM);
}