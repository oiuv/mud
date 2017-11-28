inherit ROOM;

void create()
{
        set("short", "石梁");
        set("long", @LONG
你走入山坞中，有一道石梁跨溪而建，这里是九渡涧的下
流，各岭之水均在此交汇景色极佳。附近设有许多小吃店，游
人至此，大多小住歇歇脚力。再往上就是陡峭的十八盘了。
LONG);
        set("exits", ([
                "northup"    : __DIR__"taizipo",
                "southup"    : __DIR__"shibapan",
                "east"       : __DIR__"shop",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
