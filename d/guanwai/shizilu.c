// /guanwai/shizilu.c

inherit ROOM;

void create()
{
        set("short", "石路");
        set("long", @LONG
这是一条碎石子铺的小路，西面烟雾缭绕的，墙壁都有些发黑了，
看上去有些刺眼，不过里面却飘来阵阵香气，看来是厨房。东面则是
一个显得有些荒凉的小院子，似乎没什么东西。时不时有一些胡家的
弟子匆匆而过。
LONG );
        set("exits", ([
                "south" : __DIR__"houyuan",
                "west"  : __DIR__"chufang",
                "east"  : __DIR__"taxue",
        ]));

        set("outdoor", "guanwai");
        setup();
        replace_program(ROOM);
}
