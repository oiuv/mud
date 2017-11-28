inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这里是昆仑派弟子用餐的地方。由于天长日久，墙壁都被
烟熏黑了。屋里摆着几张桌椅，几位昆仑派的弟子正在这里大
吃大喝，行酒猜拳。
LONG);

        set("exits", ([
                "west" : __DIR__"liangong",
                "northwest" : __DIR__"xiuxishi",
        ]));

        set("objects",([
                __DIR__"npc/puren" : 1,
                __DIR__"obj/rice" : 2,
                __DIR__"obj/xiangcha" : 1,
                __DIR__"obj/kaoya" : 1,
        ]));

        set("no_fight", 1);

        setup();
        replace_program(ROOM);
}