inherit ROOM;

void create()
{
        set("short", "紫霄宫大门");
        set("long", @LONG
你已走到了展旗峰下，前面就是武当山最为宏大的宫宇紫
霄宫了。殿宇依山而筑，高低错落有致。周围古木森森，翠竹
成林，景色清幽。这里是武当师徒的主要活动场所。
LONG);
        set("exits", ([
                "northdown"  : __DIR__"shijie2",
                "southup"    : __DIR__"guangchang",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
