inherit ROOM;

void create()
{
        set("short", "棂星门");
        set("long", @LONG
这里是南岳大庙的第一道门，由汉白玉，花岗石打就的石
牌坊。南岳衡山是祝融游息之地，道教奉为第三小洞天。在此
远望衡山，山势如飞，如云雾中凌空的大鸟。
LONG);
        set("exits", ([
                "north"  : __DIR__"kuixingge",
                "south"  : __DIR__"hengyang",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

