inherit ROOM;

void create()
{
        set("short", "石林");
        set("long", @LONG
这里矗立着各种各样形状各异的石头，有的象人，有的象
树，有的又象动物，你这边看着象这样，也许换个角度又象其
他的，千姿百态。把你眼睛都看花了。北边有一座高峰，却甚
是象朵莲花，名为莲花峰。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "northup" :__DIR__"lianhua",
                "east" : __DIR__"shilin1", 
                "west"  :__DIR__"qingshilu",
        ]));
        setup();
        replace_program(ROOM);
}
