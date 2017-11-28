inherit ROOM;

void create()
{
        set("short", "小吃店");
        set("long", @LONG
你一走进来，就闻到一股浓浓的小吃香味，人站在门口就
有一种想好好吃一顿的感觉。几张八仙桌一字排开，坐满了客
人，或高声谈笑，或交头接耳。你如果想打听打听江湖上的掌
故和谣言，这里倒是个好所在。小二在桌子之间穿来穿去，忙
得根本就来及招呼你。
LONG);
        set("resource/water", 1);
        set("exits", ([
                "east" : __DIR__"beidajie2",
        ]));
        set("objects", ([
                __DIR__"npc/xiaoer2" : 1,
        ]));

        setup();
        replace_program(ROOM);
}

