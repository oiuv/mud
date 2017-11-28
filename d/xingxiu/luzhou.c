inherit ROOM;

void create()
{
        set("short", "沙漠绿洲");
        set("long", @LONG
你行至此地，发现在沙漠的尽头出现了一个绿洲。灌木丛
中有一眼坎儿井。井台上有一个木杯专供口渴的行人喝水。井
边是一块瓜地。
LONG);
        set("resource/water", 1);
        set("exits", ([
                "northeast" : __DIR__"shanjiao",
                "southwest" : __DIR__"nanjiang3",
        ]));

        set("objects", ([
            	__DIR__"obj/hamigua" : 2,
        ]));

        set("outdoors", "xiyu");
        set("no_map", "这里的地形令人迷惑，无法绘制地图。\n");
        setup();
}
